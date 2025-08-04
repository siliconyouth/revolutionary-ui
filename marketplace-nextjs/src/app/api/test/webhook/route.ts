import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { eventType, email, tier } = await req.json()
    
    // Get the webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }
    
    // Create test event payload based on event type
    let testPayload: any = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2024-06-20',
      created: Math.floor(Date.now() / 1000),
      type: eventType,
      data: {
        object: {}
      }
    }
    
    // Customize payload based on event type
    switch (eventType) {
      case 'checkout.session.completed':
        testPayload.data.object = {
          id: `cs_test_${Date.now()}`,
          object: 'checkout.session',
          customer_email: email,
          customer_details: {
            name: 'Test User',
            email: email
          },
          subscription: `sub_test_${Date.now()}`,
          customer: `cus_test_${Date.now()}`,
          price_id: getPriceIdForTier(tier)
        }
        break
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        testPayload.data.object = {
          id: `sub_test_${Date.now()}`,
          object: 'subscription',
          customer: `cus_test_${Date.now()}`,
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          cancel_at_period_end: false,
          items: {
            data: [{
              price: {
                id: getPriceIdForTier(tier)
              }
            }]
          }
        }
        break
        
      case 'customer.subscription.deleted':
        testPayload.data.object = {
          id: `sub_test_${Date.now()}`,
          object: 'subscription',
          customer: `cus_test_${Date.now()}`,
          status: 'canceled'
        }
        break
        
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        testPayload.data.object = {
          id: `in_test_${Date.now()}`,
          object: 'invoice',
          customer: `cus_test_${Date.now()}`,
          subscription: `sub_test_${Date.now()}`,
          amount_paid: eventType === 'invoice.payment_succeeded' ? getPriceForTier(tier) : 0,
          amount_due: getPriceForTier(tier),
          currency: 'usd',
          period_start: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
          period_end: Math.floor(Date.now() / 1000),
          attempt_count: eventType === 'invoice.payment_failed' ? 3 : 1,
          invoice_pdf: 'https://pay.stripe.com/invoice/test_pdf',
          hosted_invoice_url: 'https://pay.stripe.com/invoice/test'
        }
        
        if (eventType === 'invoice.payment_failed') {
          testPayload.data.object.last_finalization_error = {
            message: 'Your card was declined.'
          }
        }
        break
        
      case 'customer.subscription.trial_will_end':
        testPayload.data.object = {
          id: `sub_test_${Date.now()}`,
          object: 'subscription',
          customer: `cus_test_${Date.now()}`,
          status: 'trialing',
          trial_end: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60) // 3 days from now
        }
        break
    }
    
    // Create signature for the webhook
    const timestamp = Math.floor(Date.now() / 1000)
    const payload = JSON.stringify(testPayload)
    const signedPayload = `${timestamp}.${payload}`
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex')
    
    const stripeSignature = `t=${timestamp},v1=${signature}`
    
    // Get the current host
    const host = (await headers()).get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const webhookUrl = `${protocol}://${host}/api/webhooks/stripe`
    
    // Send the webhook to our endpoint
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature
      },
      body: payload
    })
    
    const result = await response.json()
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      event: {
        type: eventType,
        email,
        tier
      },
      webhookResponse: result,
      testPayload: testPayload
    })
    
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json(
      { error: 'Failed to test webhook', details: error.message },
      { status: 500 }
    )
  }
}

function getPriceIdForTier(tier: string): string {
  const priceMap = {
    beta_tester: 'price_beta_free',
    early_bird: process.env.STRIPE_PRICE_EARLY_BIRD_MONTHLY || 'price_1RsDmqAlB5kkCVbopkhO7iJA',
    personal: process.env.STRIPE_PRICE_PERSONAL_MONTHLY || 'price_1RsDmrAlB5kkCVbocB8ajh8K',
    company: process.env.STRIPE_PRICE_COMPANY_MONTHLY || 'price_1RsEAyAlB5kkCVbooqG92Ifp',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_1RsDmtAlB5kkCVbot6QZ9mXT'
  }
  return priceMap[tier] || priceMap.personal
}

function getPriceForTier(tier: string): number {
  const priceMap = {
    beta_tester: 0,
    early_bird: 999,
    personal: 1999,
    company: 4999,
    enterprise: 9999
  }
  return priceMap[tier] || 1999
}