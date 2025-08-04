#!/usr/bin/env node

const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Test webhook payload
const testPayload = {
  id: 'evt_test_webhook',
  object: 'event',
  api_version: '2024-06-20',
  created: Math.floor(Date.now() / 1000),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123',
      object: 'checkout.session',
      customer_email: 'test@revolutionary-ui.com',
      customer_details: {
        name: 'Test User',
        email: 'test@revolutionary-ui.com'
      },
      subscription: 'sub_test_123',
      customer: 'cus_test_123',
      price_id: process.env.STRIPE_PRICE_EARLY_BIRD_MONTHLY || 'price_test_123'
    }
  }
};

async function testWebhook() {
  console.log('🧪 Testing webhook endpoint locally...\n');
  
  const webhookUrl = 'http://localhost:3000/api/webhooks/stripe';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not found in environment');
    return;
  }
  
  // Create signature
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify(testPayload);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload)
    .digest('hex');
  
  const stripeSignature = `t=${timestamp},v1=${signature}`;
  
  try {
    console.log('📤 Sending test webhook to:', webhookUrl);
    console.log('   Event type:', testPayload.type);
    console.log('   Customer email:', testPayload.data.object.customer_email);
    
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature
      }
    });
    
    console.log('\n✅ Webhook response:', response.status, response.statusText);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    
    console.log('\n📋 What should have happened:');
    console.log('   1. User created/found: test@revolutionary-ui.com');
    console.log('   2. Subscription created with Early Bird tier');
    console.log('   3. Welcome notification sent');
    console.log('   4. Features assigned to user');
    
  } catch (error) {
    console.error('\n❌ Webhook test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Ensure the marketplace is running: npm run dev');
    console.log('   2. Check STRIPE_WEBHOOK_SECRET is set correctly');
    console.log('   3. Verify database connection is working');
  }
}

// Also create a mock Stripe subscription object
async function createMockSubscription() {
  console.log('\n🔧 Creating mock subscription for testing...\n');
  
  const mockSubscription = {
    id: 'sub_test_123',
    object: 'subscription',
    customer: 'cus_test_123',
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    cancel_at_period_end: false,
    items: {
      data: [{
        price: {
          id: process.env.STRIPE_PRICE_EARLY_BIRD_MONTHLY || 'price_test_123'
        }
      }]
    }
  };
  
  console.log('📄 Mock subscription created:');
  console.log(JSON.stringify(mockSubscription, null, 2));
  
  return mockSubscription;
}

testWebhook();