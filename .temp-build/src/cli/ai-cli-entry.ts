#!/usr/bin/env node

/**
 * AI CLI Entry Point
 * Handles AI-specific commands for Revolutionary UI
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { AIAuthCommand } from './commands/ai-auth';
import { AIInteractiveCommand } from './commands/ai-interactive';
import { AIGenerateCommand } from './commands/ai-generate';

const program = new Command();

program
  .name('revolutionary-ui')
  .description('Revolutionary UI - AI-Powered Component Generation')
  .version('3.4.0');

// AI Authentication command
program
  .command('ai-auth')
  .description('Authenticate with Claude AI for unlimited usage')
  .option('--status', 'Check authentication status')
  .option('--logout', 'Logout from AI services')
  .action(async (options) => {
    const authCommand = new AIAuthCommand();
    await authCommand.execute(options);
  });

// AI Interactive command
program
  .command('ai-interactive')
  .description('Start AI-powered interactive wizard')
  .action(async () => {
    const interactiveCommand = new AIInteractiveCommand();
    await interactiveCommand.execute();
  });

// AI Generate command
program
  .command('ai-generate [prompt]')
  .description('Generate components using AI')
  .option('-f, --framework <framework>', 'Target framework')
  .option('-o, --output <path>', 'Output directory')
  .option('--no-preview', 'Skip preview')
  .action(async (prompt, options) => {
    const generateCommand = new AIGenerateCommand();
    await generateCommand.execute({ prompt, ...options });
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}