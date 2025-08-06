import { BaseCommand, type CLIContext, confirm, createLogger } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import { unlinkSync } from 'fs';

export class LogoutCommand extends BaseCommand {
  name = 'logout';
  description = 'Logout from your Revolutionary UI account';
  
  async action(options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    const { readJson, fileExists } = await import('@revolutionary-ui/cli-core');
    const configPath = this.getAuthConfigPath();
    
    if (!await fileExists(configPath)) {
      logger.info('You are not logged in.');
      return;
    }
    
    const config = await readJson(configPath);
    const user = config.user;
    
    const confirmed = await confirm(
      `Are you sure you want to logout from ${chalk.cyan(user.email)}?`,
      false
    );
    
    if (confirmed) {
      try {
        unlinkSync(configPath);
        logger.success('\n✨ Successfully logged out!');
      } catch (error) {
        logger.error('Failed to logout:', error);
      }
    } else {
      logger.info('Logout cancelled.');
    }
  }
  
  private getAuthConfigPath(): string {
    const os = require('os');
    const path = require('path');
    return path.join(os.homedir(), '.revolutionary-ui', 'auth.json');
  }
}