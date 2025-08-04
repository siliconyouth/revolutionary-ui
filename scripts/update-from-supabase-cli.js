#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

print.title('🔄 Updating .env.local from Supabase CLI');

// Get project reference
const projectRef = 'cdrayydgsuuqpakquhit';
print.info(`Project Reference: ${projectRef}`);

// Get API keys from CLI output
print.info('\nRetrieving API keys...');
const apiKeysOutput = execSync(`supabase projects api-keys --project-ref ${projectRef}`, { encoding: 'utf8' });

// Parse API keys
const anonKey = apiKeysOutput.match(/anon\s+\|\s+(\S+)/)?.[1];
const serviceRoleKey = apiKeysOutput.match(/service_role\s+\|\s+(\S+)/)?.[1];

if (!anonKey || !serviceRoleKey) {
  print.error('Failed to retrieve API keys');
  process.exit(1);
}

print.success('Retrieved API keys');

// Ask for database password
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('\nEnter your database password: ', (password) => {
  readline.close();

  // Build environment variables
  const envVars = {
    // Supabase URLs and Keys
    NEXT_PUBLIC_SUPABASE_URL: `https://${projectRef}.supabase.co`,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    
    // Database URLs
    DATABASE_URL: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    DATABASE_URL_PRISMA: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`,
    DIRECT_URL: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    
    // Additional database URLs that might be needed
    DATABASE_URL_UNPOOLED: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    DATABASE_POOLING_URL: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
  };

  // Read existing .env.local if exists
  const envPath = path.join(process.cwd(), '.env.local');
  let existingEnv = {};
  
  if (fs.existsSync(envPath)) {
    print.info('\nReading existing .env.local...');
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        existingEnv[match[1].trim()] = match[2].trim();
      }
    });
    
    // Backup existing file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = envPath + `.backup-${timestamp}`;
    fs.copyFileSync(envPath, backupPath);
    print.success(`Backed up to ${path.basename(backupPath)}`);
  }

  // Merge with existing vars (new values override)
  const finalEnv = { ...existingEnv, ...envVars };

  // Generate new .env.local content
  let content = `# Revolutionary UI Environment Configuration
# Updated from Supabase CLI on ${new Date().toISOString()}
# Project: ${projectRef}
# =============================================================================

# Supabase Configuration
# ======================================================================

NEXT_PUBLIC_SUPABASE_URL=${finalEnv.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${finalEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${finalEnv.SUPABASE_SERVICE_ROLE_KEY}

# Database Connection
# ======================================================================

# Direct connection (no pooling) - Use for migrations
DATABASE_URL=${finalEnv.DATABASE_URL}
DIRECT_URL=${finalEnv.DIRECT_URL}

# Pooled connection (PgBouncer) - Use for Prisma Client
DATABASE_URL_PRISMA=${finalEnv.DATABASE_URL_PRISMA}

# Alternative pooling URLs
DATABASE_URL_UNPOOLED=${finalEnv.DATABASE_URL_UNPOOLED}
DATABASE_POOLING_URL=${finalEnv.DATABASE_POOLING_URL}

`;

  // Add other existing variables
  const supabaseKeys = Object.keys(envVars);
  const otherKeys = Object.keys(existingEnv).filter(key => !supabaseKeys.includes(key));
  
  if (otherKeys.length > 0) {
    content += `# Other Configuration
# ======================================================================

`;
    otherKeys.forEach(key => {
      content += `${key}=${existingEnv[key]}\n`;
    });
  }

  // Write the file
  fs.writeFileSync(envPath, content);
  print.success('\n✅ Updated .env.local with correct Supabase settings');

  print.info('\nNext steps:');
  print.info('1. Run: node scripts/test-connection.js');
  print.info('2. If tests pass, run: node scripts/setup-database.js');
});