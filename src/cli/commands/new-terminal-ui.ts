import { Command } from 'commander';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';

export class NewTerminalUICommand {
  createCommand(): Command {
    return new Command('ui')
      .alias('terminal-ui')
      .alias('tui')
      .description('Launch the Revolutionary UI Terminal Interface')
      .option('-t, --theme <theme>', 'Set color theme (cyan, green, blue, magenta, yellow)', 'cyan')
      .option('-f, --framework <framework>', 'Set default framework', 'react')
      .option('--no-animations', 'Disable animations')
      .option('--debug', 'Enable debug mode')
      .action(async (options) => {
        await this.launch(options);
      });
  }

  private async launch(options: any) {
    const spinner = ora('Starting Revolutionary UI Terminal...').start();

    try {
      // Check if terminal supports colors
      if (!process.stdout.isTTY) {
        spinner.fail('This command requires an interactive terminal');
        console.error(chalk.red('Please run this command in a terminal that supports TTY'));
        process.exit(1);
      }

      // Find the terminal UI file
      const terminalUIPath = path.join(__dirname, '..', 'ui', 'enhanced-terminal-ui.tsx');
      
      // Check if file exists
      if (!fs.existsSync(terminalUIPath)) {
        spinner.fail('Terminal UI not found');
        console.error(chalk.red(`Could not find terminal UI at: ${terminalUIPath}`));
        process.exit(1);
      }

      spinner.succeed('Terminal UI ready');
      
      // Clear the screen
      console.clear();

      // Launch the terminal UI using tsx
      const child = spawn('tsx', [terminalUIPath], {
        stdio: 'inherit',
        env: {
          ...process.env,
          TERM: process.env.TERM || 'xterm-256color',
          REVOLUTIONARY_UI_THEME: options.theme,
          REVOLUTIONARY_UI_FRAMEWORK: options.framework,
          REVOLUTIONARY_UI_ANIMATIONS: options.animations ? 'true' : 'false',
          REVOLUTIONARY_UI_DEBUG: options.debug ? 'true' : 'false',
          NODE_ENV: process.env.NODE_ENV || 'production'
        }
      });

      // Handle child process events
      child.on('error', (error) => {
        console.error(chalk.red('Failed to start Terminal UI:'), error);
        process.exit(1);
      });

      child.on('exit', (code) => {
        if (code !== 0) {
          console.error(chalk.red(`Terminal UI exited with code ${code}`));
        }
        process.exit(code || 0);
      });

      // Handle process signals
      process.on('SIGINT', () => {
        child.kill('SIGINT');
      });

      process.on('SIGTERM', () => {
        child.kill('SIGTERM');
      });

    } catch (error) {
      spinner.fail('Failed to launch Terminal UI');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  }
}

// Export a singleton instance
export const newTerminalUICommand = new NewTerminalUICommand();