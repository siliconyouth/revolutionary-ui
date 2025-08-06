import { Command } from 'commander';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import type { CLIContext, CLICommand, CLIConfig } from './types/index.js';
import { createLogger } from './utils/logger.js';
import { handleError } from './errors/index.js';
import { configLoader } from './utils/config-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class CLI {
  private program: Command;
  private context: CLIContext;
  private commands: Map<string, CLICommand> = new Map();
  private logger = createLogger();

  constructor() {
    this.program = new Command();
    this.context = {
      version: '1.0.0', // Initialize with default
      cwd: process.cwd(),
      config: this.getDefaultConfig(),
      flags: {},
    };
    this.context.version = this.getVersion();
    this.initializeAsync();
  }
  
  private async initializeAsync(): Promise<void> {
    // Load hierarchical config
    const configHierarchy = await configLoader.loadHierarchy(this.context.cwd);
    this.context.config = configHierarchy.merged;
    
    // Store config hierarchy for debugging
    (this.context as any).configHierarchy = configHierarchy;
    
    this.setupProgram();
    this.checkForUpdates();
  }

  private getVersion(): string {
    // Hardcode version for now since package.json path resolution is complex
    // In production, this would be replaced during build
    return '3.3.0';
  }


  private getDefaultConfig(): CLIConfig {
    return {
      version: '1.0.0',
      features: {
        ai: true,
        marketplace: true,
        cloudSync: true,
        analytics: true,
      },
      preferences: {
        componentStyle: 'composition',
        fileNaming: 'kebab-case',
        interactive: true,
        telemetry: true,
      },
    };
  }

  private setupProgram(): void {
    this.program
      .name('rui')
      .description('Revolutionary UI CLI - Generate UI components with 60-95% less code')
      .version(this.context.version, '-v, --version', 'Display version number')
      .option('-d, --debug', 'Enable debug mode')
      .option('-s, --silent', 'Suppress all output')
      .option('-j, --json', 'Output in JSON format')
      .option('-f, --force', 'Force operation without confirmations')
      .option('--dry-run', 'Preview changes without applying them')
      .option('--no-color', 'Disable colored output')
      .allowUnknownOption(false)
      .hook('preAction', (thisCommand) => {
        const options = thisCommand.opts();
        this.context.flags = {
          debug: options.debug,
          silent: options.silent,
          json: options.json,
          force: options.force,
          dryRun: options.dryRun,
        };

        if (options.noColor) {
          chalk.level = 0;
        }

        if (options.debug) {
          this.logger.setLevel('debug');
        }

        if (options.silent) {
          this.logger.setLevel('error');
        }
      });

    // Add help command customization
    this.program.helpOption('-h, --help', 'Display help for command');
    this.program.addHelpCommand('help [command]', 'Display help for command');

    // Customize help display
    this.program.configureHelp({
      sortSubcommands: true,
      subcommandTerm: (cmd) => cmd.name() + (cmd.alias() ? `|${cmd.alias()}` : ''),
    });
  }

  private checkForUpdates(): void {
    const pkg = { name: '@revolutionary-ui/cli', version: this.context.version };
    const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 }); // Daily

    if (notifier.update) {
      const message = chalk.yellow(
        `\nUpdate available ${chalk.dim(notifier.update.current)} → ${chalk.green(
          notifier.update.latest
        )}\nRun ${chalk.cyan(`npm install -g ${pkg.name}`)} to update\n`
      );
      
      this.logger.info(message);
    }
  }

  public registerCommand(command: CLICommand): void {
    const cmd = this.program
      .command(command.name)
      .description(command.description);

    if (command.alias) {
      cmd.alias(command.alias.join(' '));
    }

    if (command.options) {
      command.options.forEach((option) => {
        if (option.required) {
          cmd.requiredOption(option.flags, option.description, option.defaultValue);
        } else {
          cmd.option(option.flags, option.description, option.defaultValue);
        }
      });
    }

    cmd.action(async (...args: any[]) => {
      try {
        // Pass all arguments to the command action
        // For commands with positional arguments, they come before options
        // Commander passes arguments in this order: [positionalArgs..., options, command]
        const commandArgs = args.slice(0, -1); // Remove the command object
        commandArgs.push(this.context); // Add context as last argument
        await command.action.apply(command, commandArgs);
      } catch (error) {
        handleError(error, this.context);
        process.exit(1);
      }
    });

    if (command.subcommands) {
      command.subcommands.forEach((subcommand) => {
        this.registerSubcommand(cmd, subcommand);
      });
    }

    this.commands.set(command.name, command);
  }

  private registerSubcommand(parent: Command, subcommand: CLICommand): void {
    const sub = parent
      .command(subcommand.name)
      .description(subcommand.description);

    if (subcommand.alias) {
      sub.alias(subcommand.alias.join(' '));
    }

    if (subcommand.options) {
      subcommand.options.forEach((option) => {
        if (option.required) {
          sub.requiredOption(option.flags, option.description, option.defaultValue);
        } else {
          sub.option(option.flags, option.description, option.defaultValue);
        }
      });
    }

    sub.action(async (...args) => {
      try {
        await subcommand.action(args[args.length - 2], this.context);
      } catch (error) {
        handleError(error, this.context);
        process.exit(1);
      }
    });
  }

  public async run(argv: string[] = process.argv): Promise<void> {
    try {
      await this.program.parseAsync(argv);
    } catch (error) {
      handleError(error, this.context);
      process.exit(1);
    }
  }

  public getProgram(): Command {
    return this.program;
  }

  public getContext(): CLIContext {
    return this.context;
  }
}