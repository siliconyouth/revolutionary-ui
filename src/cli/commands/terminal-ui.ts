/**
 * Terminal UI Command
 * Launches the react-blessed Terminal UI with enhanced features
 */

import chalk from 'chalk';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import ora from 'ora';

export interface TerminalUIOptions {
  theme?: 'cyan' | 'green' | 'blue' | 'magenta' | 'yellow';
  framework?: string;
  animations?: boolean;
  debug?: boolean;
  ui?: 'default' | 'rich' | 'dashboard' | 'ink' | 'full';
  emoji?: boolean;
}

export class TerminalUICommand {
  async execute(options: TerminalUIOptions = {}): Promise<void> {
    await this.launch(options);
  }

  private async launch(options: TerminalUIOptions = {}) {
    const spinner = ora('Starting Revolutionary UI Terminal...').start();
    
    try {
      // Check if terminal supports colors
      if (!process.stdout.isTTY) {
        spinner.fail('This command requires an interactive terminal');
        console.error(chalk.red('Please run this command in a terminal that supports TTY'));
        process.exit(1);
      }

      // Select UI based on option
      let uiPaths: string[] = [];
      
      switch (options.ui) {
        case 'rich':
          uiPaths = [path.join(__dirname, '..', 'ui', 'rich-terminal-ui.js')];
          break;
        case 'dashboard':
          uiPaths = [path.join(__dirname, '..', 'ui', 'advanced-dashboard-ui.js')];
          break;
        case 'ink':
          uiPaths = [path.join(__dirname, '..', 'ui', 'ink-modern-ui.jsx')];
          break;
        case 'full':
          uiPaths = [path.join(__dirname, '..', 'ui', 'full-terminal-ui.js')];
          break;
        default:
          // Try all UIs in order of preference
          uiPaths = [
            path.join(__dirname, '..', 'ui', 'rich-terminal-ui.js'),
            path.join(__dirname, '..', 'ui', 'full-terminal-ui.js'),
            path.join(__dirname, '..', 'ui', 'advanced-dashboard-ui.js'),
            path.join(__dirname, '..', 'ui', 'basic-terminal-ui.js'),
            path.join(__dirname, '..', 'ui', 'simple-terminal-ui.js'),
            path.join(__dirname, '..', 'ui', 'enhanced-terminal-ui.tsx'),
            path.join(__dirname, '..', 'ui', 'revolutionary-terminal-ui.tsx'),
            path.join(__dirname, '..', '..', '..', 'revolutionary-ui-terminal'),
            path.join(__dirname, '..', '..', '..', 'terminal-ui-app.js')
          ];
      }
      
      const possiblePaths = uiPaths;

      let terminalUIPath: string | null = null;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          terminalUIPath = testPath;
          break;
        }
      }

      if (!terminalUIPath) {
        spinner.fail('Terminal UI not found');
        console.error(chalk.red('Could not find terminal UI application'));
        console.error(chalk.yellow('Searched in:'));
        possiblePaths.forEach(p => console.error(chalk.gray(`  - ${p}`)));
        process.exit(1);
      }

      spinner.succeed('Terminal UI ready');
      
      // Clear the screen
      console.clear();

      // Determine how to run the file
      const isTypeScript = terminalUIPath.endsWith('.ts') || terminalUIPath.endsWith('.tsx');
      const command = isTypeScript ? 'tsx' : 'node';
      
      // Launch the terminal UI
      const child = spawn(command, [terminalUIPath], {
        stdio: 'inherit',
        env: {
          ...process.env,
          TERM: process.env.TERM || 'xterm-256color',
          TERMINAL_EMOJIS: options.emoji === true ? 'true' : 'false',
          FORCE_EMOJI: options.emoji === true ? 'true' : 'false',
          REVOLUTIONARY_UI_THEME: options.theme || 'cyan',
          REVOLUTIONARY_UI_FRAMEWORK: options.framework || 'react',
          REVOLUTIONARY_UI_ANIMATIONS: options.animations === false ? 'false' : 'true',
          REVOLUTIONARY_UI_DEBUG: options.debug ? 'true' : 'false',
          NODE_ENV: process.env.NODE_ENV || 'production'
        }
      });

      // Handle child process events
      child.on('error', (error) => {
        console.error(chalk.red('Failed to start Terminal UI:'), error.message);
        if (isTypeScript) {
          console.log(chalk.yellow('\nTip: Make sure tsx is installed globally:'));
          console.log(chalk.gray('  npm install -g tsx'));
        }
        process.exit(1);
      });

      child.on('exit', (code) => {
        if (code !== 0 && code !== null) {
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

    } catch (error: any) {
      spinner.fail('Failed to launch Terminal UI');
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  }
}