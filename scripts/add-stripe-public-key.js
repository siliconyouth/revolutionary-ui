#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

// Read current .env.local
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('Error reading .env.local:', error.message);
  process.exit(1);
}

// Check if NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY already exists
if (envContent.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')) {
  console.log('✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY already exists in .env.local');
  process.exit(0);
}

// Check if STRIPE_PUBLISHABLE_KEY exists and copy its value
const stripeKeyMatch = envContent.match(/STRIPE_PUBLISHABLE_KEY=(.+)/);
if (stripeKeyMatch) {
  const stripeKey = stripeKeyMatch[1];
  
  // Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY after STRIPE_PUBLISHABLE_KEY
  envContent = envContent.replace(
    /STRIPE_PUBLISHABLE_KEY=.+/,
    `STRIPE_PUBLISHABLE_KEY=${stripeKey}\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripeKey}`
  );
  
  // Write back to .env.local
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Added NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local');
  console.log(`   Value: ${stripeKey.substring(0, 10)}...`);
} else {
  console.log('⚠️  STRIPE_PUBLISHABLE_KEY not found in .env.local');
  console.log('   Please add both STRIPE_PUBLISHABLE_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manually');
}