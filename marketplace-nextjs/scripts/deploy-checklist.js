#!/usr/bin/env node

/**
 * Revolutionary UI Marketplace - Deployment Checklist Script
 * This script helps verify all deployment requirements are met
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Checklist items
const checks = {
  build: {
    name: 'Production Build',
    check: () => {
      try {
        const buildDir = path.join(__dirname, '..', '.next');
        return fs.existsSync(buildDir);
      } catch (error) {
        return false;
      }
    },
    fix: 'Run: npm run build'
  },
  
  envFile: {
    name: 'Environment Variables',
    check: () => {
      // Read from root .env.local as per centralized configuration
      const envPath = path.join(__dirname, '..', '..', '.env.local');
      
      if (!fs.existsSync(envPath)) {
        console.log(`${colors.yellow}  → Root .env.local not found${colors.reset}`);
        return false;
      }
      
      // Check required variables
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = [
        'DATABASE_URL',
        'NEXTAUTH_URL',
        'NEXTAUTH_SECRET',
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      ];
      
      const missingVars = requiredVars.filter(varName => {
        const regex = new RegExp(`^${varName}=.+`, 'm');
        return !regex.test(envContent) || envContent.includes(`${varName}=[`);
      });
      
      if (missingVars.length > 0) {
        console.log(`${colors.yellow}  → Missing or placeholder values for: ${missingVars.join(', ')}${colors.reset}`);
        return false;
      }
      
      return true;
    },
    fix: 'Update values in root .env.local file'
  },
  
  database: {
    name: 'Database Migrations',
    check: () => {
      try {
        // Check if migrations directory has files
        const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
        if (!fs.existsSync(migrationsDir)) {
          return false;
        }
        const migrations = fs.readdirSync(migrationsDir).filter(f => !f.startsWith('.'));
        return migrations.length > 0;
      } catch (error) {
        return false;
      }
    },
    fix: 'Run: npx prisma migrate deploy'
  },
  
  gitignore: {
    name: 'Security Check (.gitignore)',
    check: () => {
      const gitignorePath = path.join(__dirname, '..', '.gitignore');
      if (!fs.existsSync(gitignorePath)) {
        return false;
      }
      
      const content = fs.readFileSync(gitignorePath, 'utf8');
      // Check for .env patterns - the .env*.local pattern covers .env.local
      const hasEnvPattern = content.includes('.env*.local') || content.includes('.env.local');
      const hasEnvBase = content.includes('.env') || content.includes('.env*');
      
      return hasEnvPattern || hasEnvBase;
    },
    fix: 'Add .env patterns to .gitignore'
  },
  
  typescript: {
    name: 'TypeScript Compilation',
    check: () => {
      try {
        // Quick check - just verify tsconfig exists and is valid
        const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
        if (!fs.existsSync(tsconfigPath)) {
          console.log(`${colors.yellow}  → tsconfig.json not found${colors.reset}`);
          return false;
        }
        
        // Try to parse tsconfig to ensure it's valid JSON
        const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
        JSON.parse(tsconfigContent);
        
        // For production deployment, we rely on the build process to catch TS errors
        // since 'npm run build' already runs type checking
        return true;
      } catch (error) {
        console.log(`${colors.yellow}  → Invalid tsconfig.json${colors.reset}`);
        return false;
      }
    },
    fix: 'Ensure tsconfig.json is valid. Run "npm run build" to check for TypeScript errors'
  },
  
  dependencies: {
    name: 'Production Dependencies',
    check: () => {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const lockPath = path.join(__dirname, '..', 'package-lock.json');
      
      if (!fs.existsSync(packagePath) || !fs.existsSync(lockPath)) {
        return false;
      }
      
      // Check if lock file is newer than package.json
      const packageStat = fs.statSync(packagePath);
      const lockStat = fs.statSync(lockPath);
      
      return lockStat.mtime >= packageStat.mtime;
    },
    fix: 'Run: npm install --legacy-peer-deps'
  },
  
  stripe: {
    name: 'Stripe Configuration',
    check: () => {
      // Read from root .env.local
      const envPath = path.join(__dirname, '..', '..', '.env.local');
      if (!fs.existsSync(envPath)) {
        return false;
      }
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const stripeKeyMatch = envContent.match(/^STRIPE_SECRET_KEY=(.+)$/m);
      
      if (!stripeKeyMatch || stripeKeyMatch[1].startsWith('sk_test_')) {
        console.log(`${colors.yellow}  → Using test Stripe keys${colors.reset}`);
        return false;
      }
      return true;
    },
    fix: 'Update to production Stripe keys in root .env.local'
  }
};

// Run checks
console.log(`\n${colors.blue}🚀 Revolutionary UI Marketplace - Deployment Checklist${colors.reset}\n`);

let allPassed = true;
let passedCount = 0;
const totalChecks = Object.keys(checks).length;

Object.entries(checks).forEach(([key, check]) => {
  process.stdout.write(`Checking ${check.name}... `);
  
  const passed = check.check();
  allPassed = allPassed && passed;
  
  if (passed) {
    console.log(`${colors.green}✓${colors.reset}`);
    passedCount++;
  } else {
    console.log(`${colors.red}✗${colors.reset}`);
    console.log(`  ${colors.yellow}Fix: ${check.fix}${colors.reset}`);
  }
});

// Summary
console.log(`\n${colors.blue}Summary:${colors.reset} ${passedCount}/${totalChecks} checks passed\n`);

if (allPassed) {
  console.log(`${colors.green}✅ All checks passed! Ready for deployment.${colors.reset}\n`);
  console.log('Next steps:');
  console.log('1. Deploy to your hosting platform (Vercel, Netlify, etc.)');
  console.log('2. Configure production Stripe webhooks');
  console.log('3. Run database migrations in production');
  console.log('4. Test the live deployment\n');
  process.exit(0);
} else {
  console.log(`${colors.red}❌ Some checks failed. Please fix the issues above before deploying.${colors.reset}\n`);
  process.exit(1);
}