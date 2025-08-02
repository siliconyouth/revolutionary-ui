import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanByPriceId } from '@/lib/stripe/plans'

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
])

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
  
  let event: any
  
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
  
  const supabase = await createClient()
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        
        // Get user by customer email
        const { data: users } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', session.customer_email)
          .single()
        
        const userData = users ? { user: { id: users.id, email: users.email } } : null
        
        if (!userData?.user) {
          throw new Error('User not found')
        }
        
        // Create or update subscription
        const plan = getPlanByPriceId(session.price_id)
        if (!plan) {
          throw new Error('Plan not found')
        }
        
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userData.user.id,
            plan: plan.id,
            status: 'active',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            stripe_price_id: session.price_id,
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            updated_at: new Date()
          })
        
        if (error) throw error
        
        // Record billing event
        await supabase
          .from('billing_events')
          .insert({
            user_id: userData.user.id,
            event_type: 'checkout.completed',
            stripe_event_id: event.id,
            data: session
          })
        
        break
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        // Get user by stripe customer id
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()
        
        if (!subData) {
          console.error('Subscription not found for customer:', subscription.customer)
          return NextResponse.json({ received: true })
        }
        
        const plan = getPlanByPriceId(subscription.items.data[0].price.id)
        if (!plan) {
          throw new Error('Plan not found')
        }
        
        // Update subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            plan: plan.id,
            status: subscription.status,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000) 
              : null,
            updated_at: new Date()
          })
          .eq('stripe_customer_id', subscription.customer)
        
        if (error) throw error
        
        // Record billing event
        await supabase
          .from('billing_events')
          .insert({
            user_id: subData.user_id,
            event_type: event.type,
            stripe_event_id: event.id,
            data: subscription
          })
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // Get user by stripe customer id
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()
        
        if (!subData) {
          console.error('Subscription not found for customer:', subscription.customer)
          return NextResponse.json({ received: true })
        }
        
        // Update subscription to canceled
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date()
          })
          .eq('stripe_customer_id', subscription.customer)
        
        if (error) throw error
        
        // Record billing event
        await supabase
          .from('billing_events')
          .insert({
            user_id: subData.user_id,
            event_type: 'subscription.canceled',
            stripe_event_id: event.id,
            data: subscription
          })
        
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        
        // Record payment
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', invoice.customer)
          .single()
        
        if (subData) {
          await supabase
            .from('billing_events')
            .insert({
              user_id: subData.user_id,
              event_type: 'payment.succeeded',
              stripe_event_id: event.id,
              data: {
                amount: invoice.amount_paid,
                currency: invoice.currency,
                invoice_id: invoice.id
              }
            })
        }
        
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        
        // Update subscription status
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', invoice.customer)
          .single()
        
        if (subData) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date()
            })
            .eq('stripe_customer_id', invoice.customer)
          
          await supabase
            .from('billing_events')
            .insert({
              user_id: subData.user_id,
              event_type: 'payment.failed',
              stripe_event_id: event.id,
              data: {
                amount: invoice.amount_due,
                currency: invoice.currency,
                invoice_id: invoice.id,
                attempt_count: invoice.attempt_count
              }
            })
        }
        
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
  }
}