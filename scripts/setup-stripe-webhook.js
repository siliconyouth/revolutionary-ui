#!/usr/bin/env node

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

async function setupWebhook() {
  console.log('🔗 Setting up Stripe webhook endpoint...\n');
  
  const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`
    : 'https://revolutionary-ui.com/api/webhooks/stripe';
  
  try {
    // Check if webhook already exists
    const existingWebhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    const existing = existingWebhooks.data.find(wh => wh.url === webhookUrl);
    
    if (existing) {
      console.log('⚠️  Webhook already exists:', existing.id);
      console.log('   URL:', existing.url);
      console.log('   Status:', existing.status);
      console.log('   Events:', existing.enabled_events.length, 'events configured');
      
      // Update events if needed
      const webhook = await stripe.webhookEndpoints.update(existing.id, {
        enabled_events: [
          'checkout.session.completed',
          'customer.subscription.created',
          'customer.subscription.updated',
          'customer.subscription.deleted',
          'invoice.payment_succeeded',
          'invoice.payment_failed',
          'customer.subscription.trial_will_end',
        ]
      });
      
      console.log('\n✅ Webhook updated successfully!');
      console.log('\n🔑 Webhook signing secret:', webhook.secret);
      console.log('\n⚠️  Add this to your .env.local:');
      console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
      
    } else {
      // Create new webhook
      const webhook = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: [
          'checkout.session.completed',
          'customer.subscription.created',
          'customer.subscription.updated',
          'customer.subscription.deleted',
          'invoice.payment_succeeded',
          'invoice.payment_failed',
          'customer.subscription.trial_will_end',
        ]
      });
      
      console.log('✅ Webhook created successfully!');
      console.log('\n📋 Webhook Details:');
      console.log('   ID:', webhook.id);
      console.log('   URL:', webhook.url);
      console.log('   Status:', webhook.status);
      console.log('\n🔑 Webhook signing secret:', webhook.secret);
      console.log('\n⚠️  Add this to your .env.local:');
      console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    }
    
    console.log('\n📚 Webhook Events Configured:');
    console.log('   ✓ checkout.session.completed - New subscription from checkout');
    console.log('   ✓ customer.subscription.created - Subscription created');
    console.log('   ✓ customer.subscription.updated - Plan changes');
    console.log('   ✓ customer.subscription.deleted - Cancellations');
    console.log('   ✓ invoice.payment_succeeded - Successful payments');
    console.log('   ✓ invoice.payment_failed - Failed payments');
    console.log('   ✓ customer.subscription.trial_will_end - Trial ending alerts');
    
    console.log('\n🧪 Testing Instructions:');
    console.log('1. For local testing, use Stripe CLI:');
    console.log('   stripe listen --forward-to localhost:3000/api/webhooks/stripe');
    console.log('\n2. For production, ensure your webhook URL is accessible:');
    console.log('   ' + webhookUrl);
    console.log('\n3. Test webhook with:');
    console.log('   stripe trigger checkout.session.completed');
    
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    process.exit(1);
  }
}

setupWebhook();