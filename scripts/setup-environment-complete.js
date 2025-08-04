#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const https = require('https');
const { URL } = require('url');

// Colors
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

const print = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}`),
  section: (text) => console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`),
  info: (text) => console.log(`${colors.dim}${text}${colors.reset}`),
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
  prompt: (text) => process.stdout.write(`${colors.magenta}→ ${text}${colors.reset}`),
  value: (text) => console.log(`${colors.green}${text}${colors.reset}`),
};

// Environment variable definitions
const ENV_DEFINITIONS = {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: {
    category: 'Supabase',
    description: 'Your Supabase project URL',
    example: 'https://your-project-ref.supabase.co',
    required: true,
    validate: (value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && url.host.includes('supabase.co');
      } catch {
        return false;
      }
    },
    errorHelp: 'Must be a valid HTTPS URL ending with .supabase.co'
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    category: 'Supabase',
    description: 'Your Supabase anonymous key (safe for browser)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
    validate: (value) => value.length > 50 && value.includes('eyJ'),
    errorHelp: 'Should be a long JWT token starting with "eyJ"'
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    category: 'Supabase',
    description: 'Your Supabase service role key (server-side only)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
    secret: true,
    validate: (value) => !value || (value.length > 50 && value.includes('eyJ')),
    errorHelp: 'Should be a long JWT token starting with "eyJ"'
  },
  DATABASE_URL: {
    category: 'Database',
    description: 'PostgreSQL connection string (for migrations)',
    example: 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres',
    required: true,
    secret: true,
    validate: (value) => value.startsWith('postgresql://'),
    errorHelp: 'Must start with postgresql://'
  },
  DATABASE_URL_PRISMA: {
    category: 'Database',
    description: 'PostgreSQL pooled connection string (for queries)',
    example: 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true',
    required: true,
    secret: true,
    validate: (value) => value.startsWith('postgresql://') && value.includes('6543'),
    errorHelp: 'Must use port 6543 for connection pooling'
  },
  DIRECT_URL: {
    category: 'Database',
    description: 'Direct database URL (for migrations only)',
    example: 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres',
    required: true,
    secret: true,
    validate: (value) => value.startsWith('postgresql://') && value.includes('5432'),
    errorHelp: 'Must use port 5432 for direct connections'
  },

  // NextAuth Configuration
  NEXTAUTH_URL: {
    category: 'Authentication',
    description: 'Your app URL for authentication callbacks',
    example: 'http://localhost:3000',
    required: true,
    default: 'http://localhost:3000',
    validate: (value) => value.startsWith('http'),
    errorHelp: 'Must be a valid HTTP(S) URL'
  },
  NEXTAUTH_SECRET: {
    category: 'Authentication',
    description: 'Random secret for NextAuth.js',
    example: 'your-secret-key-here',
    required: true,
    secret: true,
    generate: () => require('crypto').randomBytes(32).toString('hex'),
    validate: (value) => value.length >= 32,
    errorHelp: 'Must be at least 32 characters long'
  },

  // OAuth Providers
  GITHUB_CLIENT_ID: {
    category: 'OAuth Providers',
    description: 'GitHub OAuth App Client ID',
    example: 'your-github-client-id',
    required: false,
    validate: (value) => !value || value.length === 20,
    errorHelp: 'GitHub Client ID should be 20 characters'
  },
  GITHUB_CLIENT_SECRET: {
    category: 'OAuth Providers',
    description: 'GitHub OAuth App Client Secret',
    example: 'your-github-client-secret',
    required: false,
    secret: true,
    validate: (value) => !value || value.length === 40,
    errorHelp: 'GitHub Client Secret should be 40 characters'
  },
  GOOGLE_CLIENT_ID: {
    category: 'OAuth Providers',
    description: 'Google OAuth Client ID',
    example: 'your-google-client-id.apps.googleusercontent.com',
    required: false,
    validate: (value) => !value || value.endsWith('.apps.googleusercontent.com'),
    errorHelp: 'Should end with .apps.googleusercontent.com'
  },
  GOOGLE_CLIENT_SECRET: {
    category: 'OAuth Providers',
    description: 'Google OAuth Client Secret',
    example: 'your-google-client-secret',
    required: false,
    secret: true,
    validate: (value) => !value || value.length > 20,
    errorHelp: 'Google Client Secret should be provided by Google Cloud Console'
  },

  // AI Provider Keys
  OPENAI_API_KEY: {
    category: 'AI Providers',
    description: 'OpenAI API key for GPT models',
    example: 'sk-...',
    required: false,
    secret: true,
    validate: (value) => !value || value.startsWith('sk-'),
    errorHelp: 'OpenAI API keys start with "sk-"'
  },
  ANTHROPIC_API_KEY: {
    category: 'AI Providers',
    description: 'Anthropic API key for Claude models',
    example: 'sk-ant-...',
    required: false,
    secret: true,
    validate: (value) => !value || value.startsWith('sk-ant-'),
    errorHelp: 'Anthropic API keys start with "sk-ant-"'
  },
  GOOGLE_AI_API_KEY: {
    category: 'AI Providers',
    description: 'Google AI API key for Gemini models',
    example: 'your-google-ai-key',
    required: false,
    secret: true,
    validate: (value) => !value || value.length > 30,
    errorHelp: 'Google AI API keys are typically 39 characters'
  },
  GROQ_API_KEY: {
    category: 'AI Providers',
    description: 'Groq API key for fast inference',
    example: 'gsk_...',
    required: false,
    secret: true,
    validate: (value) => !value || value.startsWith('gsk_'),
    errorHelp: 'Groq API keys start with "gsk_"'
  },
  MISTRAL_API_KEY: {
    category: 'AI Providers',
    description: 'Mistral AI API key',
    example: 'your-mistral-key',
    required: false,
    secret: true,
    validate: (value) => !value || value.length > 20,
    errorHelp: 'Mistral API keys are provided by Mistral AI'
  },

  // Cloudflare R2 Storage Configuration
  R2_ACCOUNT_ID: {
    category: 'R2 Storage',
    description: 'Cloudflare account ID for R2 storage',
    example: '1234567890abcdef1234567890abcdef',
    required: false,
    secret: true,
    validate: (value) => !value || value.length === 32,
    errorHelp: 'R2 account ID is a 32-character string found in Cloudflare Dashboard > R2'
  },
  R2_ACCESS_KEY_ID: {
    category: 'R2 Storage',
    description: 'R2 API access key ID',
    example: '1234567890abcdef1234567890abcdef',
    required: false,
    validate: (value) => !value || value.length === 32,
    errorHelp: 'Create API token in Cloudflare Dashboard > R2 > Manage API Tokens'
  },
  R2_SECRET_ACCESS_KEY: {
    category: 'R2 Storage',
    description: 'R2 API secret access key',
    example: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    required: false,
    secret: true,
    validate: (value) => !value || value.length > 40,
    errorHelp: 'Secret key is shown once when creating the API token'
  },
  R2_BUCKET_NAME: {
    category: 'R2 Storage',
    description: 'R2 bucket name for component storage',
    example: 'revolutionary-ui-components',
    required: false,
    default: 'revolutionary-ui-components',
    validate: (value) => !value || /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value),
    errorHelp: 'Bucket names must be lowercase, start/end with letter/number, and contain only letters, numbers, and hyphens'
  },
  R2_PUBLIC_URL: {
    category: 'R2 Storage',
    description: 'Public URL for R2 bucket (optional)',
    example: 'https://components.revolutionary-ui.com',
    required: false,
    validate: (value) => !value || value.startsWith('https://'),
    errorHelp: 'Use custom domain or R2.dev URL for public access'
  },

  // Payment Configuration
  STRIPE_PUBLISHABLE_KEY: {
    category: 'Payments',
    description: 'Stripe publishable key (safe for browser)',
    example: 'pk_test_...',
    required: false,
    validate: (value) => !value || value.startsWith('pk_'),
    errorHelp: 'Stripe publishable keys start with "pk_"'
  },
  STRIPE_SECRET_KEY: {
    category: 'Payments',
    description: 'Stripe secret key (server-side only)',
    example: 'sk_test_...',
    required: false,
    secret: true,
    validate: (value) => !value || value.startsWith('sk_'),
    errorHelp: 'Stripe secret keys start with "sk_"'
  },
  STRIPE_WEBHOOK_SECRET: {
    category: 'Payments',
    description: 'Stripe webhook endpoint secret',
    example: 'whsec_...',
    required: false,
    secret: true,
    validate: (value) => !value || value.startsWith('whsec_'),
    errorHelp: 'Stripe webhook secrets start with "whsec_"'
  },

  // Email Configuration
  SMTP_HOST: {
    category: 'Email',
    description: 'SMTP server host',
    example: 'smtp.gmail.com',
    required: false,
    validate: (value) => !value || value.includes('.'),
    errorHelp: 'Should be a valid hostname'
  },
  SMTP_PORT: {
    category: 'Email',
    description: 'SMTP server port',
    example: '587',
    required: false,
    default: '587',
    validate: (value) => !value || !isNaN(parseInt(value)),
    errorHelp: 'Should be a valid port number'
  },
  SMTP_USER: {
    category: 'Email',
    description: 'SMTP username',
    example: 'your-email@gmail.com',
    required: false,
    validate: (value) => !value || value.includes('@'),
    errorHelp: 'Usually an email address'
  },
  SMTP_PASSWORD: {
    category: 'Email',
    description: 'SMTP password',
    example: 'your-smtp-password',
    required: false,
    secret: true,
    validate: (value) => true,
    errorHelp: 'Your email provider password or app-specific password'
  },
  EMAIL_FROM: {
    category: 'Email',
    description: 'Default "from" email address',
    example: 'noreply@revolutionary-ui.com',
    required: false,
    default: 'noreply@revolutionary-ui.com',
    validate: (value) => !value || value.includes('@'),
    errorHelp: 'Must be a valid email address'
  },

  // Analytics & Monitoring
  NEXT_PUBLIC_GA_MEASUREMENT_ID: {
    category: 'Analytics',
    description: 'Google Analytics 4 Measurement ID',
    example: 'G-XXXXXXXXXX',
    required: false,
    validate: (value) => !value || value.startsWith('G-'),
    errorHelp: 'GA4 Measurement IDs start with "G-"'
  },
  SENTRY_DSN: {
    category: 'Monitoring',
    description: 'Sentry error tracking DSN',
    example: 'https://xxx@xxx.ingest.sentry.io/xxx',
    required: false,
    validate: (value) => !value || value.startsWith('https://'),
    errorHelp: 'Sentry DSNs are HTTPS URLs'
  },

  // Storage Configuration
  S3_BUCKET_NAME: {
    category: 'Storage',
    description: 'AWS S3 bucket name for file storage',
    example: 'revolutionary-ui-assets',
    required: false,
    validate: (value) => !value || /^[a-z0-9.-]+$/.test(value),
    errorHelp: 'S3 bucket names can only contain lowercase letters, numbers, dots, and hyphens'
  },
  S3_ACCESS_KEY_ID: {
    category: 'Storage',
    description: 'AWS Access Key ID',
    example: 'AKIAIOSFODNN7EXAMPLE',
    required: false,
    validate: (value) => !value || value.startsWith('AKIA'),
    errorHelp: 'AWS Access Key IDs start with "AKIA"'
  },
  S3_SECRET_ACCESS_KEY: {
    category: 'Storage',
    description: 'AWS Secret Access Key',
    example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    required: false,
    secret: true,
    validate: (value) => !value || value.length === 40,
    errorHelp: 'AWS Secret Access Keys are 40 characters long'
  },
  S3_REGION: {
    category: 'Storage',
    description: 'AWS S3 region',
    example: 'us-east-1',
    required: false,
    default: 'us-east-1',
    validate: (value) => !value || /^[a-z]{2}-[a-z]+-\d$/.test(value),
    errorHelp: 'AWS regions follow pattern: us-east-1, eu-west-2, etc.'
  },

  // Feature Flags
  ENABLE_MARKETPLACE: {
    category: 'Features',
    description: 'Enable component marketplace',
    example: 'true',
    required: false,
    default: 'true',
    validate: (value) => !value || ['true', 'false'].includes(value),
    errorHelp: 'Must be "true" or "false"'
  },
  ENABLE_AI_GENERATION: {
    category: 'Features',
    description: 'Enable AI component generation',
    example: 'true',
    required: false,
    default: 'true',
    validate: (value) => !value || ['true', 'false'].includes(value),
    errorHelp: 'Must be "true" or "false"'
  },
  ENABLE_TEAM_FEATURES: {
    category: 'Features',
    description: 'Enable team collaboration features',
    example: 'true',
    required: false,
    default: 'true',
    validate: (value) => !value || ['true', 'false'].includes(value),
    errorHelp: 'Must be "true" or "false"'
  },
  ENABLE_PRIVATE_REGISTRY: {
    category: 'Features',
    description: 'Enable private NPM registry',
    example: 'true',
    required: false,
    default: 'false',
    validate: (value) => !value || ['true', 'false'].includes(value),
    errorHelp: 'Must be "true" or "false"'
  },

  // Development
  NODE_ENV: {
    category: 'Development',
    description: 'Node environment',
    example: 'development',
    required: false,
    default: 'development',
    validate: (value) => !value || ['development', 'production', 'test'].includes(value),
    errorHelp: 'Must be "development", "production", or "test"'
  },
  PORT: {
    category: 'Development',
    description: 'Server port',
    example: '3000',
    required: false,
    default: '3000',
    validate: (value) => !value || (!isNaN(parseInt(value)) && parseInt(value) > 0 && parseInt(value) < 65536),
    errorHelp: 'Must be a valid port number (1-65535)'
  },
};

