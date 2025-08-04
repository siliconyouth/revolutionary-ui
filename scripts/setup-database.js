#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper functions
const print = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}`),
  info: (text) => console.log(`${text}`),
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
  cmd: (text) => console.log(`${colors.cyan}$ ${text}${colors.reset}`),
};

// Execute command with output
const exec = (command, silent = false) => {
  if (!silent) print.cmd(command);
  try {
    return execSync(command, { 
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8'
    });
  } catch (error) {
    if (!silent) print.error(`Command failed: ${command}`);
    throw error;
  }
};

// Main setup function
async function main() {
  print.title('🚀 Revolutionary UI - Database Setup');
  console.log('==================================\n');

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    print.error('.env.local file not found!');
    print.info('Please run one of these commands first:');
    print.info('  node scripts/setup-env.js');
    print.info('  ./scripts/setup-env.sh');
    process.exit(1);
  }

  // Load environment variables
  const envConfig = dotenv.config({ path: envPath });
  if (envConfig.error) {
    print.error('Failed to load .env.local');
    console.error(envConfig.error);
    process.exit(1);
  }

  // Check required variables
  const required = [
    'DATABASE_URL_PRISMA',
    'DIRECT_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    print.error('Missing required environment variables:');
    missing.forEach(key => {
      print.error(`  - ${key}`);
    });
    print.info('\nPlease run: node scripts/setup-env.js');
    process.exit(1);
  }

  print.success('Environment variables loaded');

  // Test database connection
  print.info('\n🔍 Testing database connection...');
  try {
    // Use the run-prisma script for proper env loading
    const testCmd = 'node scripts/run-prisma.js db pull --print';
    const output = exec(testCmd, true);
    if (output.includes('model') || output.includes('datasource')) {
      print.success('Database connection successful!');
    } else {
      throw new Error('Connection test returned unexpected output');
    }
  } catch (error) {
    print.error('Database connection failed!');
    print.info('\nPlease check:');
    print.info('1. Your Supabase project is active');
    print.info('2. Database password is correct');
    print.info('3. Connection string is properly formatted');
    
    // Show masked connection string for debugging
    const dbUrl = process.env.DATABASE_URL_PRISMA;
    if (dbUrl) {
      const masked = dbUrl.replace(/postgres:([^@]+)@/, 'postgres:****@');
      print.info(`\nConnection string: ${masked}`);
    }
    
    process.exit(1);
  }

  // Install dependencies
  print.info('\n📦 Installing dependencies...');
  try {
    exec('npm install');
    print.success('Dependencies installed');
  } catch (error) {
    print.error('Failed to install dependencies');
    process.exit(1);
  }

  // Generate Prisma client
  print.info('\n🔄 Generating Prisma client...');
  try {
    exec('node scripts/run-prisma.js generate');
    print.success('Prisma client generated');
  } catch (error) {
    print.error('Failed to generate Prisma client');
    process.exit(1);
  }

  // Push database schema
  print.info('\n📊 Pushing database schema...');
  print.warning('This will create/update tables in your database');
  
  try {
    exec('node scripts/run-prisma.js db push');
    print.success('Database schema pushed successfully');
  } catch (error) {
    print.error('Failed to push database schema');
    print.info('\nThis might happen if:');
    print.info('- Tables already exist with conflicting schemas');
    print.info('- Database permissions are insufficient');
    print.info('- Connection was lost during migration');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nDo you want to reset the database? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        print.warning('Resetting database...');
        try {
          exec('node scripts/run-prisma.js migrate reset --force');
          print.success('Database reset complete');
        } catch (error) {
          print.error('Failed to reset database');
        }
      }
      readline.close();
      continueSeed();
    });
    return;
  }

  continueSeed();
}

function continueSeed() {
  // Seed database
  print.info('\n🌱 Seeding database with initial data...');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Do you want to seed the database? (Y/n): ', (answer) => {
    readline.close();
    
    if (answer.toLowerCase() !== 'n') {
      try {
        exec('node scripts/run-prisma.js db seed');
        print.success('Database seeded successfully');
      } catch (error) {
        print.warning('Seeding failed (this is okay if data already exists)');
      }
    }
    
    // Final instructions
    print.title('\n✅ Database setup complete!');
    print.info('\nYou can now:');
    print.info(`  • Run ${colors.bright}npm run prisma:studio${colors.reset} to view your database`);
    print.info(`  • Run ${colors.bright}cd marketplace-nextjs && npm run dev${colors.reset} to start the Next.js app`);
    print.info(`  • Run ${colors.bright}npm run cli${colors.reset} to use the Revolutionary UI CLI`);
    print.info('\n🎉 Happy coding!');
    
    process.exit(0);
  });
}

// Handle errors
process.on('unhandledRejection', (error) => {
  print.error('An unexpected error occurred:');
  console.error(error);
  process.exit(1);
});

// Run main function
main().catch((error) => {
  print.error('Setup failed:');
  console.error(error);
  process.exit(1);
});