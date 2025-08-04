#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Stripe environment variables to add
const stripeVars = `
# Stripe Product IDs
STRIPE_PRODUCT_BETA=prod_SnpRJye4PAo6aj
STRIPE_PRODUCT_EARLY_BIRD=prod_SnpRkyi976PwBK
STRIPE_PRODUCT_PERSONAL=prod_SnpRsC1AkhAmoo
STRIPE_PRODUCT_COMPANY=prod_SnpRayhhrJXwal
STRIPE_PRODUCT_ENTERPRISE=prod_SnpRRxcjgMskQP

# Stripe Price IDs
STRIPE_PRICE_EARLY_BIRD_MONTHLY=price_1RsDmqAlB5kkCVbopkhO7iJA
STRIPE_PRICE_EARLY_BIRD_YEARLY=price_1RsDmrAlB5kkCVboAKioGcII
STRIPE_PRICE_PERSONAL_MONTHLY=price_1RsDmrAlB5kkCVbocB8ajh8K
STRIPE_PRICE_PERSONAL_YEARLY=price_1RsDmsAlB5kkCVboQaVQuE3u
STRIPE_PRICE_COMPANY_MONTHLY=price_1RsDmsAlB5kkCVbouoIPi32r
STRIPE_PRICE_COMPANY_YEARLY=price_1RsDmtAlB5kkCVbozrVbqReV
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1RsDmtAlB5kkCVbot6QZ9mXT
STRIPE_PRICE_ENTERPRISE_YEARLY=price_1RsDmuAlB5kkCVbohnFzbOcO
`;

const envPath = path.join(process.cwd(), '.env.local');

// Read existing content
let existingContent = '';
if (fs.existsSync(envPath)) {
  existingContent = fs.readFileSync(envPath, 'utf8');
}

// Check if Stripe vars already exist
if (existingContent.includes('STRIPE_PRODUCT_')) {
  console.log('⚠️  Stripe environment variables already exist in .env.local');
  console.log('Please update them manually if needed.');
  process.exit(0);
}

// Append Stripe vars
const updatedContent = existingContent + '\n' + stripeVars;
fs.writeFileSync(envPath, updatedContent);

console.log('✅ Successfully added Stripe environment variables to .env.local');
console.log('\nAdded variables:');
console.log('- 5 Product IDs (STRIPE_PRODUCT_*)');
console.log('- 8 Price IDs (STRIPE_PRICE_*)');
console.log('\nNext steps:');
console.log('1. Verify the variables in .env.local');
console.log('2. Test the subscription flow');
console.log('3. Update the pricing page to use these IDs');