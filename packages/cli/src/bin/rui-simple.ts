#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { interactiveMode } from '../lib/interactive-mode.js';
import packageJson from '../../../../package.json' assert { type: 'json' };

const program = new Command();

// ASCII banner
const showBanner = () => {
  console.log(chalk.cyan(`
╦═╗┌─┐┬  ┬┌─┐┬  ┬ ┬┌┬┐┬┌─┐┌┐┌┌─┐┬─┐┬ ┬  ╦ ╦╦
╠╦╝├┤ └┐┌┘│ ││  │ │ │ ││ ││││├─┤├┬┘└┬┘  ║ ║║
╩╚═└─┘ └┘ └─┘┴─┘└─┘ ┴ ┴└─┘┘└┘┴ ┴┴└─ ┴   ╚═╝╩
  `));
  console.log(chalk.gray(`  v${packageJson.version} - AI-Powered UI Component Factory\n`));
};

program
  .name('rui')
  .description('Revolutionary UI CLI - Generate UI components with 60-95% less code')
  .version(packageJson.version)
  .option('-i, --interactive', 'Run in interactive mode (default)', true)
  .option('-d, --debug', 'Enable debug output')
  .action(async (options) => {
    // If no command was provided, show banner and launch interactive mode
    showBanner();
    console.log(chalk.yellow('Starting interactive mode...\n'));
    
    // Mock context for now
    const context = {
      config: {},
      flags: options,
      paths: {
        cwd: process.cwd(),
      },
    };
    
    await interactiveMode(context as any);
  });

// Add subcommands
program
  .command('new <name>')
  .description('Create a new Revolutionary UI project')
  .option('-t, --template <template>', 'Use a specific template')
  .action((name, options) => {
    showBanner();
    console.log(chalk.green(`Creating new project: ${name}`));
    if (options.template) {
      console.log(chalk.gray(`Using template: ${options.template}`));
    }
    console.log(chalk.yellow('\n[This command is not yet implemented]'));
  });

program
  .command('generate [type]')
  .alias('g')
  .description('Generate a UI component')
  .option('-n, --name <name>', 'Component name')
  .option('-f, --framework <framework>', 'Target framework (react, vue, angular)')
  .action((type, options) => {
    showBanner();
    console.log(chalk.green('Generating component...'));
    console.log(chalk.gray(`Type: ${type || 'interactive'}`));
    if (options.name) console.log(chalk.gray(`Name: ${options.name}`));
    if (options.framework) console.log(chalk.gray(`Framework: ${options.framework}`));
    console.log(chalk.yellow('\n[This would launch the generation workflow]'));
  });

program
  .command('add <components...>')
  .description('Add components from the marketplace')
  .option('-y, --yes', 'Skip confirmation')
  .option('-p, --path <path>', 'Installation path')
  .action((components, options) => {
    showBanner();
    console.log(chalk.green(`Adding components: ${components.join(', ')}`));
    if (options.path) console.log(chalk.gray(`Path: ${options.path}`));
    console.log(chalk.yellow('\n[This would install components from the registry]'));
  });

// Parse arguments
program.parse(process.argv);

// If no arguments provided, show help
if (process.argv.length === 2) {
  showBanner();
  console.log(chalk.yellow('No command specified. Launching interactive mode...\n'));
  
  const context = {
    config: {},
    flags: {},
    paths: {
      cwd: process.cwd(),
    },
  };
  
  // Launch interactive mode
  interactiveMode(context as any).catch(console.error);
}