import { BaseCommand, type CLIContext, createLogger } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';

export class StatusCommand extends BaseCommand {
  name = 'status';
  description = 'Check authentication status';
  
  async action(options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    const { readJson, fileExists } = await import('@revolutionary-ui/cli-core');
    const configPath = this.getAuthConfigPath();
    
    if (!await fileExists(configPath)) {
      logger.info('\n🔴 Not logged in');
      logger.info('\nUse "rui auth login" to authenticate.');
      return;
    }
    
    try {
      const config = await readJson(configPath);
      const user = config.user;
      
      logger.info(chalk.bold('\n🔐 Authentication Status\n'));
      logger.info(`  ${chalk.gray('Status:')}     ${chalk.green('• Logged in')}`);
      logger.info(`  ${chalk.gray('User:')}       ${user.name}`);
      logger.info(`  ${chalk.gray('Email:')}      ${user.email}`);
      logger.info(`  ${chalk.gray('Last login:')} ${new Date(config.lastLogin).toLocaleString()}`);
      
      // In production, would check subscription status
      logger.info(`\n  ${chalk.gray('Plan:')}       ${chalk.cyan('Pro')}`);
      logger.info(`  ${chalk.gray('Components:')} Unlimited`);
      logger.info(`  ${chalk.gray('Cloud sync:')} Enabled`);
      logger.info(`  ${chalk.gray('AI credits:')} 1,000 / month`);
      
    } catch (error) {
      logger.error('Failed to read auth status:', error);
    }
  }
  
  private getAuthConfigPath(): string {
    const os = require('os');
    const path = require('path');
    return path.join(os.homedir(), '.revolutionary-ui', 'auth.json');
  }
}