/**
 * AI Authentication Command - Authenticate with Claude AI using browser session
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { ClaudeAuthManager } from '../utils/claude-auth-manager';
import { ConfigManager } from '../utils/config-manager';

export class AIAuthCommand {
  private authManager: ClaudeAuthManager;
  private configManager: ConfigManager;

  constructor() {
    this.authManager = new ClaudeAuthManager();
    this.configManager = new ConfigManager();
  }

  async execute(options: { logout?: boolean; status?: boolean }) {
    try {
      if (options.logout) {
        await this.logout();
      } else if (options.status) {
        await this.status();
      } else {
        await this.authenticate();
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Authentication failed: ${error.message}`));
      process.exit(1);
    }
  }

  private async authenticate() {
    console.log(chalk.cyan('\n🔐 Claude AI Authentication\n'));
    
    // Check if already authenticated
    const isAuth = await this.authManager.isAuthenticated();
    if (isAuth) {
      console.log(chalk.yellow('⚠️  You are already authenticated with Claude AI'));
      
      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to re-authenticate?',
        default: false,
      }]);
      
      if (!proceed) {
        return;
      }
    }

    console.log(chalk.gray('This authentication method allows you to use your Claude AI subscription'));
    console.log(chalk.gray('without API rate limits by using your browser session.\n'));

    const { authMethod } = await inquirer.prompt([{
      type: 'list',
      name: 'authMethod',
      message: 'How would you like to authenticate?',
      choices: [
        {
          name: '🌐 Browser Authentication (Recommended)',
          value: 'browser',
        },
        {
          name: '🔑 Use API Key (Traditional)',
          value: 'apikey',
        },
      ],
    }]);

    if (authMethod === 'browser') {
      // Browser-based authentication
      const success = await this.authManager.authenticate();
      
      if (success) {
        // Update config to use session auth
        await this.configManager.set('ai.useSessionAuth', true);
        console.log(chalk.green('\n✅ Successfully authenticated with Claude AI!'));
        console.log(chalk.gray('You can now use AI generation without API rate limits.'));
      } else {
        console.error(chalk.red('\n❌ Authentication failed'));
      }
    } else {
      // API key authentication
      await this.setupAPIKey();
    }
  }

  private async setupAPIKey() {
    console.log(chalk.cyan('\n🔑 API Key Setup\n'));
    console.log(chalk.gray('Get your API key from: https://console.anthropic.com/settings/keys\n'));

    const { apiKey } = await inquirer.prompt([{
      type: 'password',
      name: 'apiKey',
      message: 'Enter your Anthropic API key:',
      validate: (value: string) => value.length > 0 || 'API key is required',
    }]);

    // Save API key to environment or config
    await this.configManager.set('ai.apiKey', apiKey);
    await this.configManager.set('ai.useSessionAuth', false);
    
    console.log(chalk.green('\n✅ API key saved successfully!'));
    console.log(chalk.gray('Note: API keys have rate limits. Consider using browser auth for unlimited usage.'));
  }

  private async logout() {
    const isAuth = await this.authManager.isAuthenticated();
    
    if (!isAuth) {
      console.log(chalk.yellow('⚠️  You are not authenticated with Claude AI'));
      return;
    }

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to logout from Claude AI?',
      default: false,
    }]);

    if (confirm) {
      await this.authManager.logout();
      await this.configManager.set('ai.useSessionAuth', false);
      console.log(chalk.green('✅ Successfully logged out from Claude AI'));
    }
  }

  private async status() {
    console.log(chalk.cyan('\n🔐 Claude AI Authentication Status\n'));

    const isAuth = await this.authManager.isAuthenticated();
    const useSessionAuth = await this.configManager.get('ai.useSessionAuth');
    const hasAPIKey = await this.configManager.get('ai.apiKey') || process.env.ANTHROPIC_API_KEY;

    if (isAuth && useSessionAuth) {
      console.log(chalk.green('✅ Authenticated with Claude AI (Browser Session)'));
      const token = await this.authManager.getAuthToken();
      if (token) {
        console.log(chalk.gray(`   Created: ${new Date(token.createdAt).toLocaleString()}`));
        if (token.expiresAt) {
          console.log(chalk.gray(`   Expires: ${new Date(token.expiresAt).toLocaleString()}`));
        }
      }
    } else if (hasAPIKey && !useSessionAuth) {
      console.log(chalk.green('✅ Using API Key Authentication'));
      console.log(chalk.gray('   Note: Subject to API rate limits'));
    } else {
      console.log(chalk.red('❌ Not authenticated'));
      console.log(chalk.gray('\nRun "revolutionary-ui ai-auth" to authenticate'));
    }

    // Show current settings
    console.log(chalk.cyan('\n⚙️  Current Settings:'));
    console.log(chalk.gray(`   Use Session Auth: ${useSessionAuth ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`   Has API Key: ${hasAPIKey ? 'Yes' : 'No'}`));
  }
}