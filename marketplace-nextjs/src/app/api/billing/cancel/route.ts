import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })
    }

    // Cancel the subscription at period end
    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })

    // Update our database
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        status: 'canceling'
      }
    })

    // Create a notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'PRICING_UPDATE',
        title: 'Subscription Cancellation',
        content: `Your subscription has been scheduled for cancellation. You'll continue to have access until ${new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString()}.`,
        metadata: {
          subscriptionId,
          cancelDate: stripeSubscription.current_period_end
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cancel error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}