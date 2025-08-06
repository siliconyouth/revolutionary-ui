#!/usr/bin/env node

/**
 * Revolutionary UI Terminal CLI
 * A clean, Terminal UI-first implementation with AI at its core
 */

import { Command } from 'commander';
import { createTerminalApp } from './terminal-app';
import { version } from '../../package.json';

// Set up environment for Terminal UI
process.env.TERM = process.env.TERM || 'xterm';
process.env.NCURSES_NO_UTF8_ACS = '1';

const program = new Command();

program
  .name('rui')
  .description('Revolutionary UI - AI-Powered Component Generation')
  .version(version)
  .action(async () => {
    // Default action launches Terminal UI
    await launchTerminalUI();
  });

// Single command that launches Terminal UI
program
  .command('ui', { isDefault: true })
  .description('Launch Terminal UI (default)')
  .action(async () => {
    await launchTerminalUI();
  });

// Help command
program
  .command('help')
  .description('Show help')
  .action(() => {
    program.outputHelp();
  });

async function launchTerminalUI() {
  try {
    console.clear();
    const app = await createTerminalApp();
    
    // Keep the process alive
    process.stdin.resume();
    
    // The app handles its own lifecycle
  } catch (error) {
    console.error('Failed to launch Terminal UI:', error);
    process.exit(1);
  }
}

// Parse arguments
program.parse(process.argv);

// Show Terminal UI by default if no command
if (!process.argv.slice(2).length) {
  launchTerminalUI();
}