#!/usr/bin/env node

// Check and install pg if needed
try {
  require('pg');
} catch (error) {
  console.log('Installing required package: pg...');
  require('child_process').execSync('npm install pg', { stdio: 'inherit' });
}

const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper to ask questions
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

// Helper to ask yes/no
const askYN = async (question, defaultYes = true) => {
  const answer = await ask(question + (defaultYes ? ' (Y/n): ' : ' (y/N): '));
  return defaultYes ? answer.toLowerCase() !== 'n' : answer.toLowerCase() === 'y';
};

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
  highlight: (text) => `${colors.bright}${colors.yellow}${text}${colors.reset}`,
};

print.title('🔍 Revolutionary UI - Interactive Database Connection Tester');

// Store current environment
let currentEnv = {};
const envPath = path.join(process.cwd(), '.env.local');

// Load existing .env.local if it exists
if (fs.existsSync(envPath)) {
  print.info('\nLoading existing .env.local...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      currentEnv[match[1].trim()] = match[2].trim();
    }
  });
  print.success(`Loaded ${Object.keys(currentEnv).length} environment variables`);
} else {
  print.warning('No .env.local found. Starting fresh.');
}

// Function to update environment
function updateEnv(updates) {
  Object.entries(updates).forEach(([key, value]) => {
    currentEnv[key] = value;
    process.env[key] = value;
  });
}

