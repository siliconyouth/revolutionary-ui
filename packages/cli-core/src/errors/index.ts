import chalk from 'chalk';
import terminalLink from 'terminal-link';
import type { CLIContext } from '../types/index.js';
import { createLogger } from '../utils/logger.js';

// Re-export the new enhanced error system
export { CLIError, ErrorCodes, errors } from './cli-error.js';
import { CLIError as EnhancedCLIError } from './cli-error.js';

// Keep legacy error for backward compatibility but extend new one
export class CLIErrorLegacy extends EnhancedCLIError {
  constructor(
    message: string,
    public code: string,
    public suggestions?: string[],
    public documentation?: string
  ) {
    super({
      code,
      message,
      suggestion: suggestions?.join('. '),
      docs: documentation,
    });
  }
}

export class AuthenticationError extends CLIErrorLegacy {
  constructor(message: string = 'Authentication required') {
    super(
      message,
      'AUTH_REQUIRED',
      [
        'Run "rui auth login" to authenticate',
        'Check your internet connection',
        'Verify your credentials are correct',
      ],
      'https://revolutionary-ui.com/docs/auth'
    );
  }
}

export class NetworkError extends CLIErrorLegacy {
  constructor(message: string = 'Network request failed') {
    super(
      message,
      'NETWORK_ERROR',
      [
        'Check your internet connection',
        'Try again in a few moments',
        'Check if you\'re behind a proxy or firewall',
      ],
      'https://revolutionary-ui.com/docs/troubleshooting#network'
    );
  }
}

export class ValidationError extends CLIErrorLegacy {
  constructor(message: string, field?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      field ? [`Check the value of "${field}"`, 'Run with --help to see valid options'] : undefined
    );
  }
}

export class FileSystemError extends CLIErrorLegacy {
  constructor(message: string, path?: string) {
    super(
      message,
      'FS_ERROR',
      path
        ? [
            `Check if the path exists: ${path}`,
            'Verify you have the necessary permissions',
            'Ensure the disk has available space',
          ]
        : undefined
    );
  }
}

export class DependencyError extends CLIErrorLegacy {
  constructor(dependency: string, command?: string) {
    super(
      `Missing dependency: ${dependency}`,
      'DEPENDENCY_ERROR',
      command
        ? [`Install with: ${command}`, 'Check your package.json']
        : [`Install ${dependency}`, 'Run "npm install" or "pnpm install"']
    );
  }
}

export function handleError(error: unknown, context: CLIContext): void {
  const logger = createLogger();

  if (context.flags.debug) {
    console.error(error);
  }

  if (error instanceof EnhancedCLIError) {
    // Use the new format() method for enhanced errors
    console.error(error.format());
    process.exit(error.exitCode);
  } else if (error instanceof CLIErrorLegacy) {
    logger.error(error.message);

    if (error.suggestions && error.suggestions.length > 0) {
      console.log('\n' + chalk.yellow('Suggestions:'));
      error.suggestions.forEach((suggestion) => {
        console.log(chalk.dim('  •'), suggestion);
      });
    }

    if (error.documentation) {
      const link = terminalLink('Documentation', error.documentation, {
        fallback: (text, url) => `${text}: ${url}`,
      });
      console.log('\n' + chalk.blue('Need help?'), link);
    }

    if (error.code) {
      console.log('\n' + chalk.gray(`Error code: ${error.code}`));
    }
  } else if (error instanceof Error) {
    logger.error(error.message);

    if (error.stack && context.flags.debug) {
      console.error(chalk.gray(error.stack));
    }

    // Provide generic suggestions
    console.log('\n' + chalk.yellow('Suggestions:'));
    console.log(chalk.dim('  •'), 'Run with --debug flag for more details');
    console.log(chalk.dim('  •'), 'Check the documentation at https://revolutionary-ui.com/docs');
    console.log(chalk.dim('  •'), 'Report issues at https://github.com/revolutionary-ui/cli/issues');
  } else {
    logger.error('An unexpected error occurred');
    console.error(error);
  }

  // Show command to get help
  console.log('\n' + chalk.gray('Run "rui help" for usage information'));
}