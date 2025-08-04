// Stripe Webhook Handler for Updated Pricing
// Handles subscription events with new tier features and pricing

import { Stripe } from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Updated tier configurations
export const TIER_CONFIGS = {
  beta_tester: {
    features: {
      ai_generations_monthly: -1, // Unlimited
      private_components: -1, // Unlimited
      storage_gb: 20,
      api_calls_daily: 2000,
      bandwidth_gb_monthly: 200,
      concurrent_builds: 5,
      component_versions: -1,
      marketplace_downloads_monthly: -1
    }
  },
  early_bird: {
    features: {
      ai_generations_monthly: -1, // Unlimited
      private_components: -1, // Unlimited
      storage_gb: 20,
      api_calls_daily: 2000,
      bandwidth_gb_monthly: 200,
      concurrent_builds: 5,
      component_versions: -1,
      marketplace_downloads_monthly: -1
    }
  },
  personal: {
    features: {
      ai_generations_monthly: -1,
      private_components: -1,
      storage_gb: 20,
      api_calls_daily: 2000,
      bandwidth_gb_monthly: 200,
      concurrent_builds: 5,
      component_versions: -1,
      marketplace_downloads_monthly: -1
    }
  },
  company: {
    features: {
      ai_generations_monthly: -1,
      private_components: -1,
      team_members: 10,
      storage_gb: 100,
      api_calls_daily: 10000,
      bandwidth_gb_monthly: 1000,
      concurrent_builds: 10,
      component_versions: -1,
      marketplace_downloads_monthly: -1
    }
  },
  enterprise: {
    features: {
      ai_generations_monthly: -1,
      private_components: -1,
      team_members: -1,
      storage_gb: -1,
      api_calls_daily: -1,
      bandwidth_gb_monthly: -1,
      concurrent_builds: -1,
      component_versions: -1,
      marketplace_downloads_monthly: -1
    }
  }
};

// Map Stripe price IDs to tiers
export const PRICE_TO_TIER_MAP: Record<string, { tier: string; interval: 'month' | 'year' }> = {
  // Early Bird
  [process.env.STRIPE_PRICE_EARLY_BIRD_MONTHLY!]: { tier: 'early_bird', interval: 'month' },
  [process.env.STRIPE_PRICE_EARLY_BIRD_YEARLY!]: { tier: 'early_bird', interval: 'year' },
  
  // Personal
  [process.env.STRIPE_PRICE_PERSONAL_MONTHLY!]: { tier: 'personal', interval: 'month' },
  [process.env.STRIPE_PRICE_PERSONAL_YEARLY!]: { tier: 'personal', interval: 'year' },
  
  // Company (Updated prices)
  [process.env.STRIPE_PRICE_COMPANY_MONTHLY!]: { tier: 'company', interval: 'month' },
  [process.env.STRIPE_PRICE_COMPANY_YEARLY!]: { tier: 'company', interval: 'year' },
  
  // Enterprise
  [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!]: { tier: 'enterprise', interval: 'month' },
  [process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!]: { tier: 'enterprise', interval: 'year' }
};

export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0].price.id;
  const tierInfo = PRICE_TO_TIER_MAP[priceId];
  
  if (!tierInfo) {
    console.error(`Unknown price ID: ${priceId}`);
    return;
  }
  
  const userId = subscription.metadata.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }
  
  // Create or update subscription record
  await prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: subscription.id
    },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      metadata: {
        ...subscription.metadata,
        features: TIER_CONFIGS[tierInfo.tier].features
      }
    },
    create: {
      userId,
      tier: tierInfo.tier,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: priceId,
      status: subscription.status,
      billingPeriod: tierInfo.interval === 'year' ? 'yearly' : 'monthly',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      metadata: {
        ...subscription.metadata,
        features: TIER_CONFIGS[tierInfo.tier].features
      }
    }
  });
  
  console.log(`✅ Subscription created/updated for user ${userId} - Tier: ${tierInfo.tier}`);
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Handle plan changes
  const priceId = subscription.items.data[0].price.id;
  const tierInfo = PRICE_TO_TIER_MAP[priceId];
  
  if (!tierInfo) {
    console.error(`Unknown price ID: ${priceId}`);
    return;
  }
  
  await prisma.subscription.update({
    where: {
      stripeSubscriptionId: subscription.id
    },
    data: {
      tier: tierInfo.tier,
      stripePriceId: priceId,
      status: subscription.status,
      billingPeriod: tierInfo.interval === 'year' ? 'yearly' : 'monthly',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata: {
        features: TIER_CONFIGS[tierInfo.tier].features
      }
    }
  });
  
  console.log(`✅ Subscription updated - New tier: ${tierInfo.tier}`);
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: {
      stripeSubscriptionId: subscription.id
    },
    data: {
      status: 'cancelled',
      cancelAtPeriodEnd: true
    }
  });
  
  console.log(`✅ Subscription cancelled: ${subscription.id}`);
}