async function testSupabaseAPI() {
  print.info('\n1️⃣ Testing Supabase API endpoint...');
  
  const supabaseUrl = currentEnv.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    print.error('NEXT_PUBLIC_SUPABASE_URL not found');
    return false;
  }
  
  print.detail(`URL: ${supabaseUrl}`);
  
  // Parse the URL to ensure it's valid
  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch (e) {
    print.error('Invalid NEXT_PUBLIC_SUPABASE_URL format');
    return false;
  }
  
  return new Promise((resolve) => {
    https.get(parsedUrl.href, (res) => {
      if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
        print.success('Supabase API is reachable');
        resolve(true);
      } else {
        print.error(`Supabase API returned status ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      print.error(`Cannot reach Supabase: ${err.message}`);
      resolve(false);
    });
  });
}

async function testDirectConnection() {
  print.info('\n2️⃣ Testing direct database connection (port 5432)...');
  
  const directUrl = currentEnv.DIRECT_URL || currentEnv.DATABASE_URL;
  if (!directUrl) {
    print.error('DIRECT_URL not found');
    return false;
  }
  
  // Parse and mask the URL for display
  try {
    const parsed = new URL(directUrl);
    const masked = `postgresql://${parsed.username}:****@${parsed.host}${parsed.pathname}`;
    print.detail(`URL: ${masked}`);
  } catch (e) {
    print.error('Invalid URL format');
    return false;
  }
  
  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    print.success('Direct connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT current_database(), version()');
    print.detail(`Database: ${result.rows[0].current_database}`);
    print.detail(`Version: ${result.rows[0].version.split(',')[0]}`);
    
    await client.end();
    return true;
  } catch (error) {
    print.error('Direct connection failed!');
    print.detail(`Error: ${error.message}`);
    
    if (error.message.includes('password authentication failed')) {
      print.warning('The database password appears to be incorrect');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      print.warning('Cannot reach the database server');
    }
    
    return false;
  }
}

async function testPooledConnection() {
  print.info('\n3️⃣ Testing pooled connection (port 6543)...');
  
  const pooledUrl = currentEnv.DATABASE_URL_PRISMA;
  if (!pooledUrl) {
    print.error('DATABASE_URL_PRISMA not found');
    return false;
  }
  
  // Parse and mask the URL for display
  try {
    const parsed = new URL(pooledUrl);
    const masked = `postgresql://${parsed.username}:****@${parsed.host}${parsed.pathname}${parsed.search}`;
    print.detail(`URL: ${masked}`);
  } catch (e) {
    print.error('Invalid URL format');
    return false;
  }
  
  const client = new Client({
    connectionString: pooledUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    print.success('Pooled connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT 1 as test');
    print.detail(`Query test: ${result.rows[0].test === 1 ? 'OK' : 'Failed'}`);
    
    await client.end();
    return true;
  } catch (error) {
    print.error('Pooled connection failed!');
    print.detail(`Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const results = {
    api: await testSupabaseAPI(),
    direct: await testDirectConnection(),
    pooled: await testPooledConnection()
  };
  
  print.title('\n📊 Test Results:');
  print.info(`Supabase API: ${results.api ? '✅ OK' : '❌ Failed'}`);
  print.info(`Direct Connection: ${results.direct ? '✅ OK' : '❌ Failed'}`);
  print.info(`Pooled Connection: ${results.pooled ? '✅ OK' : '❌ Failed'}`);
  
  return results.api && results.direct && results.pooled;
}

async function updateSupabaseConfig() {
  print.title('\n🔧 Update Supabase Configuration');
  
  // Supabase URL
  print.info('\nSupabase Project URL');
  print.info('Found in: Supabase Dashboard > Settings > API');
  print.info('Example: https://abcdefghijk.supabase.co');
  if (currentEnv.NEXT_PUBLIC_SUPABASE_URL) {
    print.info(`Current: ${print.highlight(currentEnv.NEXT_PUBLIC_SUPABASE_URL)}`);
    if (!await askYN('Keep current URL?')) {
      const newUrl = await ask('Enter new NEXT_PUBLIC_SUPABASE_URL: ');
      updateEnv({ NEXT_PUBLIC_SUPABASE_URL: newUrl });
    }
  } else {
    const newUrl = await ask('Enter NEXT_PUBLIC_SUPABASE_URL: ');
    updateEnv({ NEXT_PUBLIC_SUPABASE_URL: newUrl });
  }
  
  // Extract project ref from URL for database URLs
  const projectRef = currentEnv.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  // Database password
  print.info('\nDatabase Password');
  print.info('Found in: Supabase Dashboard > Settings > Database');
  print.info('Note: This is the password you set when creating the project');
  const dbPassword = await ask('Enter your database password: ');
  
  if (projectRef && dbPassword) {
    // Generate all database URLs
    const dbUrl = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
    const dbUrlPrisma = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1`;
    
    print.info('\nGenerating database URLs...');
    updateEnv({
      DATABASE_URL: dbUrl,
      DATABASE_URL_PRISMA: dbUrlPrisma,
      DIRECT_URL: dbUrl
    });
    print.success('Database URLs generated');
  } else {
    // Manual entry
    print.info('\nEnter database URLs manually:');
    
    print.info('\nDirect Database URL (port 5432)');
    print.info('Example: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres');
    const dbUrl = await ask('Enter DATABASE_URL: ');
    updateEnv({ DATABASE_URL: dbUrl, DIRECT_URL: dbUrl });
    
    print.info('\nPooled Database URL (port 6543)');
    print.info('Example: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1');
    const dbUrlPrisma = await ask('Enter DATABASE_URL_PRISMA: ');
    updateEnv({ DATABASE_URL_PRISMA: dbUrlPrisma });
  }
  
  // Anon key
  print.info('\nSupabase Anonymous Key');
  print.info('Found in: Supabase Dashboard > Settings > API > anon key');
  if (currentEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const masked = currentEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...';
    print.info(`Current: ${print.highlight(masked)}`);
    if (!await askYN('Keep current key?')) {
      const newKey = await ask('Enter new NEXT_PUBLIC_SUPABASE_ANON_KEY: ');
      updateEnv({ NEXT_PUBLIC_SUPABASE_ANON_KEY: newKey });
    }
  } else {
    const newKey = await ask('Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: ');
    updateEnv({ NEXT_PUBLIC_SUPABASE_ANON_KEY: newKey });
  }
  
  // Service role key
  print.info('\nSupabase Service Role Key');
  print.info('Found in: Supabase Dashboard > Settings > API > service_role key');
  if (currentEnv.SUPABASE_SERVICE_ROLE_KEY) {
    const masked = currentEnv.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...';
    print.info(`Current: ${print.highlight(masked)}`);
    if (!await askYN('Keep current key?')) {
      const newKey = await ask('Enter new SUPABASE_SERVICE_ROLE_KEY: ');
      updateEnv({ SUPABASE_SERVICE_ROLE_KEY: newKey });
    }
  } else {
    const newKey = await ask('Enter SUPABASE_SERVICE_ROLE_KEY: ');
    updateEnv({ SUPABASE_SERVICE_ROLE_KEY: newKey });
  }
}

async function saveEnvFile() {
  print.title('\n💾 Saving Configuration');
  
  // Backup existing file
  if (fs.existsSync(envPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = envPath + `.backup-${timestamp}`;
    fs.copyFileSync(envPath, backupPath);
    print.success(`Backed up existing .env.local to ${path.basename(backupPath)}`);
  }
  
  // Generate new .env.local content
  let content = `# Revolutionary UI Environment Configuration
# Generated by test-connection.js on ${new Date().toISOString()}
# =============================================================================

`;
  
  // Group by category
  const categories = {
    'Supabase Configuration': [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ],
    'Database Connection': [
      'DATABASE_URL',
      'DATABASE_URL_PRISMA',
      'DIRECT_URL'
    ],
    'Authentication': [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET'
    ],
    'OAuth Providers': [
      'GITHUB_ID',
      'GITHUB_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ],
    'AI Providers': [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'GOOGLE_AI_API_KEY'
    ],
    'Feature Flags': [
      'NEXT_PUBLIC_ENABLE_MARKETPLACE',
      'NEXT_PUBLIC_ENABLE_AI_GENERATION',
      'NEXT_PUBLIC_ENABLE_COMMUNITY_SUBMISSIONS'
    ]
  };
  
  Object.entries(categories).forEach(([category, keys]) => {
    const categoryVars = keys.filter(key => currentEnv[key]);
    if (categoryVars.length > 0) {
      content += `# ${category}\n# ${'='.repeat(70)}\n\n`;
      categoryVars.forEach(key => {
        content += `${key}=${currentEnv[key]}\n`;
      });
      content += '\n';
    }
  });
  
  // Add any other variables not in categories
  const categorizedKeys = Object.values(categories).flat();
  const otherKeys = Object.keys(currentEnv).filter(key => !categorizedKeys.includes(key));
  if (otherKeys.length > 0) {
    content += `# Other Configuration\n# ${'='.repeat(70)}\n\n`;
    otherKeys.forEach(key => {
      content += `${key}=${currentEnv[key]}\n`;
    });
  }
  
  // Write file
  fs.writeFileSync(envPath, content);
  print.success('Saved new .env.local file');
}

// Main interactive loop
async function main() {
  let allTestsPassed = false;
  
  while (!allTestsPassed) {
    // Run tests
    allTestsPassed = await runTests();
    
    if (!allTestsPassed) {
      print.warning('\nSome tests failed. Let\'s fix the configuration.');
      
      if (await askYN('\nUpdate Supabase configuration?')) {
        await updateSupabaseConfig();
      } else {
        print.info('Exiting without changes.');
        rl.close();
        return;
      }
      
      if (await askYN('\nTest connection again?')) {
        continue;
      } else {
        break;
      }
    }
  }
  
  if (allTestsPassed) {
    print.success('\n🎉 All connections working!');
    
    // Save the working configuration
    if (await askYN('\nSave this working configuration to .env.local?')) {
      await saveEnvFile();
      
      print.info('\n✅ Next steps:');
      print.info('1. Run: npm install');
      print.info('2. Run: node scripts/setup-database.js');
      print.info('3. Run: cd marketplace-nextjs && npm run dev');
    }
  }
  
  rl.close();
}

// Run the interactive tester
main().catch(error => {
  print.error('Test failed with error:');
  console.error(error);
  rl.close();
});