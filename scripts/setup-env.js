#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask questions
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

// Helper to print colored text
const print = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}`),
  section: (text) => console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`),
  info: (text) => console.log(`${colors.dim}${text}${colors.reset}`),
  success: (text) => console.log(`${colors.green}✓ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}✗ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠ ${text}${colors.reset}`),
  highlight: (text) => `${colors.bright}${colors.yellow}${text}${colors.reset}`,
};

// Environment variable definitions with categories
const envConfig = {
  supabase: {
    title: '🗄️  Supabase Database Configuration',
    vars: [
      {
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        description: 'Your Supabase project URL',
        help: 'Found in Supabase Dashboard > Settings > API',
        example: 'https://abcdefghijk.supabase.co',
        required: true,
        validate: (value) => value.startsWith('https://') && value.includes('.supabase.co'),
      },
      {
        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        description: 'Supabase anonymous key (safe for browser)',
        help: 'Found in Supabase Dashboard > Settings > API > anon key',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true,
        validate: (value) => value.startsWith('eyJ'),
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        description: 'Supabase service role key (server-side only)',
        help: 'Found in Supabase Dashboard > Settings > API > service_role key',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true,
        sensitive: true,
        validate: (value) => value.startsWith('eyJ'),
      },
    ],
  },
  database: {
    title: '🔗 Database Connection Strings',
    vars: [
      {
        key: 'DATABASE_URL',
        description: 'Direct database connection URL',
        help: 'Found in Supabase Dashboard > Settings > Database',
        example: 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres',
        required: true,
        sensitive: true,
        validate: (value) => value.startsWith('postgresql://'),
      },
      {
        key: 'DATABASE_URL_PRISMA',
        description: 'Pooled connection URL for Prisma',
        help: 'Same as DATABASE_URL but with port 6543 and pooling params',
        example: 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1',
        required: true,
        sensitive: true,
        validate: (value) => value.startsWith('postgresql://') && value.includes('6543'),
        generateFrom: 'DATABASE_URL',
        generator: (dbUrl) => {
          return dbUrl
            .replace(':5432', ':6543')
            .replace(/\?.*$/, '') + '?pgbouncer=true&connection_limit=1';
        },
      },
      {
        key: 'DIRECT_URL',
        description: 'Direct URL for migrations (non-pooled)',
        help: 'Same as DATABASE_URL, used for migrations',
        required: true,
        sensitive: true,
        generateFrom: 'DATABASE_URL',
        generator: (dbUrl) => dbUrl,
      },
    ],
  },
  auth: {
    title: '🔐 Authentication Configuration',
    vars: [
      {
        key: 'NEXTAUTH_URL',
        description: 'NextAuth callback URL',
        help: 'Your app URL (use http://localhost:3000 for development)',
        example: 'http://localhost:3000',
        default: 'http://localhost:3000',
        required: true,
      },
      {
        key: 'NEXTAUTH_SECRET',
        description: 'NextAuth encryption secret',
        help: 'Random string for JWT encryption',
        required: true,
        sensitive: true,
        generator: () => execSync('openssl rand -base64 32').toString().trim(),
      },
    ],
  },
  oauth: {
    title: '🔑 OAuth Providers (Optional)',
    optional: true,
    vars: [
      {
        key: 'GITHUB_ID',
        description: 'GitHub OAuth App ID',
        help: 'Create at https://github.com/settings/developers',
        example: 'Iv1.8a61f9b3a7aba766',
        required: false,
      },
      {
        key: 'GITHUB_SECRET',
        description: 'GitHub OAuth App Secret',
        help: 'From your GitHub OAuth App settings',
        required: false,
        sensitive: true,
      },
      {
        key: 'GOOGLE_CLIENT_ID',
        description: 'Google OAuth Client ID',
        help: 'Create at https://console.cloud.google.com/apis/credentials',
        example: '123456789012-abcdefghijklmnop.apps.googleusercontent.com',
        required: false,
      },
      {
        key: 'GOOGLE_CLIENT_SECRET',
        description: 'Google OAuth Client Secret',
        help: 'From your Google Cloud Console',
        required: false,
        sensitive: true,
      },
    ],
  },
  stripe: {
    title: '💳 Stripe Payment Configuration (Optional)',
    optional: true,
    vars: [
      {
        key: 'STRIPE_SECRET_KEY',
        description: 'Stripe secret key',
        help: 'Found in Stripe Dashboard > Developers > API keys',
        example: 'sk_test_51H...',
        required: false,
        sensitive: true,
        validate: (value) => value.startsWith('sk_'),
      },
      {
        key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        description: 'Stripe publishable key',
        help: 'Found in Stripe Dashboard > Developers > API keys',
        example: 'pk_test_51H...',
        required: false,
        validate: (value) => value.startsWith('pk_'),
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        description: 'Stripe webhook signing secret',
        help: 'Found in Stripe Dashboard > Developers > Webhooks',
        example: 'whsec_...',
        required: false,
        sensitive: true,
      },
    ],
  },
  ai: {
    title: '🤖 AI Provider API Keys',
    vars: [
      {
        key: 'OPENAI_API_KEY',
        description: 'OpenAI API key',
        help: 'Get from https://platform.openai.com/api-keys',
        example: 'sk-proj-...',
        required: false,
        sensitive: true,
        validate: (value) => value.startsWith('sk-'),
      },
      {
        key: 'ANTHROPIC_API_KEY',
        description: 'Anthropic (Claude) API key',
        help: 'Get from https://console.anthropic.com/',
        example: 'sk-ant-api03-...',
        required: false,
        sensitive: true,
        validate: (value) => value.startsWith('sk-ant-'),
      },
      {
        key: 'GOOGLE_AI_API_KEY',
        description: 'Google AI (Gemini) API key',
        help: 'Get from https://makersuite.google.com/app/apikey',
        required: false,
        sensitive: true,
      },
      {
        key: 'MISTRAL_API_KEY',
        description: 'Mistral AI API key',
        help: 'Get from https://console.mistral.ai/',
        required: false,
        sensitive: true,
      },
      {
        key: 'GROQ_API_KEY',
        description: 'Groq API key (fast inference)',
        help: 'Get from https://console.groq.com/keys',
        required: false,
        sensitive: true,
      },
    ],
  },
  features: {
    title: '⚡ Feature Flags',
    vars: [
      {
        key: 'NEXT_PUBLIC_ENABLE_MARKETPLACE',
        description: 'Enable marketplace features',
        type: 'boolean',
        default: 'true',
        required: true,
      },
      {
        key: 'NEXT_PUBLIC_ENABLE_AI_GENERATION',
        description: 'Enable AI component generation',
        type: 'boolean',
        default: 'true',
        required: true,
      },
      {
        key: 'NEXT_PUBLIC_ENABLE_COMMUNITY_SUBMISSIONS',
        description: 'Enable community submissions',
        type: 'boolean',
        default: 'true',
        required: true,
      },
      {
        key: 'NEXT_PUBLIC_ENABLE_TRANSPILER',
        description: 'Enable framework transpilation',
        type: 'boolean',
        default: 'true',
        required: true,
      },
    ],
  },
};

