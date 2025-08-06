/**
 * Simplified AI Authentication Command
 * Guides users to use Claude Code's built-in authentication
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '../utils/config-manager';
import { ClaudeSessionAuth } from '../utils/claude-session-auth';

export class AIAuthCommand {
  private configManager: ConfigManager;
  private sessionAuth: ClaudeSessionAuth;

  constructor() {
    this.configManager = new ConfigManager();
    this.sessionAuth = new ClaudeSessionAuth();
  }

  async execute(options: { logout?: boolean; status?: boolean }) {
    if (options.logout) {
      await this.logout();
    } else if (options.status) {
      await this.status();
    } else {
      await this.authenticate();
    }
  }

  private async authenticate() {
    console.log(chalk.cyan('\n🔐 Revolutionary UI - AI Authentication\n'));
    
    console.log(chalk.yellow('ℹ️  Revolutionary UI uses Claude AI for intelligent features.\n'));
    
    console.log(chalk.bold('You have three options:\n'));
    
    console.log(chalk.green('Option 1: Browser Session (Recommended)'));
    console.log(chalk.gray('  • No API rate limits - uses your Claude.ai subscription'));
    console.log(chalk.gray('  • Direct authentication through your browser'));
    console.log(chalk.gray('  • Best for unlimited usage\n'));
    
    console.log(chalk.blue('Option 2: Claude Code'));
    console.log(chalk.gray('  • Official CLI integration'));
    console.log(chalk.gray('  • Automatic session management'));
    console.log(chalk.gray('  • Requires Claude Code installation\n'));
    
    console.log(chalk.yellow('Option 3: API Key'));
    console.log(chalk.gray('  • Traditional method'));
    console.log(chalk.gray('  • Subject to rate limits'));
    console.log(chalk.gray('  • Get key from: https://console.anthropic.com/settings/keys\n'));

    const { choice } = await inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'How would you like to proceed?',
      choices: [
        {
          name: '🌐 Browser Session (No API limits)',
          value: 'session'
        },
        {
          name: '📦 Set up Claude Code',
          value: 'claudecode'
        },
        {
          name: '🔑 Use API Key',
          value: 'apikey'
        },
        {
          name: '❌ Skip for now',
          value: 'skip'
        }
      ]
    }]);

    if (choice === 'session') {
      await this.setupBrowserSession();
    } else if (choice === 'claudecode') {
      await this.setupClaudeCode();
    } else if (choice === 'apikey') {
      await this.setupAPIKey();
    }
  }

  private async setupBrowserSession() {
    console.log(chalk.cyan('\n🌐 Browser Session Authentication\n'));
    console.log(chalk.gray('This will guide you through authenticating with your Claude.ai account.\n'));
    
    const success = await this.sessionAuth.authenticate();
    
    if (success) {
      // Save auth method preference
      await this.configManager.set('ai.authMethod', 'session');
      
      console.log(chalk.green('\n✅ Successfully authenticated with Claude AI!'));
      console.log(chalk.gray('You now have unlimited AI usage through your Claude.ai subscription.'));
      console.log(chalk.gray('\nYou can now use all AI-powered features of Revolutionary UI.'));
    } else {
      console.log(chalk.red('\n❌ Authentication failed or was cancelled.'));
      console.log(chalk.gray('You can try again or choose a different authentication method.'));
    }
  }

  private async setupClaudeCode() {
    console.log(chalk.cyan('\n📚 Claude Code Setup Instructions\n'));
    
    console.log(chalk.bold('Step 1: Install Claude Code'));
    console.log(chalk.gray('Run this command in your terminal:\n'));
    console.log(chalk.green('  npm install -g claude\n'));
    
    console.log(chalk.bold('Step 2: Login to Claude'));
    console.log(chalk.gray('After installation, run:\n'));
    console.log(chalk.green('  claude login\n'));
    console.log(chalk.gray('This will open your browser to authenticate with Claude.ai\n'));
    
    console.log(chalk.bold('Step 3: Use Revolutionary UI'));
    console.log(chalk.gray('Once authenticated, Revolutionary UI will automatically use Claude Code\n'));
    
    console.log(chalk.yellow('📝 Note: Claude Code provides unlimited AI usage through your Claude.ai subscription\n'));
    
    const { understood } = await inquirer.prompt([{
      type: 'confirm',
      name: 'understood',
      message: 'Ready to proceed with these steps?',
      default: true
    }]);

    if (understood) {
      // Save preference
      await this.configManager.set('ai.preferClaudeCode', true);
      console.log(chalk.gray('\nGreat! Follow the steps above and then run your Revolutionary UI commands.'));
    }
  }

  private async setupAPIKey() {
    console.log(chalk.cyan('\n🔑 API Key Setup\n'));
    
    const { apiKey } = await inquirer.prompt([{
      type: 'password',
      name: 'apiKey',
      message: 'Enter your Anthropic API key:',
      validate: (value: string) => {
        if (!value || value.length < 20) {
          return 'Please enter a valid API key';
        }
        return true;
      }
    }]);

    // Save API key
    process.env.ANTHROPIC_API_KEY = apiKey;
    await this.configManager.set('ai.apiKey', apiKey);
    await this.configManager.set('ai.authMethod', 'apikey');
    
    console.log(chalk.green('\n✅ API key saved successfully!'));
    console.log(chalk.gray('Note: API usage is subject to rate limits.'));
    console.log(chalk.gray('Consider using Claude Code for unlimited access.'));
  }

  private async logout() {
    const authMethod = await this.configManager.get('ai.authMethod');
    
    if (authMethod === 'session') {
      await this.sessionAuth.logout();
    }
    
    await this.configManager.delete('ai.apiKey');
    await this.configManager.delete('ai.authMethod');
    delete process.env.ANTHROPIC_API_KEY;
    
    console.log(chalk.green('✅ Logged out from Revolutionary UI'));
    
    if (authMethod === 'session') {
      console.log(chalk.gray('\nSession authentication cleared.'));
    } else {
      console.log(chalk.gray('\nNote: If using Claude Code, run "claude logout" to fully logout'));
    }
  }

  private async status() {
    console.log(chalk.cyan('\n🔐 AI Authentication Status\n'));

    const authMethod = await this.configManager.get('ai.authMethod');
    const apiKey = process.env.ANTHROPIC_API_KEY || await this.configManager.get('ai.apiKey');
    const isSessionAuth = await this.sessionAuth.isAuthenticated();
    
    if (authMethod === 'session' && isSessionAuth) {
      console.log(chalk.green('✅ Authenticated with Browser Session'));
      console.log(chalk.gray('   • No API rate limits'));
      console.log(chalk.gray('   • Using your Claude.ai subscription'));
      console.log(chalk.gray('   • Session active\n'));
    } else if (apiKey) {
      console.log(chalk.green('✅ Authenticated with API Key'));
      console.log(chalk.gray(`   Key: ${'*'.repeat(apiKey.length - 4)}${apiKey.slice(-4)}`));
      console.log(chalk.gray('   Note: Subject to rate limits\n'));
    } else {
      console.log(chalk.yellow('❌ Not authenticated\n'));
    }
    
    console.log(chalk.bold('💡 Available authentication methods:'));
    console.log(chalk.gray('1. Browser Session: revolutionary-ui ai-auth (choose Browser Session)'));
    console.log(chalk.gray('2. Claude Code: npm install -g claude && claude login'));
    console.log(chalk.gray('3. API Key: revolutionary-ui ai-auth (choose API Key)'));
  }
}