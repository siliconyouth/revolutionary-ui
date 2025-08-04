#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
  highlight: (text) => `${colors.bright}${colors.yellow}${text}${colors.reset}`,
};

print.title('🔧 Revolutionary UI - Environment Fix Tool');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  print.error('.env.local not found!');
  process.exit(1);
}

// Read the file
let content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

print.info('\nChecking for common issues...\n');

let hasIssues = false;
let fixedContent = content;

// Check each line
lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  // Skip comments and empty lines
  if (!trimmed || trimmed.startsWith('#')) return;
  
  // Parse key=value
  const match = line.match(/^([^=]+)=(.*)$/);
  if (!match) return;
  
  const key = match[1].trim();
  const value = match[2].trim();
  
  // Check for database URL issues
  if (key.includes('DATABASE_URL')) {
    // Check for "potgres" typo
    if (value.includes('/potgres')) {
      hasIssues = true;
      print.error(`Found typo in ${key} (line ${index + 1}):`);
      print.info(`  Current: ${print.highlight('/potgres')}`);
      print.info(`  Should be: ${print.highlight('/postgres')}`);
      
      const fixed = value.replace('/potgres', '/postgres');
      fixedContent = fixedContent.replace(line, `${key}=${fixed}`);
      print.success('Fixed!\n');
    }
    
    // Check for missing postgres at the end
    if (value.includes('.supabase.co:5432/') && !value.includes('.supabase.co:5432/postgres')) {
      hasIssues = true;
      print.error(`Missing database name in ${key} (line ${index + 1}):`);
      print.info('  Should end with: /postgres');
      
      const fixed = value.replace('.supabase.co:5432/', '.supabase.co:5432/postgres');
      fixedContent = fixedContent.replace(line, `${key}=${fixed}`);
      print.success('Fixed!\n');
    }
    
    if (value.includes('.supabase.co:6543/') && !value.includes('.supabase.co:6543/postgres')) {
      hasIssues = true;
      print.error(`Missing database name in ${key} (line ${index + 1}):`);
      print.info('  Should have: /postgres before the ?');
      
      const fixed = value.replace('.supabase.co:6543/', '.supabase.co:6543/postgres');
      fixedContent = fixedContent.replace(line, `${key}=${fixed}`);
      print.success('Fixed!\n');
    }
    
    // Show the value for verification (masked)
    const masked = value.replace(/postgres:([^@]+)@/, 'postgres:****@');
    print.info(`${key}: ${masked}`);
  }
});

// Additional checks
print.info('\nChecking required variables...\n');

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'DATABASE_URL_PRISMA',
  'DIRECT_URL'
];

const envVars = {};
lines.forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const missing = required.filter(key => !envVars[key] || envVars[key] === '');
if (missing.length > 0) {
  hasIssues = true;
  print.error('Missing required variables:');
  missing.forEach(key => print.info(`  - ${key}`));
  print.info('\nRun: node scripts/setup-env.js to configure these\n');
}

// Save fixes if any
if (hasIssues && fixedContent !== content) {
  // Backup original
  const backupPath = envPath + '.backup-' + Date.now();
  fs.writeFileSync(backupPath, content);
  print.info(`\nBacked up original to: ${backupPath}`);
  
  // Write fixed content
  fs.writeFileSync(envPath, fixedContent);
  print.success('Fixed .env.local file!');
  
  print.info('\nPlease run the database setup again:');
  print.info('  node scripts/setup-database.js');
} else if (!hasIssues) {
  print.success('No issues found in .env.local!');
  
  // Show current database URLs for verification
  print.info('\nCurrent database configuration:');
  if (envVars.DATABASE_URL) {
    const masked = envVars.DATABASE_URL.replace(/postgres:([^@]+)@/, 'postgres:****@');
    print.info(`DATABASE_URL: ${masked}`);
  }
  if (envVars.DATABASE_URL_PRISMA) {
    const masked = envVars.DATABASE_URL_PRISMA.replace(/postgres:([^@]+)@/, 'postgres:****@');
    print.info(`DATABASE_URL_PRISMA: ${masked}`);
  }
} else {
  print.warning('Found issues but no automatic fixes available.');
  print.info('Please check your .env.local manually.');
}