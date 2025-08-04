import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const prisma = new PrismaClient()

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.trial_will_end',
])

// Map Stripe price IDs to our tier names
const PRICE_TO_TIER_MAP: Record<string, string> = {
  // Monthly prices
  [process.env.STRIPE_PRICE_EARLY_BIRD_MONTHLY!]: 'early_bird',
  [process.env.STRIPE_PRICE_PERSONAL_MONTHLY!]: 'personal',
  [process.env.STRIPE_PRICE_COMPANY_MONTHLY!]: 'company',
  [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!]: 'enterprise',
  // Yearly prices
  [process.env.STRIPE_PRICE_EARLY_BIRD_YEARLY!]: 'early_bird',
  [process.env.STRIPE_PRICE_PERSONAL_YEARLY!]: 'personal',
  [process.env.STRIPE_PRICE_COMPANY_YEARLY!]: 'company',
  [process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!]: 'enterprise',
}

function getTierFromPriceId(priceId: string): string | null {
  return PRICE_TO_TIER_MAP[priceId] || null
}

function isYearlyPrice(priceId: string): boolean {
  const yearlyPrices = [
    process.env.STRIPE_PRICE_EARLY_BIRD_YEARLY,
    process.env.STRIPE_PRICE_PERSONAL_YEARLY,
    process.env.STRIPE_PRICE_COMPANY_YEARLY,
    process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
  ]
  return yearlyPrices.includes(priceId)
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing stripe signature or webhook secret' },
      { status: 400 }
    )
  }
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }
  
  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true })
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (!session.customer_email || !session.subscription) {
          throw new Error('Missing customer email or subscription ID')
        }
        
        // Get or create user
        let user = await prisma.user.findUnique({
          where: { email: session.customer_email }
        })
        
        if (!user) {
          // Create user if doesn't exist (for new signups via checkout)
          user = await prisma.user.create({
            data: {
              email: session.customer_email,
              name: session.customer_details?.name || session.customer_email.split('@')[0],
              role: 'USER'
            }
          })
        }
        
        // Get the subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        
        const priceId = subscription.items.data[0].price.id
        const tier = getTierFromPriceId(priceId)
        
        if (!tier) {
          throw new Error(`Unknown price ID: ${priceId}`)
        }
        
        // Create or update subscription in our database
        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            tier,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: priceId,
            status: subscription.status,
            billingPeriod: isYearlyPrice(priceId) ? 'yearly' : 'monthly',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            metadata: {
              checkoutSessionId: session.id,
              features: getFeaturesByTier(tier)
            }
          },
          update: {
            tier,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: priceId,
            status: subscription.status,
            billingPeriod: isYearlyPrice(priceId) ? 'yearly' : 'monthly',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            metadata: {
              checkoutSessionId: session.id,
              features: getFeaturesByTier(tier)
            }
          }
        })
        
        // Send welcome notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SYSTEM_UPDATE',
            title: '🎉 Welcome to Revolutionary UI!',
            message: `Your ${tier.replace('_', ' ')} subscription is now active. Start building amazing components!`
          }
        })
        
        break
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find subscription by Stripe ID
        const existingSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        })
        
        if (!existingSubscription) {
          console.error('Subscription not found:', subscription.id)
          return NextResponse.json({ received: true })
        }
        
        const priceId = subscription.items.data[0].price.id
        const tier = getTierFromPriceId(priceId)
        
        if (!tier) {
          throw new Error(`Unknown price ID: ${priceId}`)
        }
        
        // Update subscription
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            tier,
            stripePriceId: priceId,
            status: subscription.status,
            billingPeriod: isYearlyPrice(priceId) ? 'yearly' : 'monthly',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialStart: subscription.trial_start 
              ? new Date(subscription.trial_start * 1000) 
              : null,
            trialEnd: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000) 
              : null,
            metadata: {
              ...((existingSubscription.metadata as any) || {}),
              features: getFeaturesByTier(tier),
              lastUpdated: new Date().toISOString()
            }
          }
        })
        
        // Notify user of plan change if tier changed
        if (existingSubscription.tier !== tier) {
          await prisma.notification.create({
            data: {
              userId: existingSubscription.userId,
              type: 'SYSTEM_UPDATE',
              title: '📋 Subscription Updated',
              message: `Your subscription has been updated to ${tier.replace('_', ' ')}. New features are now available!`
            }
          })
        }
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find and update subscription
        const existingSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        })
        
        if (!existingSubscription) {
          console.error('Subscription not found:', subscription.id)
          return NextResponse.json({ received: true })
        }
        
        // Update subscription status to cancelled
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'cancelled',
            metadata: {
              ...((existingSubscription.metadata as any) || {}),
              cancelledAt: new Date().toISOString()
            }
          }
        })
        
        // Notify user
        await prisma.notification.create({
          data: {
            userId: existingSubscription.userId,
            type: 'SYSTEM_UPDATE',
            title: '😢 Subscription Cancelled',
            message: 'Your subscription has been cancelled. You can resubscribe anytime to regain access to premium features.'
          }
        })
        
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (!invoice.subscription) {
          return NextResponse.json({ received: true })
        }
        
        // Find subscription
        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string }
        })
        
        if (!subscription) {
          console.error('Subscription not found for invoice:', invoice.id)
          return NextResponse.json({ received: true })
        }
        
        // Create invoice record
        await prisma.invoice.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            stripeInvoiceId: invoice.id,
            status: 'paid',
            amount: invoice.amount_paid,
            currency: invoice.currency,
            periodStart: new Date(invoice.period_start * 1000),
            periodEnd: new Date(invoice.period_end * 1000),
            paidAt: new Date(),
            metadata: {
              invoice_pdf: invoice.invoice_pdf,
              hosted_invoice_url: invoice.hosted_invoice_url,
              receipt_number: invoice.receipt_number
            }
          }
        })
        
        // Reset usage for the new billing period
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
        await prisma.usageRecord.deleteMany({
          where: {
            userId: subscription.userId,
            period: currentMonth
          }
        })
        
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (!invoice.subscription) {
          return NextResponse.json({ received: true })
        }
        
        // Find subscription
        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string }
        })
        
        if (!subscription) {
          console.error('Subscription not found for invoice:', invoice.id)
          return NextResponse.json({ received: true })
        }
        
        // Update subscription status
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'past_due',
            metadata: {
              ...((subscription.metadata as any) || {}),
              lastPaymentFailure: new Date().toISOString(),
              failureReason: invoice.last_finalization_error?.message
            }
          }
        })
        
        // Create invoice record
        await prisma.invoice.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            stripeInvoiceId: invoice.id,
            status: 'unpaid',
            amount: invoice.amount_due,
            currency: invoice.currency,
            periodStart: new Date(invoice.period_start * 1000),
            periodEnd: new Date(invoice.period_end * 1000),
            dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
            metadata: {
              attempt_count: invoice.attempt_count,
              next_payment_attempt: invoice.next_payment_attempt,
              failure_message: invoice.last_finalization_error?.message
            }
          }
        })
        
        // Notify user
        await prisma.notification.create({
          data: {
            userId: subscription.userId,
            type: 'SYSTEM_UPDATE',
            title: '⚠️ Payment Failed',
            message: `We couldn't process your payment. Please update your payment method to maintain access to your ${subscription.tier.replace('_', ' ')} features.`,
            actionUrl: '/dashboard/billing',
            actionLabel: 'Update Payment Method'
          }
        })
        
        break
      }
      
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find subscription
        const existingSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        })
        
        if (!existingSubscription) {
          console.error('Subscription not found:', subscription.id)
          return NextResponse.json({ received: true })
        }
        
        // Notify user
        await prisma.notification.create({
          data: {
            userId: existingSubscription.userId,
            type: 'SYSTEM_UPDATE',
            title: '⏰ Trial Ending Soon',
            message: 'Your trial period will end in 3 days. Add a payment method to continue enjoying premium features.',
            actionUrl: '/dashboard/billing',
            actionLabel: 'Add Payment Method'
          }
        })
        
        break
      }
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to get features by tier
function getFeaturesByTier(tier: string) {
  const features: Record<string, any> = {
    beta_tester: {
      ai_generations_monthly: -1,
      private_components: -1,
      storage_gb: 20,
      api_calls_daily: 2000,
      bandwidth_gb_monthly: 200,
      team_members: 1,
      export_formats: 'all',
      component_versions: -1,
      marketplace_downloads_monthly: -1
    },
    early_bird: {
      ai_generations_monthly: -1,
      private_components: -1,
      storage_gb: 20,
      api_calls_daily: 2000,
      bandwidth_gb_monthly: 200,
      team_members: 1,
      export_formats: 'all',
      component_versions: -1,
      marketplace_downloads_monthly: -1
    },
    personal: {
      ai_generations_monthly: -1,
      private_components: -1,
      storage_gb: 20,
      api_calls_daily: 2000,
      bandwidth_gb_monthly: 200,
      team_members: 1,
      export_formats: 'all',
      component_versions: -1,
      marketplace_downloads_monthly: -1
    },
    company: {
      ai_generations_monthly: -1,
      private_components: -1,
      storage_gb: 100,
      api_calls_daily: 10000,
      bandwidth_gb_monthly: 1000,
      team_members: 10,
      export_formats: 'all',
      component_versions: -1,
      marketplace_downloads_monthly: -1
    },
    enterprise: {
      ai_generations_monthly: -1,
      private_components: -1,
      storage_gb: -1,
      api_calls_daily: -1,
      bandwidth_gb_monthly: -1,
      team_members: -1,
      export_formats: 'all',
      component_versions: -1,
      marketplace_downloads_monthly: -1
    }
  }
  
  return features[tier] || features.personal
}