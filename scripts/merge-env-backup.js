#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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
  added: (text) => console.log(`${colors.green}+ ${text}${colors.reset}`),
  skipped: (text) => console.log(`${colors.dim}- ${text}${colors.reset}`),
};

// Parse .env file content
function parseEnvFile(content) {
  const lines = content.split('\n');
  const result = {};
  const comments = {};
  let lastComment = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      lastComment = '';
      continue;
    }
    
    // Capture comments
    if (trimmed.startsWith('#')) {
      lastComment = trimmed;
      continue;
    }
    
    // Parse key=value
    const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      result[key] = value;
      if (lastComment) {
        comments[key] = lastComment;
      }
      lastComment = '';
    }
  }
  
  return { vars: result, comments };
}

// Main function
async function mergeEnvFiles() {
  print.title('🔄 Revolutionary UI - Merge Environment Variables from Backup');
  
  const currentPath = path.join(process.cwd(), '.env.local');
  const backupPath = path.join(process.cwd(), '.env.local.backup');
  
  // Check if files exist
  if (!fs.existsSync(currentPath)) {
    print.error('No .env.local file found!');
    return;
  }
  
  if (!fs.existsSync(backupPath)) {
    print.error('No .env.local.backup file found!');
    return;
  }
  
  // Read and parse both files
  print.section('📖 Reading files...');
  
  const currentContent = fs.readFileSync(currentPath, 'utf8');
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  
  const { vars: currentVars, comments: currentComments } = parseEnvFile(currentContent);
  const { vars: backupVars, comments: backupComments } = parseEnvFile(backupContent);
  
  print.success(`Current .env.local has ${Object.keys(currentVars).length} variables`);
  print.success(`Backup has ${Object.keys(backupVars).length} variables`);
  
  // Find missing variables
  print.section('🔍 Analyzing differences...');
  
  const missing = [];
  const different = [];
  
  for (const [key, value] of Object.entries(backupVars)) {
    if (!(key in currentVars)) {
      missing.push({ key, value, comment: backupComments[key] });
    } else if (currentVars[key] !== value) {
      different.push({ 
        key, 
        currentValue: currentVars[key], 
        backupValue: value,
        comment: backupComments[key] 
      });
    }
  }
  
  print.info(`Found ${missing.length} missing variables`);
  print.info(`Found ${different.length} variables with different values`);
  
  // Show missing variables
  if (missing.length > 0) {
    print.section('📝 Missing variables to add:');
    
    for (const { key, value, comment } of missing) {
      if (comment) {
        print.info(`  ${comment}`);
      }
      
      // Mask sensitive values
      const isSensitive = key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD');
      const displayValue = isSensitive && value.length > 10 
        ? value.substring(0, 6) + '...' + value.substring(value.length - 4)
        : value;
      
      print.added(`${key}=${displayValue}`);
    }
  }
  
  // Show different values (for reference)
  if (different.length > 0) {
    print.section('ℹ️  Variables with different values (keeping current):');
    
    for (const { key, currentValue, backupValue } of different) {
      const isSensitive = key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD');
      
      if (isSensitive) {
        print.skipped(`${key} (different but keeping current)`);
      } else {
        print.info(`  ${key}:`);
        print.info(`    Current: ${currentValue}`);
        print.info(`    Backup:  ${backupValue}`);
      }
    }
  }
  
  // Add missing variables
  if (missing.length > 0) {
    print.section('✍️  Adding missing variables...');
    
    // Create backup of current file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newBackupPath = path.join(process.cwd(), `.env.local.backup.${timestamp}`);
    fs.copyFileSync(currentPath, newBackupPath);
    print.success(`Created backup: ${path.basename(newBackupPath)}`);
    
    // Append missing variables
    let appendContent = '\n\n# ===== Restored from backup =====\n';
    appendContent += `# Restored on ${new Date().toISOString()}\n\n`;
    
    for (const { key, value, comment } of missing) {
      if (comment) {
        appendContent += `${comment}\n`;
      }
      appendContent += `${key}=${value}\n`;
    }
    
    fs.appendFileSync(currentPath, appendContent);
    print.success(`Added ${missing.length} missing variables to .env.local`);
    
    // Summary of what was added
    print.section('📊 Summary of added variables:');
    
    const categories = {
      oauth: [],
      ai: [],
      email: [],
      analytics: [],
      storage: [],
      other: []
    };
    
    for (const { key } of missing) {
      if (key.includes('GITHUB') || key.includes('GOOGLE_CLIENT')) {
        categories.oauth.push(key);
      } else if (key.includes('AI_') || key.includes('OPENAI') || key.includes('ANTHROPIC')) {
        categories.ai.push(key);
      } else if (key.includes('SMTP') || key.includes('EMAIL')) {
        categories.email.push(key);
      } else if (key.includes('GA_') || key.includes('SENTRY')) {
        categories.analytics.push(key);
      } else if (key.includes('S3_')) {
        categories.storage.push(key);
      } else {
        categories.other.push(key);
      }
    }
    
    for (const [category, keys] of Object.entries(categories)) {
      if (keys.length > 0) {
        print.info(`  ${category.charAt(0).toUpperCase() + category.slice(1)}: ${keys.join(', ')}`);
      }
    }
    
    print.success('\n✨ Environment merge completed!');
    print.info('Run "node scripts/test-all-env.js" to verify the configuration.');
  } else {
    print.success('\n✨ No missing variables found! Your .env.local is complete.');
  }
}

// Run the merge
if (require.main === module) {
  mergeEnvFiles().catch(console.error);
}

module.exports = { mergeEnvFiles };