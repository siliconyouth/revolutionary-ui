#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const https = require('https');
const { URL } = require('url');
const { execSync } = require('child_process');

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
  value: (text) => console.log(`${colors.green}${text}${colors.reset}`),
};

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  missing: 0,
  details: []
};

// Load environment variables
function loadEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    print.error('No .env.local file found!');
    process.exit(1);
  }
  
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    print.error('Failed to load .env.local:');
    console.error(result.error);
    process.exit(1);
  }
  
  return result.parsed || {};
}

// Test functions
async function testSupabaseAPI(url, anonKey) {
  try {
    const parsedUrl = new URL(url);
    return new Promise((resolve) => {
      const options = {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      };

      https.get(`${parsedUrl.href}rest/v1/`, options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 401) {
          resolve({ success: true, message: 'API endpoint accessible' });
        } else {
          resolve({ success: false, message: `HTTP ${res.statusCode}` });
        }
      }).on('error', (err) => {
        resolve({ success: false, message: err.message });
      });
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function testDatabaseConnection(connectionString, name) {
  try {
    // Ensure pg is installed
    try {
      require('pg');
    } catch {
      return { success: false, message: 'pg package not installed' };
    }
    
    const { Client } = require('pg');
    const client = new Client({ connectionString });
    
    await client.connect();
    const result = await client.query('SELECT current_database(), version()');
    await client.end();
    
    return { 
      success: true, 
      message: `Connected to ${result.rows[0].current_database}` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.message.split('\n')[0] 
    };
  }
}

async function testAPIKey(key, provider) {
  // Basic validation for API key formats
  const patterns = {
    openai: /^sk-[A-Za-z0-9_-]{20,}$/,  // Updated: sk- followed by 20+ chars
    anthropic: /^sk-ant-[A-Za-z0-9_-]{20,}$/,  // Updated: sk-ant- followed by 20+ chars
    stripe_secret: /^sk_(test|live)_[A-Za-z0-9]{24,}$/,
    stripe_public: /^pk_(test|live)_[A-Za-z0-9]{24,}$/,
    github: /^[A-Za-z0-9]{20}$/,
    github_secret: /^[A-Za-z0-9]{40}$/,
  };
  
  if (patterns[provider]) {
    const valid = patterns[provider].test(key);
    let message = 'Valid format';
    if (!valid) {
      if (provider === 'openai') {
        message = `Invalid format (expected: sk-xxxxx..., got: ${key.substring(0, 10)}...)`;
      } else if (provider === 'anthropic') {
        message = `Invalid format (expected: sk-ant-xxxxx..., got: ${key.substring(0, 15)}...)`;
      } else {
        message = 'Invalid format';
      }
    }
    return {
      success: valid,
      message
    };
  }
  
  return {
    success: true,
    message: 'Format check not available'
  };
}

async function testURL(url, name) {
  try {
    const parsedUrl = new URL(url);
    
    // Special handling for localhost
    if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
      return { success: true, message: 'Local URL' };
    }
    
    return new Promise((resolve) => {
      const protocol = parsedUrl.protocol === 'https:' ? https : require('http');
      
      protocol.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ success: true, message: `HTTP ${res.statusCode}` });
        } else {
          resolve({ success: false, message: `HTTP ${res.statusCode}` });
        }
      }).on('error', (err) => {
        resolve({ success: false, message: err.message });
      });
    });
  } catch (error) {
    return { success: false, message: 'Invalid URL format' };
  }
}

