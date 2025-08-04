import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

// Price IDs for each tier and billing period
const STRIPE_PRICE_IDS = {
  personal: {
    monthly: process.env.STRIPE_PRICE_ID_PERSONAL_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_ID_PERSONAL_YEARLY!
  },
  company: {
    monthly: process.env.STRIPE_PRICE_ID_COMPANY_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_ID_COMPANY_YEARLY!
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY!
  }
}

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null
    
    // Check for test user cookie first (for development)
    const cookieStore = await cookies()
    const testUserId = cookieStore.get('test-user-id')?.value
    
    if (testUserId) {
      userId = testUserId
    } else {
      // Fall back to Supabase auth
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { newTier, billingPeriod = 'monthly' } = body

    if (!newTier) {
      return NextResponse.json({ error: 'New tier required' }, { status: 400 })
    }

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Don't allow downgrade from beta_tester or early_bird
    if ((subscription.tier === 'beta_tester' || subscription.tier === 'early_bird') && 
        (newTier === 'personal' || newTier === 'free')) {
      return NextResponse.json({ 
        error: 'Cannot downgrade from special pricing tier. Your current plan includes all features.' 
      }, { status: 400 })
    }

    // Get the new price ID
    const priceId = STRIPE_PRICE_IDS[newTier as keyof typeof STRIPE_PRICE_IDS]?.[billingPeriod as 'monthly' | 'yearly']
    
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier or billing period' }, { status: 400 })
    }

    // Get the current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)

    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: priceId
      }],
      proration_behavior: 'create_prorations' // This will credit/charge the difference
    })

    // Update our database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        tier: newTier,
        billingPeriod,
        stripePriceId: priceId,
        updatedAt: new Date()
      }
    })

    // Create a notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'PRICING_UPDATE',
        title: 'Subscription Updated',
        content: `Your subscription has been ${subscription.tier < newTier ? 'upgraded' : 'changed'} to ${newTier} (${billingPeriod})`,
        metadata: {
          oldTier: subscription.tier,
          newTier,
          billingPeriod
        }
      }
    })

    // Track the change for analytics
    await prisma.usageRecord.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        metric: 'subscription_change',
        value: 1,
        period: new Date().toISOString().substring(0, 7), // YYYY-MM format
        metadata: {
          from: subscription.tier,
          to: newTier,
          billingPeriod
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      subscription: updatedSubscription,
      message: `Successfully ${subscription.tier < newTier ? 'upgraded' : 'changed'} to ${newTier}`
    })

  } catch (error: any) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    )
  }
}