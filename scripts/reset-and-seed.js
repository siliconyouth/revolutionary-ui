#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const print = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}`),
  info: (text) => console.log(`${text}`),
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
};

print.title('🔄 Revolutionary UI - Database Reset & Seed');
print.warning('\nThis will DELETE ALL DATA in your database and recreate it from scratch!');
print.info('Only continue if you want to completely reset your database.\n');

rl.question('Are you sure you want to reset the database? (yes/no): ', async (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    print.info('Operation cancelled.');
    rl.close();
    return;
  }

  rl.close();

  try {
    print.info('\n1️⃣ Resetting database...');
    execSync('node scripts/run-prisma.js migrate reset --force', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    print.success('Database reset complete!');
    
    print.info('\n2️⃣ Running migrations...');
    execSync('node scripts/run-prisma.js db push', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    print.success('Schema pushed!');
    
    print.info('\n3️⃣ Seeding database...');
    execSync('node scripts/run-prisma.js db seed', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    print.success('Database seeded!');
    
    print.title('\n✨ Database reset and seed completed successfully!');
    print.info('\nYou can now:');
    print.info('- View your database: npm run prisma:studio');
    print.info('- Start the marketplace: cd marketplace-nextjs && npm run dev');
    
  } catch (error) {
    print.error('Failed to reset and seed database');
    console.error(error);
    process.exit(1);
  }
});