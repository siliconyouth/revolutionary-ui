#!/usr/bin/env node

const Stripe = require('stripe');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

// Product and pricing configuration
const products = [
  {
    id: 'personal',
    name: 'Personal Plan',
    description: 'Perfect for individual developers',
    metadata: {
      plan_id: 'personal',
      components_per_month: '100',
      custom_providers: '5',
      team_members: '1'
    },
    prices: [
      {
        nickname: 'Personal Monthly',
        unit_amount: 1900, // $19.00
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { billing_period: 'monthly' }
      },
      {
        nickname: 'Personal Yearly',
        unit_amount: 19000, // $190.00
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { billing_period: 'yearly' }
      }
    ]
  },
  {
    id: 'company',
    name: 'Company Plan',
    description: 'For teams and growing businesses',
    metadata: {
      plan_id: 'company',
      components_per_month: '1000',
      custom_providers: 'unlimited',
      team_members: '5'
    },
    prices: [
      {
        nickname: 'Company Monthly',
        unit_amount: 9900, // $99.00
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { billing_period: 'monthly' }
      },
      {
        nickname: 'Company Yearly',
        unit_amount: 99000, // $990.00
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { billing_period: 'yearly' }
      }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'Custom solutions for large organizations',
    metadata: {
      plan_id: 'enterprise',
      components_per_month: 'unlimited',
      custom_providers: 'unlimited',
      team_members: 'unlimited'
    },
    prices: [
      {
        nickname: 'Enterprise Monthly',
        unit_amount: 49900, // $499.00
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { billing_period: 'monthly' }
      }
    ]
  }
];

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe products and prices...\n');
  
  const priceIds = {};
  
  try {
    // Check if we have a valid API key
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not found in .env.local');
    }
    
    // Test the connection
    await stripe.accounts.retrieve();
    console.log('✅ Successfully connected to Stripe\n');
    
    for (const productConfig of products) {
      console.log(`📦 Creating product: ${productConfig.name}`);
      
      // Check if product already exists
      let product;
      const existingProducts = await stripe.products.search({
        query: `metadata['plan_id']:'${productConfig.id}'`,
      });
      
      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`   ↳ Product already exists (${product.id})`);
      } else {
        // Create new product
        product = await stripe.products.create({
          name: productConfig.name,
          description: productConfig.description,
          metadata: productConfig.metadata,
        });
        console.log(`   ↳ Created new product (${product.id})`);
      }
      
      // Create prices for this product
      for (const priceConfig of productConfig.prices) {
        console.log(`   💵 Creating price: ${priceConfig.nickname}`);
        
        // Check if price already exists
        const existingPrices = await stripe.prices.search({
          query: `product:'${product.id}' AND metadata['billing_period']:'${priceConfig.metadata.billing_period}'`,
        });
        
        let price;
        if (existingPrices.data.length > 0) {
          price = existingPrices.data[0];
          console.log(`      ↳ Price already exists (${price.id})`);
        } else {
          // Create new price
          price = await stripe.prices.create({
            product: product.id,
            nickname: priceConfig.nickname,
            unit_amount: priceConfig.unit_amount,
            currency: priceConfig.currency,
            recurring: priceConfig.recurring,
            metadata: priceConfig.metadata,
          });
          console.log(`      ↳ Created new price (${price.id})`);
        }
        
        // Store price ID for env file
        const envKey = `STRIPE_PRICE_${productConfig.id.toUpperCase()}_${priceConfig.metadata.billing_period.toUpperCase()}`;
        priceIds[envKey] = price.id;
      }
      
      console.log('');
    }
    
    // Create webhook endpoint if not exists
    console.log('🔗 Setting up webhook endpoint...');
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`
      : 'http://localhost:3000/api/webhooks/stripe';
    
    const existingEndpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const endpoint = existingEndpoints.data.find(ep => ep.url === webhookUrl);
    
    if (endpoint) {
      console.log(`   ↳ Webhook endpoint already exists: ${webhookUrl}`);
      console.log(`   ↳ Webhook signing secret: ${endpoint.secret || 'Use existing secret from dashboard'}`);
    } else {
      const newEndpoint = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: [
          'checkout.session.completed',
          'customer.subscription.created',
          'customer.subscription.updated',
          'customer.subscription.deleted',
          'invoice.payment_succeeded',
          'invoice.payment_failed',
        ],
      });
      console.log(`   ↳ Created webhook endpoint: ${webhookUrl}`);
      console.log(`   ↳ Webhook signing secret: ${newEndpoint.secret}`);
      priceIds['STRIPE_WEBHOOK_SECRET'] = newEndpoint.secret;
    }
    
    // Display environment variables to add
    console.log('\n✅ Setup complete! Add these to your .env.local file:\n');
    console.log('# Stripe Price IDs (Generated by setup script)');
    for (const [key, value] of Object.entries(priceIds)) {
      console.log(`${key}=${value}`);
    }
    
    // Optional: Update .env.local automatically
    console.log('\n📝 Would you like to update .env.local automatically? (y/n)');
    
  } catch (error) {
    console.error('\n❌ Error setting up Stripe:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Please check your STRIPE_SECRET_KEY in .env.local');
    }
    process.exit(1);
  }
}

// Run the setup
setupStripeProducts();