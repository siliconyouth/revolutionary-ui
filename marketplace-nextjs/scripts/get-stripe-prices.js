#!/usr/bin/env node

const Stripe = require('stripe');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

async function getStripePrices() {
  console.log('🔍 Fetching Stripe products and prices...\n');
  
  try {
    // Get all products
    const products = await stripe.products.list({ limit: 100 });
    
    const priceIds = {};
    
    // Filter for our products
    const ourProducts = products.data.filter(product => 
      product.metadata.plan_id && ['personal', 'company', 'enterprise'].includes(product.metadata.plan_id)
    );
    
    for (const product of ourProducts) {
      console.log(`📦 ${product.name} (${product.id})`);
      console.log(`   Plan ID: ${product.metadata.plan_id}`);
      
      // Get prices for this product
      const prices = await stripe.prices.list({ 
        product: product.id,
        limit: 10 
      });
      
      for (const price of prices.data) {
        const billingPeriod = price.metadata.billing_period || 
          (price.recurring?.interval === 'month' ? 'monthly' : 'yearly');
        
        const envKey = `STRIPE_PRICE_${product.metadata.plan_id.toUpperCase()}_${billingPeriod.toUpperCase()}`;
        priceIds[envKey] = price.id;
        
        console.log(`   💵 ${price.nickname || billingPeriod}: ${price.id}`);
        console.log(`      Amount: $${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`);
      }
      console.log('');
    }
    
    // Display environment variables
    console.log('\n📝 Add these to your .env.local file:\n');
    console.log('# Stripe Price IDs');
    for (const [key, value] of Object.entries(priceIds)) {
      console.log(`${key}=${value}`);
    }
    
    // Check for webhook endpoints
    console.log('\n\n🔗 Webhook Endpoints:');
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (endpoints.data.length === 0) {
      console.log('   No webhook endpoints configured');
      console.log('   Run this command to create one:');
      console.log('   stripe listen --forward-to localhost:3000/api/webhooks/stripe');
    } else {
      for (const endpoint of endpoints.data) {
        console.log(`   ${endpoint.url}`);
        if (endpoint.status === 'enabled') {
          console.log(`   ✅ Status: Enabled`);
        } else {
          console.log(`   ❌ Status: ${endpoint.status}`);
        }
        if (endpoint.url.includes('localhost')) {
          console.log(`   ⚠️  Note: This is a local webhook. For production, update to your domain.`);
        }
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
getStripePrices();