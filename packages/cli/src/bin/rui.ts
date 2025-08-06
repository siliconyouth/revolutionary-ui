#!/usr/bin/env node
import { CLI } from '@revolutionary-ui/cli-core';
import { registerCommands } from '../commands/index.js';
import chalk from 'chalk';

async function main() {
  // Only show banner for interactive mode or help
  const args = process.argv.slice(2);
  const showBanner = args.length === 0 || 
                     args.includes('--help') || 
                     args.includes('-h') ||
                     (args[0] && !args[0].startsWith('-'));
  
  if (showBanner) {
    console.log(chalk.cyan(`
╦═╗┌─┐┬  ┬┌─┐┬  ┬ ┬┌┬┐┬┌─┐┌┐┌┌─┐┬─┐┬ ┬  ╦ ╦╦
╠╦╝├┤ └┐┌┘│ ││  │ │ │ ││ ││││├─┤├┬┘└┬┘  ║ ║║
╩╚═└─┘ └┘ └─┘┴─┘└─┘ ┴ ┴└─┘┘└┘┴ ┴┴└─ ┴   ╚═╝╩
  `));
  }

  const cli = new CLI();
  
  // Register all commands
  await registerCommands(cli);
  
  // Run the CLI
  await cli.run();
}

main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});