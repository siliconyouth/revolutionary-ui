import { BaseCommand, type CLIContext, input, password, withSpinner, createLogger } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';

export class LoginCommand extends BaseCommand {
  name = 'login';
  description = 'Login to your Revolutionary UI account';
  
  async action(options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n🔐 Login to Revolutionary UI\n'));
    
    // Check if already logged in
    const currentUser = await this.getCurrentUser(context);
    if (currentUser) {
      logger.info(`You are already logged in as ${chalk.cyan(currentUser.email)}`);
      logger.info('Use "rui auth logout" to switch accounts.');
      return;
    }
    
    // Get credentials
    const email = await input('Email:', '', (value) => {
      if (!value || !value.includes('@')) {
        return 'Please enter a valid email address';
      }
      return true;
    });
    
    const pass = await password('Password:');
    
    // Authenticate
    try {
      const user = await withSpinner('Authenticating...', async () => {
        // In production, this would call the Revolutionary UI API
        return this.authenticate(email, pass);
      });
      
      // Save auth token
      await this.saveAuthToken(user.token, context);
      
      logger.success(`\n✨ Welcome back, ${chalk.cyan(user.name)}!`);
      logger.info('\nYou now have access to:');
      logger.info('  • Component marketplace');
      logger.info('  • Cloud sync');
      logger.info('  • Team collaboration');
      logger.info('  • AI-powered generation');
      
    } catch (error: any) {
      logger.error('\nAuthentication failed:', error.message);
      logger.info('\nForgot your password? Visit: https://revolutionary-ui.com/forgot-password');
    }
  }
  
  private async getCurrentUser(context: CLIContext): Promise<any> {
    const { readJson, fileExists } = await import('@revolutionary-ui/cli-core');
    const configPath = this.getAuthConfigPath();
    
    if (await fileExists(configPath)) {
      const config = await readJson(configPath);
      if (config.token && config.user) {
        // Validate token is still valid
        // In production, would check with API
        return config.user;
      }
    }
    
    return null;
  }
  
  private async authenticate(email: string, password: string): Promise<any> {
    // Mock authentication
    // In production, this would call the Revolutionary UI API
    if (email && password) {
      return {
        token: 'mock-jwt-token',
        user: {
          id: '123',
          name: 'Test User',
          email: email,
        },
      };
    }
    
    const { errors } = await import('@revolutionary-ui/cli-core');
    throw errors.auth.invalidCredentials();
  }
  
  private async saveAuthToken(token: string, context: CLIContext): Promise<void> {
    const { writeJson, ensureDir } = await import('@revolutionary-ui/cli-core');
    const configPath = this.getAuthConfigPath();
    const configDir = require('path').dirname(configPath);
    
    await ensureDir(configDir);
    await writeJson(configPath, {
      token,
      user: {
        email: 'user@example.com',
        name: 'Test User',
      },
      lastLogin: new Date().toISOString(),
    });
  }
  
  private getAuthConfigPath(): string {
    const os = require('os');
    const path = require('path');
    return path.join(os.homedir(), '.revolutionary-ui', 'auth.json');
  }
}