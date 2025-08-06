import type { CLI } from '@revolutionary-ui/cli-core';
import { LoginCommand } from './login.js';
import { LogoutCommand } from './logout.js';
import { StatusCommand } from './status.js';

export class AuthCommands {
  static async register(cli: CLI): Promise<void> {
    // Create parent auth command
    cli.getProgram()
      .command('auth')
      .description('Authentication and account management')
      .action(() => {
        // Show auth help if no subcommand
        cli.getProgram().outputHelp();
      });
    
    // Register subcommands
    const authCommand = cli.getProgram().commands.find(cmd => cmd.name() === 'auth');
    
    if (authCommand) {
      // Login
      const loginCmd = new LoginCommand();
      authCommand
        .command('login')
        .description(loginCmd.description)
        .action(async () => {
          await loginCmd.action({}, cli.getContext());
        });
      
      // Logout
      const logoutCmd = new LogoutCommand();
      authCommand
        .command('logout')
        .description(logoutCmd.description)
        .action(async () => {
          await logoutCmd.action({}, cli.getContext());
        });
      
      // Status
      const statusCmd = new StatusCommand();
      authCommand
        .command('status')
        .description(statusCmd.description)
        .action(async () => {
          await statusCmd.action({}, cli.getContext());
        });
    }
  }
}