// Main test runner
async function runTests() {
  print.title('🧪 Revolutionary UI - Environment Variables Test');
  
  const env = loadEnvironment();
  print.success(`Loaded ${Object.keys(env).length} environment variables\n`);
  
  // Test categories
  const tests = [
    {
      category: 'Supabase Configuration',
      tests: [
        {
          name: 'NEXT_PUBLIC_SUPABASE_URL',
          required: true,
          test: async () => {
            const value = env.NEXT_PUBLIC_SUPABASE_URL;
            if (!value) return { success: false, message: 'Not set' };
            return testURL(value, 'Supabase URL');
          }
        },
        {
          name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          required: true,
          test: async () => {
            const value = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (!value) return { success: false, message: 'Not set' };
            if (value.length < 50) return { success: false, message: 'Too short' };
            return { success: true, message: 'Valid format' };
          }
        },
        {
          name: 'Supabase API Connection',
          required: true,
          test: async () => {
            if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
              return { success: false, message: 'Missing credentials' };
            }
            return testSupabaseAPI(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
          }
        },
        {
          name: 'SUPABASE_SERVICE_ROLE_KEY',
          required: false,
          test: async () => {
            const value = env.SUPABASE_SERVICE_ROLE_KEY;
            if (!value) return { success: false, message: 'Not set (optional)' };
            if (value.length < 50) return { success: false, message: 'Too short' };
            return { success: true, message: 'Valid format' };
          }
        }
      ]
    },
    {
      category: 'Database Configuration',
      tests: [
        {
          name: 'DATABASE_URL',
          required: true,
          test: async () => {
            const value = env.DATABASE_URL;
            if (!value) return { success: false, message: 'Not set' };
            if (!value.startsWith('postgresql://')) return { success: false, message: 'Invalid protocol' };
            return { success: true, message: 'Valid format' };
          }
        },
        {
          name: 'DATABASE_URL_PRISMA',
          required: true,
          test: async () => {
            const value = env.DATABASE_URL_PRISMA;
            if (!value) return { success: false, message: 'Not set' };
            return testDatabaseConnection(value, 'Prisma pooled connection');
          }
        },
        {
          name: 'DIRECT_URL',
          required: true,
          test: async () => {
            const value = env.DIRECT_URL;
            if (!value) return { success: false, message: 'Not set' };
            return testDatabaseConnection(value, 'Direct connection');
          }
        }
      ]
    },
    {
      category: 'Authentication',
      tests: [
        {
          name: 'NEXTAUTH_URL',
          required: true,
          test: async () => {
            const value = env.NEXTAUTH_URL;
            if (!value) return { success: false, message: 'Not set' };
            return testURL(value, 'NextAuth URL');
          }
        },
        {
          name: 'NEXTAUTH_SECRET',
          required: true,
          test: async () => {
            const value = env.NEXTAUTH_SECRET;
            if (!value) return { success: false, message: 'Not set' };
            if (value.length < 32) return { success: false, message: 'Too short (min 32 chars)' };
            return { success: true, message: 'Valid length' };
          }
        }
      ]
    },
    {
      category: 'OAuth Providers',
      tests: [
        {
          name: 'GITHUB_CLIENT_ID',
          required: false,
          test: async () => {
            const value = env.GITHUB_CLIENT_ID;
            if (!value) return { success: false, message: 'Not set (optional)' };
            return testAPIKey(value, 'github');
          }
        },
        {
          name: 'GITHUB_CLIENT_SECRET',
          required: false,
          test: async () => {
            const value = env.GITHUB_CLIENT_SECRET;
            if (!value) return { success: false, message: 'Not set (optional)' };
            return testAPIKey(value, 'github_secret');
          }
        },
        {
          name: 'GOOGLE_CLIENT_ID',
          required: false,
          test: async () => {
            const value = env.GOOGLE_CLIENT_ID;
            if (!value) return { success: false, message: 'Not set (optional)' };
            if (!value.endsWith('.apps.googleusercontent.com')) {
              return { success: false, message: 'Invalid format' };
            }
            return { success: true, message: 'Valid format' };
          }
        },
        {
          name: 'GOOGLE_CLIENT_SECRET',
          required: false,
          test: async () => {
            const value = env.GOOGLE_CLIENT_SECRET;
            if (!value) return { success: false, message: 'Not set (optional)' };
            return { success: true, message: 'Set' };
          }
        }
      ]
    },
    {
      category: 'AI Providers',
      tests: [
        {
          name: 'OPENAI_API_KEY',
          required: false,
          test: async () => {
            const value = env.OPENAI_API_KEY;
            if (!value) return { success: false, message: 'Not set (optional)' };
            return testAPIKey(value, 'openai');
          }
        },
        {
          name: 'ANTHROPIC_API_KEY',
          required: false,
          test: async () => {
            const value = env.ANTHROPIC_API_KEY;
            if (!value) return { success: false, message: 'Not set (optional)' };
            return testAPIKey(value, 'anthropic');
          }
        },
        {
          name: 'GOOGLE_AI_API_KEY',
          required: false,
          test: async () => {
            const value = env.GOOGLE_AI_API_KEY;
            if (!value) return { success: false, message: 'Not set (optional)' };
            return { success: true, message: 'Set' };
          }
        },
        {
          name: 'GROQ_API_KEY',
          required: false,
          test: async () => {
            const value = env.GROQ_API_KEY;
            if (!value) return { success: false, message: 'Not set (optional)' };
            if (!value.startsWith('gsk_')) return { success: false, message: 'Invalid format' };
            return { success: true, message: 'Valid format' };
          }
        },
        {
          name: 'MISTRAL_API_KEY',
          required: false,
          test: async () => {
            const value = env.MISTRAL_API_KEY;
            if (!value) return { success: false, message: 'Not set (optional)' };
            return { success: true, message: 'Set' };
          }
        }
      ]
    },
    {
      category: 'Payment Configuration',
      tests: [
        {
          name: 'STRIPE_PUBLISHABLE_KEY',
          required: false,
          test: async () => {
            const value = env.STRIPE_PUBLISHABLE_KEY;
            if (!value) return { success: false, message: 'Not set (optional)' };
            return testAPIKey(value, 'stripe_public');
          }
        },
        {
          name: 'STRIPE_SECRET_KEY',
          required: false,
          test: async () => {
            const value = env.STRIPE_SECRET_KEY;
            if (!value) return { success: false, message: 'Not set (optional)' };
            return testAPIKey(value, 'stripe_secret');
          }
        },
        {
          name: 'STRIPE_WEBHOOK_SECRET',
          required: false,
          test: async () => {
            const value = env.STRIPE_WEBHOOK_SECRET;
            if (!value) return { success: false, message: 'Not set (optional)' };
            if (!value.startsWith('whsec_')) return { success: false, message: 'Invalid format' };
            return { success: true, message: 'Valid format' };
          }
        }
      ]
    },
    {
      category: 'Feature Flags',
      tests: [
        {
          name: 'ENABLE_MARKETPLACE',
          required: false,
          test: async () => {
            const value = env.ENABLE_MARKETPLACE;
            if (!value) return { success: true, message: 'Not set (defaults to true)' };
            if (!['true', 'false'].includes(value)) return { success: false, message: 'Must be true/false' };
            return { success: true, message: value };
          }
        },
        {
          name: 'ENABLE_AI_GENERATION',
          required: false,
          test: async () => {
            const value = env.ENABLE_AI_GENERATION;
            if (!value) return { success: true, message: 'Not set (defaults to true)' };
            if (!['true', 'false'].includes(value)) return { success: false, message: 'Must be true/false' };
            return { success: true, message: value };
          }
        }
      ]
    }
  ];
  
  // Run all tests
  for (const category of tests) {
    print.section(`Testing ${category.category}`);
    
    for (const test of category.tests) {
      results.total++;
      process.stdout.write(`  ${test.name}... `);
      
      try {
        const result = await test.test();
        
        if (result.success) {
          print.success(result.message);
          results.passed++;
        } else {
          if (test.required) {
            print.error(result.message);
            results.failed++;
          } else {
            print.warning(result.message);
            results.warnings++;
          }
        }
        
        results.details.push({
          category: category.category,
          name: test.name,
          required: test.required,
          ...result
        });
      } catch (error) {
        print.error(`Error: ${error.message}`);
        results.failed++;
        results.details.push({
          category: category.category,
          name: test.name,
          required: test.required,
          success: false,
          message: error.message
        });
      }
    }
  }
  
  // Summary
  print.title('\n📊 Test Summary');
  console.log(`Total tests: ${results.total}`);
  print.success(`Passed: ${results.passed}`);
  if (results.failed > 0) print.error(`Failed: ${results.failed}`);
  if (results.warnings > 0) print.warning(`Warnings: ${results.warnings}`);
  
  // Show failed required tests
  const failedRequired = results.details.filter(r => !r.success && r.required);
  if (failedRequired.length > 0) {
    print.section('\n🚨 Required Variables That Failed:');
    failedRequired.forEach(test => {
      print.error(`${test.name}: ${test.message}`);
    });
  }
  
  // Show recommendations
  if (results.failed > 0) {
    print.section('\n💡 Recommendations:');
    print.info('1. Run: node scripts/setup-environment-complete.js');
    print.info('2. This will guide you through fixing all configuration issues');
    print.info('3. Or manually edit .env.local to fix the failed variables');
  }
  
  return results.failed === 0;
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
  const success = await runTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}