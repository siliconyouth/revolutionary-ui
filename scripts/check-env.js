#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { config } = require('@dotenvx/dotenvx');

// Load environment from root .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  config({ path: envPath, override: false });
  console.log('✅ Loaded environment from .env.local\n');
} else {
  console.log('❌ .env.local not found!\n');
}

// Define required environment variables by category
const requiredVars = {
  'Database': [
    'DATABASE_URL',
    'DATABASE_URL_PRISMA', 
    'DIRECT_URL'
  ],
  'Supabase': [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  'Stripe': [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ],
  'AI Providers': [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_AI_API_KEY',
    'MISTRAL_API_KEY',
    'GROQ_API_KEY'
  ],
  'Authentication': [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ]
};

// Check each category
let totalMissing = 0;
let totalConfigured = 0;

console.log('🔍 Environment Variables Status:\n');

for (const [category, vars] of Object.entries(requiredVars)) {
  console.log(`📦 ${category}:`);
  
  for (const varName of vars) {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName} = ${value.substring(0, 20)}...`);
      totalConfigured++;
    } else {
      console.log(`  ❌ ${varName} = NOT SET`);
      totalMissing++;
    }
  }
  console.log('');
}

// Summary
console.log('📊 Summary:');
console.log(`  Total Required: ${totalConfigured + totalMissing}`);
console.log(`  Configured: ${totalConfigured}`);
console.log(`  Missing: ${totalMissing}`);

if (totalMissing > 0) {
  console.log('\n⚠️  Some environment variables are missing.');
  console.log('Copy .env.sample to .env.local and configure the missing variables.');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are configured!');
}