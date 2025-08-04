#!/usr/bin/env node

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

async function checkPrices() {
  console.log('🔍 Checking Stripe Prices...\n');
  
  const products = await stripe.products.list({ active: true });
  
  for (const product of products.data) {
    console.log(`📦 ${product.name}`);
    console.log(`   ID: ${product.id}`);
    
    const prices = await stripe.prices.list({ product: product.id, active: true });
    prices.data.forEach(price => {
      const amount = price.unit_amount / 100;
      const interval = price.recurring?.interval || 'one-time';
      const intervalCount = price.recurring?.interval_count || 1;
      console.log(`   💰 $${amount} / ${intervalCount > 1 ? intervalCount + ' ' : ''}${interval}`);
    });
    console.log('');
  }
}

checkPrices().catch(console.error);