import type { CLICommand } from '../types/index.js';

export interface CommandRegistry {
  register(command: CLICommand): void;
  get(name: string): CLICommand | undefined;
  getAll(): CLICommand[];
}

export class DefaultCommandRegistry implements CommandRegistry {
  private commands: Map<string, CLICommand> = new Map();

  register(command: CLICommand): void {
    this.commands.set(command.name, command);
    if (command.alias) {
      command.alias.forEach(alias => {
        this.commands.set(alias, command);
      });
    }
  }

  get(name: string): CLICommand | undefined {
    return this.commands.get(name);
  }

  getAll(): CLICommand[] {
    // Return unique commands (avoid duplicates from aliases)
    const unique = new Map<string, CLICommand>();
    this.commands.forEach((cmd) => {
      if (!cmd.alias || cmd.name === Array.from(this.commands.entries()).find(([, v]) => v === cmd)?.[0]) {
        unique.set(cmd.name, cmd);
      }
    });
    return Array.from(unique.values());
  }
}

// Export base command class for extension
export abstract class BaseCommand implements CLICommand {
  abstract name: string;
  abstract description: string;
  alias?: string[];
  options?: import('../types/index.js').CommandOption[];
  subcommands?: CLICommand[];

  abstract action(options: any, context: import('../types/index.js').CLIContext): Promise<void>;
}