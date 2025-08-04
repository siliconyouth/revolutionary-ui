#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { ENV_COMPLETE_DEFINITIONS } = require('./env-definitions-complete');

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

class CompleteEnvironmentSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    this.currentEnv = {};
    this.backupEnv = {};
    this.newEnv = {};
    this.selectedCategories = [];
    this.mode = 'interactive'; // 'interactive', 'quick', 'full'
  }

  async run() {
    print.title('🚀 Revolutionary UI - Complete Environment Setup');
    print.info('This tool will help you configure ALL available environment variables.\n');

    // Load existing environments
    await this.loadEnvironments();

    // Choose setup mode
    await this.chooseSetupMode();

    // Setup based on mode
    if (this.mode === 'quick') {
      await this.quickSetup();
    } else if (this.mode === 'full') {
      await this.fullSetup();
    } else {
      await this.interactiveSetup();
    }

    // Test critical configurations
    await this.testConfiguration();

    // Save configuration
    await this.saveConfiguration();

    // Show summary
    await this.showSummary();

    this.rl.close();
  }

  async loadEnvironments() {
    print.section('📁 Loading existing configurations...');
    
    // Load current .env.local
    const currentPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(currentPath)) {
      const result = dotenv.config({ path: currentPath });
      this.currentEnv = result.parsed || {};
      print.success(`Loaded ${Object.keys(this.currentEnv).length} variables from .env.local`);
    }

    // Load backup
    const backupPath = path.join(process.cwd(), '.env.local.backup');
    if (fs.existsSync(backupPath)) {
      const result = dotenv.config({ path: backupPath });
      this.backupEnv = result.parsed || {};
      print.success(`Found backup with ${Object.keys(this.backupEnv).length} variables`);
    }

    // Merge unique variables from backup
    let mergedCount = 0;
    for (const [key, value] of Object.entries(this.backupEnv)) {
      if (!this.currentEnv[key]) {
        mergedCount++;
      }
    }
    if (mergedCount > 0) {
      print.info(`Found ${mergedCount} additional variables in backup`);
    }
  }

  async chooseSetupMode() {
    print.section('🎯 Choose Setup Mode');
    console.log('\n1. Quick Setup - Only configure missing required variables');
    console.log('2. Interactive Setup - Choose categories to configure');
    console.log('3. Full Setup - Configure all variables\n');

    const choice = await this.askQuestion('Select mode (1-3): ', '2');
    
    switch (choice) {
      case '1':
        this.mode = 'quick';
        print.info('Quick setup selected - configuring only required variables');
        break;
      case '3':
        this.mode = 'full';
        print.info('Full setup selected - configuring all variables');
        break;
      default:
        this.mode = 'interactive';
        print.info('Interactive setup selected');
    }
  }

  async quickSetup() {
    print.section('⚡ Quick Setup - Required Variables Only');
    
    // Copy all existing values
    this.newEnv = { ...this.currentEnv };

    // Find and setup only required missing variables
    for (const [categoryKey, category] of Object.entries(ENV_COMPLETE_DEFINITIONS)) {
      const requiredVars = Object.entries(category.vars).filter(([_, def]) => def.required);
      const missingRequired = requiredVars.filter(([key]) => !this.currentEnv[key]);
      
      if (missingRequired.length > 0) {
        print.section(`Setting up ${category.title}`);
        
        for (const [key, def] of missingRequired) {
          await this.setupVariable(key, def);
        }
      }
    }
  }

  async fullSetup() {
    print.section('📋 Full Setup - All Variables');
    
    // Copy existing values
    this.newEnv = { ...this.currentEnv };

    // Setup all categories
    for (const [categoryKey, category] of Object.entries(ENV_COMPLETE_DEFINITIONS)) {
      const shouldSetup = await this.askYesNo(
        `\nConfigure ${category.title}?`,
        true
      );
      
      if (shouldSetup) {
        await this.setupCategory(categoryKey, category);
      } else {
        // Copy existing values for skipped categories
        for (const varName of Object.keys(category.vars)) {
          if (this.currentEnv[varName]) {
            this.newEnv[varName] = this.currentEnv[varName];
          }
        }
      }
    }
  }

  async interactiveSetup() {
    print.section('📋 Select Categories to Configure');
    
    // Copy existing values
    this.newEnv = { ...this.currentEnv };

    // Show categories with status
    const categories = Object.entries(ENV_COMPLETE_DEFINITIONS);
    console.log('\nAvailable categories:\n');
    
    categories.forEach(([key, category], index) => {
      const vars = Object.keys(category.vars);
      const configured = vars.filter(v => this.currentEnv[v]).length;
      const total = vars.length;
      const status = configured === total ? '✅' : configured > 0 ? '🟡' : '❌';
      
      console.log(`${status} ${index + 1}. ${category.title} (${configured}/${total} configured)`);
    });

    console.log('\nEnter category numbers to configure (comma-separated, or "all"):\n');
    const selection = await this.askQuestion('Categories: ', '');
    
    if (selection.toLowerCase() === 'all') {
      this.selectedCategories = categories.map(([key]) => key);
    } else {
      const indices = selection.split(',').map(s => parseInt(s.trim()) - 1);
      this.selectedCategories = indices
        .filter(i => i >= 0 && i < categories.length)
        .map(i => categories[i][0]);
    }

    // Setup selected categories
    for (const categoryKey of this.selectedCategories) {
      await this.setupCategory(categoryKey, ENV_COMPLETE_DEFINITIONS[categoryKey]);
    }

    // Copy non-selected existing values
    for (const [key, value] of Object.entries(this.currentEnv)) {
      if (!(key in this.newEnv)) {
        this.newEnv[key] = value;
      }
    }
  }

  async setupCategory(categoryKey, category) {
    print.section(`⚙️  Configuring ${category.title}`);
    
    const vars = Object.entries(category.vars);
    const requiredVars = vars.filter(([_, def]) => def.required);
    const optionalVars = vars.filter(([_, def]) => !def.required);

    // Always setup required variables
    if (requiredVars.length > 0) {
      print.info(`\n${requiredVars.length} required variables:`);
      for (const [key, def] of requiredVars) {
        await this.setupVariable(key, def);
      }
    }

    // Ask about optional variables
    if (optionalVars.length > 0) {
      const setupOptional = await this.askYesNo(
        `\nConfigure ${optionalVars.length} optional variables?`,
        false
      );
      
      if (setupOptional) {
        for (const [key, def] of optionalVars) {
          await this.setupVariable(key, def);
        }
      } else {
        // Keep existing values for skipped optional vars
        for (const [key] of optionalVars) {
          if (this.currentEnv[key]) {
            this.newEnv[key] = this.currentEnv[key];
          }
        }
      }
    }
  }

  async setupVariable(key, def) {
    console.log(); // Empty line for readability
    
    // Show variable info
    print.info(`${colors.bright}${key}${colors.reset}`);
    print.info(`  ${def.description}`);
    
    // Show required status
    if (def.required) {
      print.warning('  ⚠️  Required variable');
    } else {
      print.info(`  ${colors.dim}Optional${colors.reset}`);
    }

    // Show additional helpful information
    if (def.explanation) {
      print.info(`  ${colors.dim}ℹ️  ${def.explanation}${colors.reset}`);
    }

    // Show documentation link
    if (def.docs) {
      print.info(`  ${colors.cyan}📚 Docs: ${def.docs}${colors.reset}`);
    }

    // Show setup URL
    if (def.setupUrl) {
      print.info(`  ${colors.cyan}🔧 Setup: ${def.setupUrl}${colors.reset}`);
    }

    // Show setup steps
    if (def.setupSteps) {
      print.info(`  ${colors.yellow}Setup steps:${colors.reset}`);
      def.setupSteps.forEach(step => {
        print.info(`    ${colors.dim}${step}${colors.reset}`);
      });
    }

    // Show pricing if available
    if (def.pricing) {
      print.info(`  ${colors.dim}💰 Pricing: ${def.pricing}${colors.reset}`);
    }

    // Show options if available
    if (def.options) {
      print.info(`  ${colors.dim}Options: ${def.options.join(', ')}${colors.reset}`);
    }

    // Show current value if exists
    let currentValue = this.currentEnv[key];
    let backupValue = this.backupEnv[key];
    
    if (currentValue) {
      const displayValue = this.maskSensitiveValue(key, currentValue);
      print.info(`  ${colors.green}Current: ${displayValue}${colors.reset}`);
    }
    
    if (backupValue && backupValue !== currentValue) {
      const displayValue = this.maskSensitiveValue(key, backupValue);
      print.info(`  ${colors.yellow}Backup: ${displayValue}${colors.reset}`);
    }

    // Show recommended value
    if (def.recommended && !currentValue) {
      print.info(`  ${colors.magenta}Recommended: ${def.recommended}${colors.reset}`);
    }

    // Determine default value
    let defaultValue = currentValue || backupValue || def.recommended || def.default || '';
    
    // Special handling for some variables
    if (key === 'NEXTAUTH_SECRET' && !defaultValue) {
      defaultValue = this.generateSecret();
      print.info(`  ${colors.cyan}Generated: ${defaultValue}${colors.reset}`);
    }

    // Ask for value
    const prompt = def.required 
      ? `  Enter value (required): `
      : `  Enter value (optional, press Enter to skip): `;
    
    let value = await this.askQuestion(prompt, defaultValue);

    // Validate if provided
    if (value && def.validate) {
      const isValid = this.validateValue(key, value, def);
      if (!isValid) {
        print.error(`  Invalid value. ${def.errorHelp || 'Please check the format.'}`);
        return this.setupVariable(key, def); // Retry
      }
    }

    // Store value
    if (value) {
      this.newEnv[key] = value;
      print.success('  ✅ Configured');
    } else if (def.required) {
      print.error('  ❌ Required variable skipped - this may cause issues');
    } else {
      print.info(`  ${colors.dim}⏭️  Skipped${colors.reset}`);
    }
  }

  maskSensitiveValue(key, value) {
    const sensitivePatterns = ['SECRET', 'KEY', 'PASSWORD', 'TOKEN', 'DSN'];
    const isSensitive = sensitivePatterns.some(pattern => key.includes(pattern));
    
    if (isSensitive && value.length > 10) {
      return value.substring(0, 6) + '...' + value.substring(value.length - 4);
    }
    return value;
  }

  validateValue(key, value, def) {
    // Basic validation based on key patterns
    if (key.includes('URL') || key.includes('ENDPOINT')) {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
    
    if (key.includes('PORT')) {
      const port = parseInt(value);
      return !isNaN(port) && port > 0 && port < 65536;
    }
    
    if (key.includes('EMAIL')) {
      return value.includes('@');
    }
    
    if (def.validate) {
      return def.validate(value);
    }
    
    return true;
  }

  generateSecret() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  async testConfiguration() {
    print.section('🧪 Testing Configuration...');
    
    const tests = [
      {
        name: 'Database Connection',
        test: () => this.newEnv.DATABASE_URL && this.newEnv.DATABASE_URL_PRISMA
      },
      {
        name: 'Authentication',
        test: () => this.newEnv.NEXTAUTH_URL && this.newEnv.NEXTAUTH_SECRET
      },
      {
        name: 'Supabase',
        test: () => this.newEnv.NEXT_PUBLIC_SUPABASE_URL && this.newEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    ];

    let passed = 0;
    for (const test of tests) {
      if (test.test()) {
        print.success(`${test.name} configured`);
        passed++;
      } else {
        print.warning(`${test.name} not configured`);
      }
    }

    if (passed < tests.length) {
      print.warning('\nSome core features are not configured. The application may not work properly.');
    }
  }

  async saveConfiguration() {
    print.section('💾 Saving Configuration...');
    
    // Backup current .env.local
    const currentPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(currentPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const backupPath = path.join(process.cwd(), `.env.local.backup-${timestamp}`);
      fs.copyFileSync(currentPath, backupPath);
      print.success(`Backed up to ${path.basename(backupPath)}`);
    }

    // Generate new .env.local
    let content = `# Revolutionary UI Environment Configuration
# Generated on ${new Date().toISOString()}
# Run 'node scripts/setup-all-env.js' to reconfigure

`;

    // Group variables by category
    for (const [categoryKey, category] of Object.entries(ENV_COMPLETE_DEFINITIONS)) {
      const categoryVars = Object.keys(category.vars).filter(key => this.newEnv[key]);
      
      if (categoryVars.length > 0) {
        content += `\n# ${'='.repeat(60)}\n`;
        content += `# ${category.title}\n`;
        content += `# ${'='.repeat(60)}\n\n`;
        
        for (const key of categoryVars) {
          content += `${key}=${this.newEnv[key]}\n`;
        }
      }
    }

    // Write new .env.local
    fs.writeFileSync(currentPath, content);
    print.success('Saved new configuration to .env.local');
  }

  async showSummary() {
    print.title('📊 Configuration Summary');
    
    const totalPossible = Object.values(ENV_COMPLETE_DEFINITIONS)
      .reduce((sum, cat) => sum + Object.keys(cat.vars).length, 0);
    const totalConfigured = Object.keys(this.newEnv).length;
    const newlyConfigured = Object.keys(this.newEnv).filter(key => !this.currentEnv[key]).length;
    
    console.log(`\nTotal variables configured: ${colors.green}${totalConfigured}/${totalPossible}${colors.reset}`);
    console.log(`Newly configured: ${colors.cyan}${newlyConfigured}${colors.reset}`);
    
    // Show what's enabled
    print.section('✨ Enabled Features');
    
    const features = {
      'AI Generation': this.newEnv.ENABLE_AI_GENERATION === 'true' && this.countAIProviders() > 0,
      'Marketplace': this.newEnv.ENABLE_MARKETPLACE === 'true',
      'Teams': this.newEnv.ENABLE_TEAM_FEATURES === 'true',
      'Payments': !!(this.newEnv.STRIPE_SECRET_KEY),
      'Email': !!(this.newEnv.SMTP_HOST || this.newEnv.RESEND_API_KEY),
      'Analytics': !!(this.newEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID || this.newEnv.SENTRY_DSN),
      'Search': !!(this.newEnv.ALGOLIA_APP_ID || this.newEnv.MEILISEARCH_HOST),
      'Storage': !!(this.newEnv.S3_BUCKET_NAME || this.newEnv.CLOUDINARY_CLOUD_NAME)
    };

    for (const [feature, enabled] of Object.entries(features)) {
      if (enabled) {
        print.success(feature);
      }
    }

    // Show next steps
    print.section('🎯 Next Steps');
    console.log('\n1. Test your configuration:');
    console.log('   node scripts/test-all-env.js\n');
    console.log('2. View available features:');
    console.log('   node scripts/show-available-features.js\n');
    console.log('3. Start the development server:');
    console.log('   cd marketplace-nextjs && npm run dev\n');
  }

  countAIProviders() {
    const aiKeys = [
      'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY',
      'GROQ_API_KEY', 'MISTRAL_API_KEY', 'DEEPSEEK_API_KEY',
      'TOGETHER_API_KEY', 'REPLICATE_API_TOKEN', 'COHERE_API_KEY'
    ];
    return aiKeys.filter(key => this.newEnv[key]).length;
  }

  askQuestion(prompt, defaultValue = '') {
    return new Promise((resolve) => {
      const displayPrompt = defaultValue 
        ? `${prompt}[${this.maskSensitiveValue('', defaultValue)}] `
        : prompt;
      
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

// Main execution
async function main() {
  const setup = new CompleteEnvironmentSetup();
  await setup.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CompleteEnvironmentSetup };