// Test functions
async function testSupabaseAPI(url, anonKey) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const options = {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      };

      https.get(`${parsedUrl.href}/rest/v1/`, options, (res) => {
        resolve(res.statusCode === 200 || res.statusCode === 401);
      }).on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

async function testDatabaseConnection(connectionString) {
  try {
    // Try to connect using pg
    const { Client } = require('pg');
    const client = new Client({ connectionString });
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function testStripeKey(key) {
  // Basic validation - actual API test would require making a request
  if (key.startsWith('pk_test_') || key.startsWith('pk_live_')) {
    return { valid: true, mode: key.includes('_test_') ? 'test' : 'live' };
  }
  return { valid: false };
}

// Main setup class
class EnvironmentSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.currentEnv = {};
    this.newEnv = {};
    this.errors = {};
  }

  async run() {
    print.title('🚀 Revolutionary UI - Complete Environment Setup');
    print.info('This tool will help you configure all environment variables needed for Revolutionary UI.\n');

    // Load existing environment
    await this.loadExistingEnv();

    // Generate .env.sample
    await this.generateEnvSample();

    // Setup each category
    for (const category of this.getCategories()) {
      await this.setupCategory(category);
    }

    // Test configuration
    await this.testConfiguration();

    // Save configuration
    await this.saveConfiguration();

    this.rl.close();
    print.title('\n✨ Setup completed successfully!');
  }

  async loadExistingEnv() {
    print.section('📁 Loading existing configuration...');
    
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath });
      if (!result.error) {
        this.currentEnv = result.parsed || {};
        print.success(`Loaded ${Object.keys(this.currentEnv).length} existing variables from .env.local`);
      }
    } else {
      print.info('No existing .env.local found, starting fresh.');
    }
  }

  async generateEnvSample() {
    print.section('📝 Generating .env.sample...');
    
    let content = '# Revolutionary UI Environment Configuration\n';
    content += '# Generated on ' + new Date().toISOString() + '\n\n';

    for (const category of this.getCategories()) {
      content += `# ===== ${category} =====\n\n`;
      
      const vars = this.getVariablesByCategory(category);
      for (const [key, def] of vars) {
        if (def.description) {
          content += `# ${def.description}\n`;
        }
        if (def.required) {
          content += '# Required: Yes\n';
        }
        if (def.example) {
          content += `# Example: ${def.example}\n`;
        }
        content += `${key}=${def.example || def.default || ''}\n\n`;
      }
    }

    const samplePath = path.join(process.cwd(), '.env.sample');
    fs.writeFileSync(samplePath, content);
    print.success('Generated .env.sample with all available variables');
  }

  getCategories() {
    return [...new Set(Object.values(ENV_DEFINITIONS).map(def => def.category))];
  }

  getVariablesByCategory(category) {
    return Object.entries(ENV_DEFINITIONS).filter(([_, def]) => def.category === category);
  }

  async setupCategory(category) {
    print.section(`⚙️  Configuring ${category}`);
    
    const vars = this.getVariablesByCategory(category);
    
    for (const [key, def] of vars) {
      await this.setupVariable(key, def);
    }
  }

  async setupVariable(key, def) {
    console.log(); // Empty line for readability
    
    // Show description
    print.info(`${key}`);
    print.info(`  ${def.description}`);
    
    // Show current value if exists
    let currentValue = this.currentEnv[key];
    if (currentValue && def.secret) {
      const shown = currentValue.substring(0, 8) + '...' + currentValue.substring(currentValue.length - 4);
      print.info(`  Current: ${colors.dim}${shown}${colors.reset}`);
    } else if (currentValue) {
      print.info(`  Current: ${colors.green}${currentValue}${colors.reset}`);
    }

    // Generate value if needed
    if (def.generate && !currentValue) {
      const generated = def.generate();
      print.info(`  Generated: ${colors.cyan}${generated}${colors.reset}`);
      const useGenerated = await this.askYesNo('Use generated value?', true);
      if (useGenerated) {
        this.newEnv[key] = generated;
        return;
      }
    }

    // Determine default value
    let defaultValue = currentValue || def.default || '';
    
    // Handle required variables
    if (def.required && !defaultValue) {
      print.warning('  This variable is required!');
    }

    // Ask for value
    const prompt = def.required ? `  Enter value (required): ` : `  Enter value (optional, press Enter to skip): `;
    const value = await this.askQuestion(prompt, defaultValue);

    // Validate value
    if (value && def.validate && !def.validate(value)) {
      print.error(`  Invalid value: ${def.errorHelp}`);
      // Retry
      return this.setupVariable(key, def);
    }

    // Store value
    if (value) {
      this.newEnv[key] = value;
    }
  }

  async testConfiguration() {
    print.section('🧪 Testing configuration...');
    
    const tests = [
      {
        name: 'Supabase API',
        test: async () => {
          if (!this.newEnv.NEXT_PUBLIC_SUPABASE_URL || !this.newEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return { success: false, error: 'Missing Supabase configuration' };
          }
          const success = await testSupabaseAPI(
            this.newEnv.NEXT_PUBLIC_SUPABASE_URL,
            this.newEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
          );
          return { success, error: success ? null : 'Failed to connect to Supabase API' };
        }
      },
      {
        name: 'Database Connection',
        test: async () => {
          if (!this.newEnv.DATABASE_URL_PRISMA) {
            return { success: false, error: 'Missing database configuration' };
          }
          const success = await testDatabaseConnection(this.newEnv.DATABASE_URL_PRISMA);
          return { success, error: success ? null : 'Failed to connect to database' };
        }
      },
      {
        name: 'Direct Database Connection',
        test: async () => {
          if (!this.newEnv.DIRECT_URL) {
            return { success: false, error: 'Missing direct database URL' };
          }
          const success = await testDatabaseConnection(this.newEnv.DIRECT_URL);
          return { success, error: success ? null : 'Failed to connect directly to database' };
        }
      }
    ];

    let hasErrors = false;
    for (const test of tests) {
      process.stdout.write(`  Testing ${test.name}... `);
      const result = await test.test();
      if (result.success) {
        print.success('OK');
      } else {
        print.error('FAILED');
        print.error(`    ${result.error}`);
        hasErrors = true;
        
        // Ask to fix
        const shouldFix = await this.askYesNo(`    Would you like to fix this now?`, true);
        if (shouldFix) {
          await this.fixError(test.name, result.error);
          // Retry test
          const retryResult = await test.test();
          if (retryResult.success) {
            print.success('    Fixed!');
          } else {
            print.error('    Still failing. You may need to check your settings.');
          }
        }
      }
    }

    if (!hasErrors) {
      print.success('\nAll tests passed!');
    }
  }

  async fixError(testName, error) {
    print.section(`🔧 Fixing ${testName}`);
    
    if (testName === 'Supabase API') {
      print.info('\nCommon issues:');
      print.info('1. Wrong project URL (should be https://[ref].supabase.co)');
      print.info('2. Wrong anon key (should be a long JWT token)');
      print.info('3. Project might be paused in Supabase dashboard\n');
      
      await this.setupVariable('NEXT_PUBLIC_SUPABASE_URL', ENV_DEFINITIONS.NEXT_PUBLIC_SUPABASE_URL);
      await this.setupVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY', ENV_DEFINITIONS.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    } else if (testName.includes('Database')) {
      print.info('\nCommon issues:');
      print.info('1. Wrong password');
      print.info('2. Wrong connection pooler URL');
      print.info('3. Database might be paused\n');
      
      print.info('Tip: Check your Supabase dashboard for the correct connection strings.');
      
      if (testName === 'Database Connection') {
        await this.setupVariable('DATABASE_URL_PRISMA', ENV_DEFINITIONS.DATABASE_URL_PRISMA);
      } else {
        await this.setupVariable('DIRECT_URL', ENV_DEFINITIONS.DIRECT_URL);
      }
    }
  }

  async saveConfiguration() {
    print.section('💾 Saving configuration...');
    
    // Backup existing
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const backupPath = path.join(process.cwd(), `.env.local.backup.${Date.now()}`);
      fs.copyFileSync(envPath, backupPath);
      print.success(`Backed up existing .env.local to ${path.basename(backupPath)}`);
    }

    // Write new configuration
    let content = '# Revolutionary UI Environment Configuration\n';
    content += '# Generated on ' + new Date().toISOString() + '\n\n';

    for (const category of this.getCategories()) {
      const vars = this.getVariablesByCategory(category);
      const categoryVars = vars.filter(([key]) => this.newEnv[key]);
      
      if (categoryVars.length > 0) {
        content += `# ===== ${category} =====\n\n`;
        
        for (const [key, def] of categoryVars) {
          if (def.description) {
            content += `# ${def.description}\n`;
          }
          content += `${key}=${this.newEnv[key]}\n\n`;
        }
      }
    }

    fs.writeFileSync(envPath, content);
    print.success('Saved new configuration to .env.local');
    
    // Show summary
    print.section('📊 Configuration Summary');
    print.info(`Total variables configured: ${Object.keys(this.newEnv).length}`);
    
    const requiredVars = Object.entries(ENV_DEFINITIONS).filter(([_, def]) => def.required);
    const configuredRequired = requiredVars.filter(([key]) => this.newEnv[key]);
    print.info(`Required variables: ${configuredRequired.length}/${requiredVars.length}`);
    
    if (configuredRequired.length < requiredVars.length) {
      print.warning('\nMissing required variables:');
      requiredVars.forEach(([key, def]) => {
        if (!this.newEnv[key]) {
          print.warning(`  - ${key}: ${def.description}`);
        }
      });
    }
  }

  askQuestion(prompt, defaultValue = '') {
    return new Promise((resolve) => {
      const displayPrompt = defaultValue ? `${prompt}[${defaultValue}] ` : prompt;
      this.rl.question(displayPrompt, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  askYesNo(prompt, defaultYes = true) {
    const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
    return new Promise((resolve) => {
      this.rl.question(prompt + suffix, (answer) => {
        if (!answer.trim()) {
          resolve(defaultYes);
        } else {
          resolve(answer.toLowerCase().startsWith('y'));
        }
      });
    });
  }
}

// Auto-install pg if needed
async function ensureDependencies() {
  try {
    require('pg');
  } catch {
    print.warning('Installing required dependency: pg');
    execSync('npm install pg', { stdio: 'inherit' });
  }
}

// Main execution
async function main() {
  await ensureDependencies();
  const setup = new EnvironmentSetup();
  await setup.run();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EnvironmentSetup, ENV_DEFINITIONS };