#!/usr/bin/env node

const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
console.log('Loading environment from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Failed to load .env.local:', result.error);
  process.exit(1);
}

// Get the prisma command from arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node run-prisma.js [prisma command]');
  console.log('Example: node run-prisma.js db push');
  process.exit(1);
}

const command = `npx prisma ${args.join(' ')}`;
console.log('Running:', command);

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Command failed');
  process.exit(1);
}