async function main() {
  print.title('🚀 Revolutionary UI - Environment Setup Wizard');
  print.info('This wizard will help you configure your environment variables.\n');

  const envPath = path.join(process.cwd(), '.env.local');
  const backupPath = path.join(process.cwd(), '.env.local.backup');
  const existingVars = {};

  // Check for backup file
  if (fs.existsSync(backupPath)) {
    print.info(`Found ${print.highlight('.env.local.backup')} - loading existing values...`);
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    backupContent.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        existingVars[match[1].trim()] = match[2].trim();
      }
    });
    print.success(`Loaded ${Object.keys(existingVars).length} existing values`);
  }

  // Check for current .env.local
  if (fs.existsSync(envPath)) {
    print.warning('.env.local already exists!');
    const overwrite = await ask('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      print.info('Setup cancelled.');
      process.exit(0);
    }
    // Backup current file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `.env.local.backup-${timestamp}`;
    fs.renameSync(envPath, path.join(process.cwd(), backupName));
    print.success(`Current .env.local backed up to ${backupName}`);
  }

  const finalVars = {};
  const allVars = {}; // Track all vars for generation dependencies

  // Process each category
  for (const [categoryKey, category] of Object.entries(envConfig)) {
    print.section(category.title);

    if (category.optional) {
      const configure = await ask(`Configure ${categoryKey}? (y/N): `);
      if (configure.toLowerCase() !== 'y') {
        continue;
      }
    }

    // Process each variable in the category
    for (const varConfig of category.vars) {
      console.log(''); // Add spacing
      print.info(`${varConfig.description}`);
      if (varConfig.help) {
        print.info(`ℹ️  ${varConfig.help}`);
      }
      if (varConfig.example) {
        print.info(`Example: ${colors.dim}${varConfig.example}${colors.reset}`);
      }

      let value = existingVars[varConfig.key] || '';
      let useExisting = false;

      // Show existing value if available
      if (value && !varConfig.generateFrom) {
        const maskedValue = varConfig.sensitive 
          ? value.substring(0, 10) + '...' + value.substring(value.length - 4)
          : value;
        print.info(`Current value: ${print.highlight(maskedValue)}`);
        
        const keep = await ask('Keep existing value? (Y/n): ');
        useExisting = keep.toLowerCase() !== 'n';
      }

      if (!useExisting) {
        if (varConfig.generator && !varConfig.generateFrom) {
          // Generate new value
          const generate = await ask(`Generate new value? (Y/n): `);
          if (generate.toLowerCase() !== 'n') {
            value = varConfig.generator();
            print.success(`Generated: ${varConfig.sensitive ? '***' : value}`);
          } else {
            value = await ask(`Enter ${varConfig.key}: `);
          }
        } else if (varConfig.generateFrom) {
          // Generate from another variable
          const sourceValue = allVars[varConfig.generateFrom];
          if (sourceValue && varConfig.generator) {
            value = varConfig.generator(sourceValue);
            print.success(`Generated from ${varConfig.generateFrom}`);
          } else {
            value = await ask(`Enter ${varConfig.key}: `);
          }
        } else if (varConfig.default) {
          // Use default
          const useDefault = await ask(`Use default value "${varConfig.default}"? (Y/n): `);
          if (useDefault.toLowerCase() !== 'n') {
            value = varConfig.default;
          } else {
            value = await ask(`Enter ${varConfig.key}: `);
          }
        } else {
          // Manual input
          value = await ask(`Enter ${varConfig.key}: `);
        }
      }

      // Validate
      if (varConfig.validate && value) {
        if (!varConfig.validate(value)) {
          print.error(`Invalid value format for ${varConfig.key}`);
          if (!varConfig.required) {
            const skip = await ask('Skip this variable? (y/N): ');
            if (skip.toLowerCase() === 'y') {
              continue;
            }
          }
          // Re-ask for the value
          value = await ask(`Please enter a valid ${varConfig.key}: `);
        }
      }

      // Check required
      if (varConfig.required && !value) {
        print.error(`${varConfig.key} is required!`);
        value = await ask(`Please enter ${varConfig.key}: `);
      }

      if (value) {
        finalVars[varConfig.key] = value;
        allVars[varConfig.key] = value;
      }
    }
  }

  // Generate .env.local file
  print.section('📝 Generating .env.local file...');

  let envContent = `# Revolutionary UI Environment Configuration
# Generated on ${new Date().toISOString()}
# 
# IMPORTANT: Keep this file secure and never commit it to version control
# =============================================================================

`;

  // Group variables by category
  for (const [categoryKey, category] of Object.entries(envConfig)) {
    const categoryVars = category.vars.filter(v => finalVars[v.key]);
    if (categoryVars.length === 0) continue;

    envContent += `# ${category.title.replace(/[^\w\s]/g, '').trim()}\n`;
    envContent += `# ${'='.repeat(70)}\n\n`;

    for (const varConfig of categoryVars) {
      if (varConfig.help) {
        envContent += `# ${varConfig.help}\n`;
      }
      envContent += `${varConfig.key}=${finalVars[varConfig.key]}\n`;
      if (varConfig === categoryVars[categoryVars.length - 1]) {
        envContent += '\n';
      }
    }
  }

  // Write file
  fs.writeFileSync(envPath, envContent);
  print.success(`Created ${print.highlight('.env.local')} with ${Object.keys(finalVars).length} variables`);

  // Test database connection
  print.section('🔍 Testing Configuration...');
  
  const testConnection = await ask('Test database connection now? (Y/n): ');
  if (testConnection.toLowerCase() !== 'n') {
    try {
      print.info('Testing Supabase connection...');
      // Simple test - check if URL is reachable
      const url = finalVars.NEXT_PUBLIC_SUPABASE_URL;
      if (url) {
        const https = require('https');
        const testUrl = new URL(url);
        https.get(testUrl, (res) => {
          if (res.statusCode === 200 || res.statusCode === 301) {
            print.success('Supabase URL is reachable!');
          } else {
            print.warning(`Supabase returned status ${res.statusCode}`);
          }
        }).on('error', (err) => {
          print.error(`Could not reach Supabase: ${err.message}`);
        });
      }
    } catch (error) {
      print.error(`Connection test failed: ${error.message}`);
    }
  }

  print.section('✅ Setup Complete!');
  print.info('\nNext steps:');
  print.info('1. Run: npm install');
  print.info('2. Run: ./scripts/setup-database.sh');
  print.info('3. Run: cd marketplace-nextjs && npm run dev');
  print.info('\nHappy coding! 🚀');

  rl.close();
}

main().catch((error) => {
  print.error(`Setup failed: ${error.message}`);
  process.exit(1);
});