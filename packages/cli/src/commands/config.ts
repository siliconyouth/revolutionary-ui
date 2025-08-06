import { BaseCommand, type CLIContext, input, select, confirm } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';

export class ConfigCommand extends BaseCommand {
  name = 'config';
  description = 'Manage configuration';
  
  subcommands = [
    new GetConfigCommand(),
    new SetConfigCommand(),
    new ListConfigCommand(),
    new ResetConfigCommand(),
  ];

  async action(options: any, context: CLIContext): Promise<void> {
    const action = await select('Configuration actions:', [
      { name: 'List all', value: 'list', description: 'Show all configuration' },
      { name: 'Get value', value: 'get', description: 'Get a specific value' },
      { name: 'Set value', value: 'set', description: 'Set a configuration value' },
      { name: 'Reset', value: 'reset', description: 'Reset to defaults' },
    ]);

    const program = context.program || this.program;
    await program.parseAsync(['node', 'rui', 'config', action]);
  }
}

class GetConfigCommand extends BaseCommand {
  name = 'get <key>';
  description = 'Get a configuration value';

  async action(key: string, options: any, context: CLIContext): Promise<void> {
    const { ConfigManager } = await import('@revolutionary-ui/cli-core');
    const configManager = new ConfigManager();
    const config = await configManager.load();
    
    const value = this.getNestedValue(config, key);
    
    if (value === undefined) {
      console.log(chalk.yellow(`Configuration key "${key}" not found`));
      return;
    }

    if (context.flags.json) {
      console.log(JSON.stringify(value, null, 2));
    } else {
      console.log(chalk.bold(`${key}:`), value);
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

class SetConfigCommand extends BaseCommand {
  name = 'set <key> <value>';
  description = 'Set a configuration value';
  
  options = [
    { flags: '-g, --global', description: 'Set in global config' },
  ];

  async action(key: string, value: string, options: any, context: CLIContext): Promise<void> {
    const { ConfigManager, withSpinner } = await import('@revolutionary-ui/cli-core');
    const configManager = new ConfigManager();
    
    // Parse value
    let parsedValue: any = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (!isNaN(Number(value))) parsedValue = Number(value);
    
    await withSpinner(`Setting ${key}`, async () => {
      const config = await configManager.load();
      this.setNestedValue(config, key, parsedValue);
      await configManager.save(config, options.global);
    });

    console.log(chalk.green(`✓ Set ${key} = ${parsedValue}`));
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    let current = obj;
    for (const key of keys) {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }
}

class ListConfigCommand extends BaseCommand {
  name = 'list';
  description = 'List all configuration';
  alias = ['ls'];

  async action(options: any, context: CLIContext): Promise<void> {
    const { ConfigManager } = await import('@revolutionary-ui/cli-core');
    const configManager = new ConfigManager();
    const config = await configManager.load();

    console.log(chalk.bold('\n⚙️  Configuration\n'));

    if (context.flags.json) {
      console.log(JSON.stringify(config, null, 2));
    } else {
      this.printConfig(config);
    }
  }

  private printConfig(obj: any, prefix: string = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        console.log(chalk.gray(`${prefix}${key}:`));
        this.printConfig(value, prefix + '  ');
      } else {
        const displayValue = key === 'token' || key === 'refreshToken' 
          ? '[REDACTED]' 
          : JSON.stringify(value);
        console.log(`${prefix}${chalk.cyan(key)}: ${displayValue}`);
      }
    }
  }
}

class ResetConfigCommand extends BaseCommand {
  name = 'reset';
  description = 'Reset configuration to defaults';
  
  options = [
    { flags: '-g, --global', description: 'Reset global config' },
    { flags: '-f, --force', description: 'Skip confirmation' },
  ];

  async action(options: any, context: CLIContext): Promise<void> {
    if (!options.force) {
      const confirmed = await confirm(
        `Reset ${options.global ? 'global' : 'local'} configuration to defaults?`,
        false
      );
      if (!confirmed) {
        console.log('Reset cancelled.');
        return;
      }
    }

    const { ConfigManager, withSpinner } = await import('@revolutionary-ui/cli-core');
    
    await withSpinner('Resetting configuration', async () => {
      const configManager = new ConfigManager();
      await configManager.clear(options.global);
    });

    console.log(chalk.green('✓ Configuration reset to defaults'));
  }
}