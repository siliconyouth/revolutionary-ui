#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read from root .env.local
const rootEnvPath = path.join(process.cwd(), '.env.local');
const marketplaceEnvPath = path.join(process.cwd(), 'marketplace-nextjs', '.env');

if (!fs.existsSync(rootEnvPath)) {
  console.error('❌ No .env.local file found in root!');
  process.exit(1);
}

// Read root env file
const rootEnv = fs.readFileSync(rootEnvPath, 'utf8');
const lines = rootEnv.split('\n');

// Extract database URLs
const dbVars = {};
const requiredVars = [
  'DATABASE_URL',
  'DATABASE_URL_PRISMA',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

lines.forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  
  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('=');
  
  if (requiredVars.includes(key)) {
    dbVars[key] = value;
  }
});

// Create marketplace .env
let marketplaceEnv = '';
for (const [key, value] of Object.entries(dbVars)) {
  marketplaceEnv += `${key}=${value}\n`;
}

// Write marketplace .env
fs.writeFileSync(marketplaceEnvPath, marketplaceEnv);

console.log('✅ Created marketplace-nextjs/.env with database configuration');
console.log('📋 Included variables:');
Object.keys(dbVars).forEach(key => {
  console.log(`   - ${key}`);
});