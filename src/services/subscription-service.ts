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
import { TIER_FEATURES, tierHelpers } from '../../config/tier-features';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
});

export class SubscriptionService {
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
      
      const hasAccess = tierHelpers.hasFeature(subscription.tier, feature);
      
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
   * Check if a user is within their usage limits
   */
  static async checkLimit(
    userId: string,
    limit: keyof TierLimits
  ): Promise<LimitCheck> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return {
          limit,
          current: 0,
          max: 0,
          isWithinLimit: false,
          percentageUsed: 100
        };
      }
      
      const maxLimit = tierHelpers.getLimit(subscription.tier, limit);
      const currentUsage = await this.getCurrentUsage(userId, limit);
      
      const isWithinLimit = maxLimit === Infinity || currentUsage < maxLimit;
      const percentageUsed = maxLimit === Infinity ? 0 : (currentUsage / maxLimit) * 100;
      
      return {
        limit,
        current: currentUsage,
        max: maxLimit === Infinity ? -1 : maxLimit,
        isWithinLimit,
        percentageUsed
      };
    } catch (error) {
      console.error('Error checking limit:', error);
      throw error;
    }
  }
  
  /**
   * Increment usage for a specific metric
   */
  static async incrementUsage(
    userId: string,
    metric: keyof TierLimits,
    amount: number = 1
  ): Promise<boolean> {
    try {
      // Check if within limits first
      const limitCheck = await this.checkLimit(userId, metric);
      
      if (!limitCheck.isWithinLimit) {
        throw new Error(`Usage limit exceeded for ${metric}`);
      }
      
      const period = this.getUsagePeriod(metric);
      
      await prisma.usageRecord.upsert({
        where: {
          userId_metric_period: {
            userId,
            metric,
            period
          }
        },
        update: {
          value: {
            increment: amount
          }
        },
        create: {
          userId,
          subscriptionId: (await this.getUserSubscription(userId))!.id,
          metric,
          value: amount,
          period
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }
  
  /**
   * Get current usage for a metric
   */
  static async getCurrentUsage(
    userId: string,
    metric: keyof TierLimits
  ): Promise<number> {
    try {
      const period = this.getUsagePeriod(metric);
      
      const record = await prisma.usageRecord.findUnique({
        where: {
          userId_metric_period: {
            userId,
            metric,
            period
          }
        }
      });
      
      return record?.value || 0;
    } catch (error) {
      console.error('Error getting current usage:', error);
      return 0;
    }
  }
  
  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string) {
    return await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });
  }
  
  /**
   * Create or update subscription from Stripe webhook
   */
  static async syncFromStripe(
    stripeSubscription: Stripe.Subscription,
    userId: string
  ) {
    try {
      const productId = stripeSubscription.items.data[0].price.product as string;
      const tier = tierHelpers.getTierByStripeProductId(productId);
      
      if (!tier) {
        throw new Error(`Unknown product ID: ${productId}`);
      }
      
      const subscription = await prisma.subscription.upsert({
        where: {
          stripeSubscriptionId: stripeSubscription.id
        },
        update: {
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          stripePriceId: stripeSubscription.items.data[0].price.id,
          metadata: stripeSubscription.metadata
        },
        create: {
          userId,
          tier,
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: stripeSubscription.customer as string,
          stripePriceId: stripeSubscription.items.data[0].price.id,
          status: stripeSubscription.status,
          billingPeriod: stripeSubscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
          trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
          metadata: stripeSubscription.metadata
        }
      });
      
      return subscription;
    } catch (error) {
      console.error('Error syncing subscription from Stripe:', error);
      throw error;
    }
  }
  
  /**
   * Get all features and limits for a user
   */
  static async getUserAccessSummary(userId: string) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return {
          tier: null,
          features: {},
          limits: {},
          usage: {}
        };
      }
      
      const features = tierHelpers.getAllFeatures(subscription.tier);
      const limits = tierHelpers.getAllLimits(subscription.tier);
      
      // Get current usage for all metrics
      const usage: Record<string, number> = {};
      for (const metric of Object.keys(limits)) {
        usage[metric] = await this.getCurrentUsage(userId, metric as keyof TierLimits);
      }
      
      return {
        tier: subscription.tier,
        features,
        limits,
        usage
      };
    } catch (error) {
      console.error('Error getting user access summary:', error);
      throw error;
    }
  }
  
  /**
   * Check if user can perform team operations
   */
  static async canManageTeam(userId: string, teamId: string): Promise<boolean> {
    try {
      const hasTeamFeature = await this.hasFeatureAccess(userId, FeatureFlag.TEAM_COLLABORATION);
      if (!hasTeamFeature.hasAccess) return false;
      
      const teamMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId
          }
        }
      });
      
      return teamMember?.role === 'owner' || teamMember?.role === 'admin';
    } catch (error) {
      console.error('Error checking team management access:', error);
      return false;
    }
  }
  
  /**
   * Track feature usage for analytics
   */
  private static async trackFeatureUsage(userId: string, feature: FeatureFlag) {
    try {
      await prisma.featureUsage.create({
        data: {
          userId,
          feature
        }
      });
    } catch (error) {
      // Don't throw, just log - this is for analytics only
      console.error('Error tracking feature usage:', error);
    }
  }
  
  /**
   * Get the period string for a metric
   */
  private static getUsagePeriod(metric: keyof TierLimits): string {
    const now = new Date();
    
    if (metric.includes('monthly')) {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else if (metric.includes('daily')) {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else {
      // Default to monthly
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
  }
}