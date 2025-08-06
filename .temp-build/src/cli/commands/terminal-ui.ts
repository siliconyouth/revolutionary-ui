/**
 * Terminal UI Command
 * Launches the react-blessed Terminal UI
 */

import chalk from 'chalk';
import { spawn } from 'child_process';
import path from 'path';

export class TerminalUICommand {
  async execute(): Promise<void> {
    console.clear();
    
    // Path to the terminal UI app
    const terminalUIPath = path.join(__dirname, '../../../terminal-ui-app.js');
    
    // Spawn the terminal UI as a child process
    const child = spawn('node', [terminalUIPath], {
      stdio: 'inherit',
      env: {
        ...process.env,
        TERM: 'xterm',
        NCURSES_NO_UTF8_ACS: '1'
      }
    });

    // Handle exit
    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(chalk.red('\nTerminal UI exited with error'));
      }
      process.exit(code || 0);
    });

    // Handle errors
    child.on('error', (err) => {
      console.error(chalk.red('Failed to launch Terminal UI:'), err.message);
      console.log(chalk.yellow('\nTip: Make sure terminal-ui-app.js exists in the project root'));
      process.exit(1);
    });
  }
}