#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk').default || require('chalk');

console.log(chalk.blue('\n🔧 Setting up OpenAI Environment\n'));

const envPath = path.join(__dirname, '../.env.local');

// Read current .env.local
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error(chalk.red('❌ Could not read .env.local'));
  process.exit(1);
}

// Check if OPENAI_ORG_ID has the placeholder value
if (envContent.includes('OPENAI_ORG_ID=Leave empty for personal accounts')) {
  console.log(chalk.yellow('⚠️  Found placeholder OPENAI_ORG_ID value'));
  
  // Comment out the line
  envContent = envContent.replace(
    /^OPENAI_ORG_ID=Leave empty for personal accounts$/m,
    '# OPENAI_ORG_ID= # Leave empty for personal accounts'
  );
  
  // Write back
  fs.writeFileSync(envPath, envContent);
  console.log(chalk.green('✅ Fixed OPENAI_ORG_ID in .env.local'));
  console.log(chalk.gray('   The line has been commented out'));
} else {
  console.log(chalk.green('✅ OPENAI_ORG_ID already configured correctly'));
}

console.log(chalk.blue('\n📝 Next Steps:\n'));
console.log('1. Run: npm run embeddings:generate');
console.log('2. If you have an organization ID, uncomment and set OPENAI_ORG_ID');
console.log('3. For personal accounts, keep it commented out\n');