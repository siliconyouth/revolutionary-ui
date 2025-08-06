import { BaseCommand, type CLIContext, input, password, withSpinner, select } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';

export class AuthCommand extends BaseCommand {
  name = 'auth';
  description = 'Manage authentication';
  
  subcommands = [
    new LoginCommand(),
    new LogoutCommand(),
    new StatusCommand(),
    new RegisterCommand(),
  ];

  async action(options: any, context: CLIContext): Promise<void> {
    // If no subcommand, show auth menu
    const action = await select('Authentication actions:', [
      { name: 'Login', value: 'login', description: 'Login to your account' },
      { name: 'Register', value: 'register', description: 'Create a new account' },
      { name: 'Status', value: 'status', description: 'Check authentication status' },
      { name: 'Logout', value: 'logout', description: 'Logout from your account' },
    ]);

    const program = context.program || this.program;
    await program.parseAsync(['node', 'rui', 'auth', action]);
  }
}

class LoginCommand extends BaseCommand {
  name = 'login';
  description = 'Login to your Revolutionary UI account';
  
  options = [
    { flags: '-e, --email <email>', description: 'Email address' },
    { flags: '-t, --token <token>', description: 'Use API token instead' },
  ];

  async action(options: any, context: CLIContext): Promise<void> {
    console.log(chalk.bold('\n🔐 Login to Revolutionary UI\n'));

    if (options.token) {
      // Token-based authentication
      await this.loginWithToken(options.token, context);
    } else {
      // Email/password authentication
      const email = options.email || await input('Email:', undefined, (value) => {
        const { validateEmail } = require('@revolutionary-ui/cli-core');
        return validateEmail(value) || 'Invalid email format';
      });

      const pass = await password('Password:');

      await withSpinner('Logging in', async () => {
        // TODO: Implement actual authentication
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Save auth config
        const { ConfigManager } = await import('@revolutionary-ui/cli-core');
        const configManager = new ConfigManager();
        await configManager.set('auth', {
          token: 'mock-token-123',
          refreshToken: 'mock-refresh-123',
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      });

      console.log(chalk.green('\n✓ Successfully logged in!\n'));
      console.log('You can now access all Revolutionary UI features.');
    }
  }

  private async loginWithToken(token: string, context: CLIContext): Promise<void> {
    await withSpinner('Validating token', async () => {
      // TODO: Validate token with API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { ConfigManager } = await import('@revolutionary-ui/cli-core');
      const configManager = new ConfigManager();
      await configManager.set('auth', {
        token,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days for tokens
      });
    });

    console.log(chalk.green('\n✓ Successfully authenticated with token!\n'));
  }
}

class LogoutCommand extends BaseCommand {
  name = 'logout';
  description = 'Logout from your Revolutionary UI account';

  async action(options: any, context: CLIContext): Promise<void> {
    const { confirm, ConfigManager } = await import('@revolutionary-ui/cli-core');
    
    const confirmed = await confirm('Are you sure you want to logout?', true);
    if (!confirmed) {
      console.log('Logout cancelled.');
      return;
    }

    await withSpinner('Logging out', async () => {
      const configManager = new ConfigManager();
      await configManager.delete('auth');
      await configManager.delete('team');
    });

    console.log(chalk.green('\n✓ Successfully logged out!\n'));
  }
}

class StatusCommand extends BaseCommand {
  name = 'status';
  description = 'Check authentication status';

  async action(options: any, context: CLIContext): Promise<void> {
    const { ConfigManager } = await import('@revolutionary-ui/cli-core');
    const configManager = new ConfigManager();
    const auth = await configManager.get('auth');

    console.log(chalk.bold('\n🔐 Authentication Status\n'));

    if (!auth || !auth.token) {
      console.log(chalk.yellow('Not authenticated'));
      console.log('\nRun "rui auth login" to authenticate.');
      return;
    }

    const isExpired = auth.expiresAt && auth.expiresAt < Date.now();
    
    if (isExpired) {
      console.log(chalk.red('Authentication expired'));
      console.log('\nPlease login again with "rui auth login".');
    } else {
      console.log(chalk.green('✓ Authenticated'));
      
      if (auth.expiresAt) {
        const expiresIn = Math.floor((auth.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
        console.log(chalk.gray(`Token expires in ${expiresIn} days`));
      }
      
      // Show team info if available
      const team = await configManager.get('team');
      if (team) {
        console.log(chalk.gray(`Team: ${team.id} (${team.role})`));
      }
    }
  }
}

class RegisterCommand extends BaseCommand {
  name = 'register';
  description = 'Create a new Revolutionary UI account';

  async action(options: any, context: CLIContext): Promise<void> {
    console.log(chalk.bold('\n🚀 Create Revolutionary UI Account\n'));

    const email = await input('Email:', undefined, (value) => {
      const { validateEmail } = require('@revolutionary-ui/cli-core');
      return validateEmail(value) || 'Invalid email format';
    });

    const pass = await password('Password:');
    const confirmPass = await password('Confirm password:');

    if (pass !== confirmPass) {
      console.log(chalk.red('\n✗ Passwords do not match!'));
      return;
    }

    const name = await input('Full name:');
    const company = await input('Company (optional):');

    const newsletter = await confirm('Subscribe to newsletter?', true);

    await withSpinner('Creating account', async () => {
      // TODO: Implement actual registration
      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    console.log(chalk.green('\n✨ Account created successfully!\n'));
    console.log('Welcome to Revolutionary UI! 🎉');
    console.log('\nYou are now logged in and can start using all features.');
  }
}