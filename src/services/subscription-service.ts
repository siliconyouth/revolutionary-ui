// Revolutionary UI - Subscription Service
// Handles feature access, usage tracking, and subscription management

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { 
  SubscriptionTier, 
  FeatureFlag, 
  TierLimits,
  FeatureAccess,
  LimitCheck
} from '../types/subscription';
import { ConfigDatabaseService } from './config-database-service';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

export class SubscriptionService {
  private static configService = ConfigDatabaseService.getInstance();

  /**
   * Check if a user has access to a specific feature
   */
  static async hasFeatureAccess(
    userId: string, 
    feature: FeatureFlag
  ): Promise<FeatureAccess> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return {
          feature,
          hasAccess: false,
          reason: 'No active subscription found'
        };
      }
      
      // Get tier features from database
      const tierFeatures = await this.configService.getTierFeatures();
      const tierConfig = tierFeatures[subscription.tier];
      
      if (!tierConfig) {
        return {
          feature,
          hasAccess: false,
          reason: 'Invalid subscription tier'
        };
      }
      
      const hasAccess = tierConfig.features && tierConfig.features[feature] === true;
      
      // Track feature usage for analytics
      if (hasAccess) {
        await this.trackFeatureUsage(userId, feature);
      }
      
      return {
        feature,
        hasAccess,
        reason: hasAccess ? undefined : 'Feature not available in your plan'
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        feature,
        hasAccess: false,
        reason: 'Error checking feature access'
      };
    }
  }
  
  /**
   * Check if user is within usage limits
   */
  static async checkUsageLimit(
    userId: string,
    limitType: keyof TierLimits
  ): Promise<LimitCheck> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return {
          limitType,
          current: 0,
          limit: 0,
          hasCapacity: false,
          reason: 'No active subscription'
        };
      }
      
      // Get tier features from database
      const tierFeatures = await this.configService.getTierFeatures();
      const tierConfig = tierFeatures[subscription.tier];
      
      if (!tierConfig || !tierConfig.limits) {
        return {
          limitType,
          current: 0,
          limit: 0,
          hasCapacity: false,
          reason: 'Invalid tier configuration'
        };
      }
      
      const limit = tierConfig.limits[limitType] || 0;
      const current = await this.getCurrentUsage(userId, limitType);
      
      // -1 means unlimited
      const hasCapacity = limit === -1 || current < limit;
      
      return {
        limitType,
        current,
        limit,
        hasCapacity,
        remaining: limit === -1 ? -1 : Math.max(0, limit - current),
        reason: hasCapacity ? undefined : 'Usage limit reached'
      };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return {
        limitType,
        current: 0,
        limit: 0,
        hasCapacity: false,
        reason: 'Error checking usage limit'
      };
    }
  }
  
  /**
   * Track feature usage for a user
   */
  static async trackFeatureUsage(
    userId: string, 
    feature: FeatureFlag
  ): Promise<void> {
    try {
      await prisma.featureUsage.create({
        data: {
          userId,
          feature,
          metadata: {
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }
  
  /**
   * Track usage metrics
   */
  static async trackUsage(
    userId: string,
    metric: keyof TierLimits,
    value: number = 1
  ): Promise<void> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return;
      
      const period = this.getCurrentPeriod();
      
      await prisma.usageRecord.upsert({
        where: {
          userId_subscriptionId_metric_period: {
            userId,
            subscriptionId: subscription.id,
            metric,
            period
          }
        },
        update: {
          value: {
            increment: value
          }
        },
        create: {
          userId,
          subscriptionId: subscription.id,
          metric,
          period,
          value
        }
      });
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }
  
  /**
   * Get current usage for a specific metric
   */
  static async getCurrentUsage(
    userId: string,
    metric: keyof TierLimits
  ): Promise<number> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return 0;
      
      const period = this.getCurrentPeriod();
      
      const usageRecord = await prisma.usageRecord.findUnique({
        where: {
          userId_subscriptionId_metric_period: {
            userId,
            subscriptionId: subscription.id,
            metric,
            period
          }
        }
      });
      
      return usageRecord?.value || 0;
    } catch (error) {
      console.error('Error getting current usage:', error);
      return 0;
    }
  }
  
  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string) {
    try {
      return await prisma.subscription.findUnique({
        where: { userId },
        include: {
          user: true
        }
      });
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }
  
  /**
   * Create or update a subscription
   */
  static async createOrUpdateSubscription(
    userId: string,
    tier: SubscriptionTier,
    stripeSubscriptionId?: string
  ) {
    try {
      const existingSubscription = await this.getUserSubscription(userId);
      
      if (existingSubscription) {
        return await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            tier,
            stripeSubscriptionId,
            status: 'active',
            updatedAt: new Date()
          }
        });
      } else {
        return await prisma.subscription.create({
          data: {
            userId,
            tier,
            stripeSubscriptionId,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: this.getNextBillingDate()
          }
        });
      }
    } catch (error) {
      console.error('Error creating/updating subscription:', error);
      throw error;
    }
  }
  
  /**
   * Cancel a subscription
   */
  static async cancelSubscription(userId: string) {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        throw new Error('No subscription found');
      }
      
      // Cancel in Stripe if it exists
      if (subscription.stripeSubscriptionId) {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
      }
      
      // Update in database
      return await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
  
  /**
   * Get available features for a tier
   */
  static async getTierFeatures(tier: SubscriptionTier) {
    try {
      const tierFeatures = await this.configService.getTierFeatures();
      return tierFeatures[tier] || null;
    } catch (error) {
      console.error('Error getting tier features:', error);
      return null;
    }
  }
  
  /**
   * Get current billing period
   */
  private static getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }
  
  /**
   * Get next billing date (30 days from now)
   */
  private static getNextBillingDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }
  
  /**
   * Sync subscription with Stripe
   */
  static async syncWithStripe(stripeSubscriptionId: string) {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      
      // Map Stripe status to our status
      const status = this.mapStripeStatus(stripeSubscription.status);
      
      // Find and update the subscription
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId }
      });
      
      if (subscription) {
        return await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            updatedAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error syncing with Stripe:', error);
      throw error;
    }
  }
  
  /**
   * Map Stripe status to our status
   */
  private static mapStripeStatus(stripeStatus: string): string {
    const statusMap: Record<string, string> = {
      'active': 'active',
      'past_due': 'past_due',
      'unpaid': 'unpaid',
      'canceled': 'canceled',
      'incomplete': 'incomplete',
      'incomplete_expired': 'expired',
      'trialing': 'trialing',
      'paused': 'paused'
    };
    
    return statusMap[stripeStatus] || 'unknown';
  }
}