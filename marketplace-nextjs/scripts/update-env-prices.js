#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Price IDs from Stripe
const priceIds = {
  STRIPE_PRICE_PERSONAL_MONTHLY: 'price_1RrE03AlB5kkCVbokg24MM6S',
  STRIPE_PRICE_PERSONAL_YEARLY: 'price_1RrE03AlB5kkCVbopPU1otnK',
  STRIPE_PRICE_COMPANY_MONTHLY: 'price_1RrE05AlB5kkCVbo3ReYnBBG',
  STRIPE_PRICE_COMPANY_YEARLY: 'price_1RrE05AlB5kkCVboQIPVVXQ4',
  STRIPE_PRICE_ENTERPRISE_MONTHLY: 'price_1RrE07AlB5kkCVboQtbLnn9m'
};

const envPath = path.join(__dirname, '..', '.env.local');

// Read current .env.local
let envContent = fs.readFileSync(envPath, 'utf8');

// Check which price IDs are missing
const missingIds = [];
for (const [key, value] of Object.entries(priceIds)) {
  if (!envContent.includes(key)) {
    missingIds.push({ key, value });
  }
}

if (missingIds.length === 0) {
  console.log('✅ All Stripe price IDs are already in .env.local');
} else {
  // Add missing IDs
  console.log(`📝 Adding ${missingIds.length} Stripe price IDs to .env.local:\n`);
  
  // Add a newline if the file doesn't end with one
  if (!envContent.endsWith('\n')) {
    envContent += '\n';
  }
  
  // Add comment if not already present
  if (!envContent.includes('# Stripe Price IDs')) {
    envContent += '\n# Stripe Price IDs (Created by setup script)\n';
  }
  
  // Add each missing ID
  for (const { key, value } of missingIds) {
    envContent += `${key}=${value}\n`;
    console.log(`   ✅ ${key}=${value}`);
  }
  
  // Write back to file
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Successfully updated .env.local with Stripe price IDs');
}

// Display next steps
console.log('\n📋 Next steps:');
console.log('1. Set up a webhook endpoint for local development:');
console.log('   stripe listen --forward-to localhost:3000/api/webhooks/stripe');
console.log('\n2. Copy the webhook signing secret and add to .env.local:');
console.log('   STRIPE_WEBHOOK_SECRET=whsec_...');
console.log('\n3. Test the checkout flow at http://localhost:3000/pricing');
console.log('\n4. For production, add a webhook endpoint in Stripe Dashboard:');
console.log('   https://dashboard.stripe.com/webhooks');
console.log('   URL: https://your-domain.com/api/webhooks/stripe');