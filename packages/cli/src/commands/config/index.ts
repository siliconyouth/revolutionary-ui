import type { CLI, CLIContext } from '@revolutionary-ui/cli-core';
import { createLogger } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';

export class ConfigCommands {
  static async register(cli: CLI): Promise<void> {
    const logger = createLogger();
    
    // Create parent config command
    const configCmd = cli.getProgram()
      .command('config')
      .description('Manage Revolutionary UI configuration');
    
    // config set
    configCmd
      .command('set <key> <value>')
      .description('Set a configuration value')
      .option('-g, --global', 'Set in global config')
      .option('-w, --workspace', 'Set in workspace root config')
      .action(async (key: string, value: string, options: any) => {
        await ConfigCommands.set(key, value, options, cli.getContext());
      });
    
    // config get
    configCmd
      .command('get <key>')
      .description('Get a configuration value')
      .action(async (key: string) => {
        await ConfigCommands.get(key, cli.getContext());
      });
    
    // config list
    configCmd
      .command('list')
      .alias('ls')
      .description('List all configuration values')
      .action(async () => {
        await ConfigCommands.list(cli.getContext());
      });
    
    // config reset
    configCmd
      .command('reset')
      .description('Reset configuration to defaults')
      .action(async () => {
        await ConfigCommands.reset(cli.getContext());
      });
  }
  
  static async set(key: string, value: string, options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    const { readJson, writeJson, fileExists, configLoader } = await import('@revolutionary-ui/cli-core');
    
    // Determine config level
    let level: 'global' | 'workspace' | 'package' = 'package';
    if (options.global) level = 'global';
    else if (options.workspace) level = 'workspace';
    
    // Load current config hierarchy
    const hierarchy = await configLoader.loadHierarchy();
    let config = { ...hierarchy.merged };
    
    // Parse value
    let parsedValue: any = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (!isNaN(Number(value))) parsedValue = Number(value);
    
    // Set nested property
    const keys = key.split('.');
    let current: any = config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = parsedValue;
    
    // Save config at appropriate level
    await configLoader.saveConfig(config, level);
    
    const levelIndicator = level === 'global' ? ' (global)' : level === 'workspace' ? ' (workspace)' : '';
    logger.success(`Set ${chalk.cyan(key)} = ${chalk.green(parsedValue)}${levelIndicator}`);
  }
  
  static async get(key: string, context: CLIContext): Promise<void> {
    const logger = createLogger();
    const { readJson, fileExists } = await import('@revolutionary-ui/cli-core');
    
    const configPath = '.revolutionary-ui.json';
    
    if (!await fileExists(configPath)) {
      const { errors } = await import('@revolutionary-ui/cli-core');
      throw errors.config.notFound();
    }
    
    const config = await readJson(configPath);
    
    // Get nested property
    const keys = key.split('.');
    let value: any = config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        const { errors } = await import('@revolutionary-ui/cli-core');
        throw errors.config.invalid(`Configuration key "${key}" not found`);
      }
    }
    
    logger.info(`${chalk.cyan(key)} = ${chalk.green(JSON.stringify(value))}`);
  }
  
  static async list(context: CLIContext): Promise<void> {
    const logger = createLogger();
    const { configLoader } = await import('@revolutionary-ui/cli-core');
    
    const hierarchy = await configLoader.loadHierarchy();
    
    logger.info(chalk.bold('\n⚙️  Revolutionary UI Configuration\n'));
    
    // Show where configs are loaded from
    if (hierarchy.global) {
      logger.info(chalk.gray('Global config: ~/.revolutionary-ui/config.json'));
    }
    if (hierarchy.workspace) {
      logger.info(chalk.gray('Workspace config: .revolutionary-ui.json'));
    }
    if (hierarchy.package) {
      logger.info(chalk.gray('Package config: .revolutionary-ui.json'));
    }
    
    logger.info(chalk.bold('\n📋 Merged Configuration:\n'));
    this.printConfig(hierarchy.merged, '', logger);
    
    // Show which level each setting comes from
    if ((context as any).flags?.verbose) {
      logger.info(chalk.bold('\n🔍 Configuration Sources:\n'));
      this.printConfigSources(hierarchy, logger);
    }
  }
  
  static async reset(context: CLIContext): Promise<void> {
    const logger = createLogger();
    const { confirm, writeJson } = await import('@revolutionary-ui/cli-core');
    
    const confirmed = await confirm(
      'Are you sure you want to reset configuration to defaults?',
      false
    );
    
    if (!confirmed) {
      logger.info('Reset cancelled.');
      return;
    }
    
    const defaultConfig = {
      version: '3.3.0',
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
    
    await writeJson('.revolutionary-ui.json', defaultConfig);
    logger.success('\n✨ Configuration reset to defaults!');
  }
  
  private static printConfig(obj: any, prefix: string, logger: any, indent: string = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        logger.info(`${indent}${chalk.gray(fullKey)}:`);
        this.printConfig(value, fullKey, logger, indent + '  ');
      } else {
        logger.info(`${indent}${chalk.cyan(fullKey)} = ${chalk.green(JSON.stringify(value))}`);
      }
    }
  }
  
  private static printConfigSources(hierarchy: any, logger: any): void {
    const sources: Record<string, string> = {};
    
    // Mark all keys with their source
    this.markSources(hierarchy.global, 'global', sources);
    this.markSources(hierarchy.workspace, 'workspace', sources);
    this.markSources(hierarchy.package, 'package', sources);
    
    // Print sources
    for (const [key, source] of Object.entries(sources)) {
      logger.info(`  ${chalk.cyan(key)} → ${chalk.gray(source)}`);
    }
  }
  
  private static markSources(config: any, source: string, sources: Record<string, string>, prefix = ''): void {
    if (!config) return;
    
    for (const [key, value] of Object.entries(config)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.markSources(value, source, sources, fullKey);
      } else {
        sources[fullKey] = source;
      }
    }
  }
}