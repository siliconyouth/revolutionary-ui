#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ No .env.local file found!');
  process.exit(1);
}

dotenv.config({ path: envPath });

// Check for Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  console.error('Please configure your Stripe API key first.');
  process.exit(1);
}

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function updateCompanyPricing() {
  console.log('🔄 Updating Company tier pricing to $49.99/mo...\n');
  
  try {
    // The current price IDs from the environment
    const monthlyPriceId = 'price_1RsDmsAlB5kkCVbouoIPi32r';
    const yearlyPriceId = 'price_1RsDmtAlB5kkCVbozrVbqReV';
    
    // Archive the old prices
    console.log('📦 Archiving old prices...');
    await stripe.prices.update(monthlyPriceId, { active: false });
    await stripe.prices.update(yearlyPriceId, { active: false });
    
    // Create new prices with updated amounts
    console.log('💰 Creating new prices...');
    
    // Get the product ID
    const productId = 'prod_SnpRayhhrJXwal'; // Company product ID
    
    // Create new monthly price ($49.99)
    const newMonthlyPrice = await stripe.prices.create({
      product: productId,
      unit_amount: 4999, // $49.99
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        tier: 'company',
        billing_period: 'monthly',
        previous_price: monthlyPriceId
      }
    });
    
    console.log(`✅ New monthly price created: ${newMonthlyPrice.id} ($49.99/mo)`);
    
    // Create new yearly price ($419.91 - 30% off)
    const newYearlyPrice = await stripe.prices.create({
      product: productId,
      unit_amount: 41991, // $419.91
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        tier: 'company',
        billing_period: 'yearly',
        discount_percent: '30',
        previous_price: yearlyPriceId
      }
    });
    
    console.log(`✅ New yearly price created: ${newYearlyPrice.id} ($419.91/yr)`);
    
    // Show environment variable updates
    console.log('\n📝 Update your .env.local with these new price IDs:');
    console.log(`STRIPE_PRICE_COMPANY_MONTHLY=${newMonthlyPrice.id}`);
    console.log(`STRIPE_PRICE_COMPANY_YEARLY=${newYearlyPrice.id}`);
    
    // Calculate savings
    const monthlyCost = 4999 * 12;
    const yearlyCost = 41991;
    const savings = monthlyCost - yearlyCost;
    
    console.log('\n💡 Pricing Summary:');
    console.log(`Monthly: $49.99`);
    console.log(`Yearly: $419.91 (save $${(savings / 100).toFixed(2)} or 30%)`);
    
  } catch (error) {
    console.error('❌ Error updating prices:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateCompanyPricing();
}