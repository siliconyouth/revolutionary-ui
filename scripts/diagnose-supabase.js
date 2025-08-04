#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const print = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}`),
  info: (text) => console.log(`${text}`),
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
  detail: (text) => console.log(`${colors.cyan}   ${text}${colors.reset}`),
};

print.title('🔍 Supabase URL Diagnostic Tool');

const urlFromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cdrayydgsuuqpakquhit.supabase.co';
const projectRef = urlFromEnv.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

print.info('\nChecking Supabase project...');
print.detail(`URL: ${urlFromEnv}`);
print.detail(`Project Reference: ${projectRef || 'NOT FOUND'}`);

// Test different endpoints
async function testEndpoint(path, description) {
  const url = `${urlFromEnv}${path}`;
  print.info(`\nTesting ${description}...`);
  print.detail(`URL: ${url}`);
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          print.success(`${description} is working! (Status: ${res.statusCode})`);
          if (data && data.length < 200) {
            print.detail(`Response: ${data}`);
          }
          resolve(true);
        } else if (res.statusCode === 401) {
          print.warning(`${description} requires authentication (Status: ${res.statusCode})`);
          resolve(true); // Still means the endpoint exists
        } else if (res.statusCode === 404) {
          print.error(`${description} not found (Status: ${res.statusCode})`);
          resolve(false);
        } else {
          print.warning(`${description} returned status ${res.statusCode}`);
          if (data && data.length < 200) {
            print.detail(`Response: ${data}`);
          }
          resolve(false);
        }
      });
    }).on('error', (err) => {
      print.error(`Cannot reach ${description}: ${err.message}`);
      resolve(false);
    });
  });
}

async function checkDNS() {
  const dns = require('dns').promises;
  
  print.info('\nChecking DNS resolution...');
  
  // Check main domain
  try {
    const addresses = await dns.resolve4(`${projectRef}.supabase.co`);
    print.success(`Main domain resolves to: ${addresses.join(', ')}`);
  } catch (err) {
    print.error(`Main domain DNS failed: ${err.message}`);
  }
  
  // Check database domain
  try {
    const addresses = await dns.resolve4(`db.${projectRef}.supabase.co`);
    print.success(`Database domain resolves to: ${addresses.join(', ')}`);
  } catch (err) {
    print.error(`Database domain DNS failed: ${err.message}`);
    print.warning('This suggests the project reference might be incorrect');
  }
}

async function main() {
  // Test various endpoints
  await testEndpoint('/', 'Root endpoint');
  await testEndpoint('/rest/v1/', 'REST API endpoint');
  await testEndpoint('/auth/v1/health', 'Auth health endpoint');
  
  // Check DNS
  await checkDNS();
  
  print.title('\n📋 Diagnosis Summary:');
  print.info('\nIf you\'re seeing 404 errors and DNS failures, this usually means:');
  print.info('1. The project reference is incorrect');
  print.info('2. The project hasn\'t been created yet');
  print.info('3. The project URL has changed');
  
  print.info('\n🔧 To fix this:');
  print.info('1. Go to https://supabase.com/dashboard');
  print.info('2. Find your project');
  print.info('3. Go to Settings > API');
  print.info('4. Copy the correct "Project URL"');
  print.info('5. Run: node scripts/test-connection.js');
  print.info('6. Update the NEXT_PUBLIC_SUPABASE_URL when prompted');
}

main().catch(console.error);