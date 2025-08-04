#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

async function testSubscriptionFlow() {
  console.log('🧪 Testing Subscription Flow...\n');
  
  try {
    // 1. Create a test user
    console.log('1️⃣ Creating test user...');
    const testUser = await prisma.user.upsert({
      where: { email: 'test@revolutionary-ui.com' },
      update: {},
      create: {
        email: 'test@revolutionary-ui.com',
        name: 'Test User',
        role: 'USER'
      }
    });
    console.log(`✅ Test user: ${testUser.email}`);
    
    // 2. Create Stripe customer
    console.log('\n2️⃣ Creating Stripe customer...');
    const customer = await stripe.customers.create({
      email: testUser.email,
      name: testUser.name,
      metadata: {
        userId: testUser.id
      }
    });
    console.log(`✅ Stripe customer: ${customer.id}`);
    
    // 3. Get Early Bird price
    console.log('\n3️⃣ Fetching Early Bird price...');
    const prices = await stripe.prices.list({
      product: process.env.STRIPE_EARLY_BIRD_PRODUCT_ID || 'prod_SnpRkyi976PwBK',
      active: true
    });
    const monthlyPrice = prices.data.find(p => p.recurring?.interval === 'month');
    console.log(`✅ Price: $${monthlyPrice.unit_amount / 100}/${monthlyPrice.recurring.interval}`);
    
    // 4. Create subscription in database
    console.log('\n4️⃣ Creating subscription record...');
    const subscription = await prisma.subscription.create({
      data: {
        userId: testUser.id,
        tier: 'early_bird',
        stripeCustomerId: customer.id,
        stripePriceId: monthlyPrice.id,
        status: 'active',
        billingPeriod: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        metadata: {
          features: {
            ai_generations_monthly: -1,
            private_components: -1,
            storage_gb: 20,
            api_calls_daily: 2000,
            bandwidth_gb_monthly: 200
          }
        }
      }
    });
    console.log(`✅ Subscription created: ${subscription.id}`);
    
    // 5. Test feature access
    console.log('\n5️⃣ Testing feature access...');
    const features = await prisma.feature.findMany({
      where: {
        tiers: {
          has: 'early_bird'
        }
      }
    });
    console.log(`✅ User has access to ${features.length} features:`);
    features.forEach(f => console.log(`   - ${f.name}`));
    
    // 6. Test usage tracking
    console.log('\n6️⃣ Testing usage tracking...');
    const usage = await prisma.usageRecord.create({
      data: {
        userId: testUser.id,
        subscriptionId: subscription.id,
        metric: 'ai_generations_monthly',
        value: 1,
        period: new Date().toISOString().slice(0, 7) // YYYY-MM
      }
    });
    console.log(`✅ Usage tracked: ${usage.metric} = ${usage.value}`);
    
    // 7. Create checkout session (for testing)
    console.log('\n7️⃣ Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: monthlyPrice.id,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: 'https://revolutionary-ui.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://revolutionary-ui.com/pricing',
      metadata: {
        userId: testUser.id,
        tier: 'early_bird'
      }
    });
    console.log(`✅ Checkout URL: ${session.url}`);
    
    console.log('\n🎉 Subscription flow test complete!');
    console.log('\n📋 Summary:');
    console.log(`   User: ${testUser.email}`);
    console.log(`   Tier: Early Bird ($9.99/month)`);
    console.log(`   Features: ${features.length} enabled`);
    console.log(`   Status: Active`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSubscriptionFlow();