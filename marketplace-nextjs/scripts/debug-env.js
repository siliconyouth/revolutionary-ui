#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const result = dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🔍 Environment Variables Debug\n');

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error.message);
  process.exit(1);
}

console.log('✅ Successfully loaded .env.local\n');

// Check required variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_PERSONAL_MONTHLY',
  'STRIPE_PRICE_PERSONAL_YEARLY',
  'STRIPE_PRICE_COMPANY_MONTHLY',
  'STRIPE_PRICE_COMPANY_YEARLY',
  'STRIPE_PRICE_ENTERPRISE_MONTHLY',
];

console.log('Required Environment Variables:');
console.log('==============================\n');

let missingVars = [];

for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    missingVars.push(varName);
  }
}

console.log('\nOptional Environment Variables:');
console.log('==============================\n');

const optionalVars = [
  'NEXT_PUBLIC_APP_URL',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_AI_API_KEY',
  'MISTRAL_API_KEY',
  'GROQ_API_KEY',
];

for (const varName of optionalVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`⚠️  ${varName}: Not set (optional)`);
  }
}

if (missingVars.length > 0) {
  console.log('\n❌ Missing required environment variables:');
  console.log(missingVars.join(', '));
  console.log('\nPlease add these to your .env.local file');
} else {
  console.log('\n✅ All required environment variables are set!');
}