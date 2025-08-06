import { BaseCommand, type CLIContext, createLogger, BatchOperations, executeBatchWithProgress, input, confirm, select } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';

export class BatchCommand extends BaseCommand {
  name = 'batch <operation>';
  description = 'Run batch operations on multiple items';
  alias = ['bulk'];
  
  options = [
    { flags: '-f, --file <path>', description: 'Read items from file (one per line)' },
    { flags: '-p, --pattern <glob>', description: 'Use glob pattern to find items' },
    { flags: '-c, --concurrency <n>', description: 'Number of concurrent operations', defaultValue: '5' },
    { flags: '--continue-on-error', description: 'Continue processing on errors' },
    { flags: '-r, --retries <n>', description: 'Number of retries on failure', defaultValue: '0' },
    { flags: '--dry-run', description: 'Preview operations without executing' },
  ];

  async action(operation: string, options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold(`\n⚡ Batch Operation: ${operation}\n`));

    try {
      // Get items to process
      const items = await this.getItems(options);
      
      if (items.length === 0) {
        logger.warn('No items to process');
        return;
      }

      logger.info(`Found ${chalk.cyan(items.length)} items to process\n`);

      // Show preview
      if (items.length <= 10) {
        logger.info('Items:');
        items.forEach(item => logger.info(`  • ${item}`));
      } else {
        logger.info('First 10 items:');
        items.slice(0, 10).forEach(item => logger.info(`  • ${item}`));
        logger.info(`  ... and ${items.length - 10} more`);
      }

      if (options.dryRun) {
        logger.info('\n' + chalk.yellow('Dry run - no operations will be performed'));
        return;
      }

      // Confirm
      const proceed = await confirm(`\nProceed with batch ${operation} on ${items.length} items?`, true);
      if (!proceed) {
        logger.info('Operation cancelled');
        return;
      }

      // Execute batch operation
      switch (operation) {
        case 'add':
          await this.batchAdd(items, options, context);
          break;
        case 'install':
          await this.batchInstall(items, options, context);
          break;
        case 'update':
          await this.batchUpdate(items, options, context);
          break;
        case 'test':
          await this.batchTest(items, options, context);
          break;
        case 'lint':
          await this.batchLint(items, options, context);
          break;
        case 'format':
          await this.batchFormat(items, options, context);
          break;
        case 'custom':
          await this.batchCustom(items, options, context);
          break;
        default:
          logger.error(`Unknown batch operation: ${operation}`);
          logger.info('\nAvailable operations:');
          logger.info('  • add     - Add multiple components');
          logger.info('  • install - Install multiple packages');
          logger.info('  • update  - Update multiple components');
          logger.info('  • test    - Run tests on multiple files');
          logger.info('  • lint    - Lint multiple files');
          logger.info('  • format  - Format multiple files');
          logger.info('  • custom  - Run custom command on items');
      }
    } catch (error: any) {
      logger.error('Batch operation failed:', error.message);
    }
  }

  private async getItems(options: any): Promise<string[]> {
    const items: string[] = [];

    // Read from file
    if (options.file) {
      const content = await readFile(options.file, 'utf-8');
      items.push(...content.split('\n').filter(line => line.trim()));
    }

    // Use glob pattern
    if (options.pattern) {
      const matches = await glob(options.pattern);
      items.push(...matches);
    }

    // If no file or pattern, read from stdin
    if (!options.file && !options.pattern) {
      const logger = createLogger();
      logger.info('Enter items (one per line, empty line to finish):');
      
      let item;
      while ((item = await input('')) !== '') {
        if (item.trim()) {
          items.push(item.trim());
        }
      }
    }

    // Remove duplicates
    return [...new Set(items)];
  }

  private async batchAdd(components: string[], options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    const { AddCommand } = await import('./add.js');
    const addCmd = new AddCommand();

    const result = await BatchOperations.installComponents(
      components,
      async (component) => {
        await addCmd.action([component], { yes: true }, context);
      },
      {
        concurrency: parseInt(options.concurrency),
        continueOnError: options.continueOnError,
        retries: parseInt(options.retries),
      }
    );

    this.showResults(result);
  }

  private async batchInstall(packages: string[], options: any, context: CLIContext): Promise<void> {
    const { detectPackageManager, installPackages } = await import('@revolutionary-ui/cli-core');
    const pm = await detectPackageManager();

    const result = await executeBatchWithProgress(
      `Installing packages with ${pm}`,
      packages,
      async (pkg) => {
        await installPackages([pkg], pm);
      },
      {
        concurrency: parseInt(options.concurrency),
        continueOnError: options.continueOnError,
        retries: parseInt(options.retries),
      }
    );

    this.showResults(result);
  }

  private async batchUpdate(components: string[], options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    // This would update components to their latest versions
    const result = await executeBatchWithProgress(
      'Updating components',
      components,
      async (component) => {
        // In a real implementation, this would:
        // 1. Check for updates
        // 2. Download new version
        // 3. Update files
        logger.debug(`Updating ${component}...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
      },
      {
        concurrency: parseInt(options.concurrency),
        continueOnError: options.continueOnError,
        retries: parseInt(options.retries),
      }
    );

    this.showResults(result);
  }

  private async batchTest(files: string[], options: any, context: CLIContext): Promise<void> {
    const { execa } = await import('execa');

    const result = await BatchOperations.runTests(
      files,
      async (file) => {
        const { stdout } = await execa('npm', ['test', '--', file]);
        return !stdout.includes('FAIL');
      },
      {
        concurrency: parseInt(options.concurrency),
        continueOnError: true,
      }
    );

    this.showResults(result);
  }

  private async batchLint(files: string[], options: any, context: CLIContext): Promise<void> {
    const { execa } = await import('execa');

    const result = await BatchOperations.processFiles(
      files,
      async (file) => {
        await execa('npx', ['eslint', file, '--fix']);
        return { file, fixed: true };
      },
      {
        concurrency: parseInt(options.concurrency),
        continueOnError: true,
      }
    );

    this.showResults(result);
  }

  private async batchFormat(files: string[], options: any, context: CLIContext): Promise<void> {
    const { execa } = await import('execa');

    const result = await BatchOperations.processFiles(
      files,
      async (file) => {
        await execa('npx', ['prettier', '--write', file]);
        return { file, formatted: true };
      },
      {
        concurrency: parseInt(options.concurrency),
        continueOnError: true,
      }
    );

    this.showResults(result);
  }

  private async batchCustom(items: string[], options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    // Ask for custom command
    const command = await input('Enter command to run (use $ITEM for item placeholder):');
    if (!command) {
      logger.warn('No command provided');
      return;
    }

    const { execa } = await import('execa');

    const result = await executeBatchWithProgress(
      'Running custom command',
      items,
      async (item) => {
        // Replace $ITEM with actual item
        const cmd = command.replace(/\$ITEM/g, item);
        const [prog, ...args] = cmd.split(' ');
        
        const { stdout } = await execa(prog, args);
        return { item, output: stdout };
      },
      {
        concurrency: parseInt(options.concurrency),
        continueOnError: options.continueOnError,
        retries: parseInt(options.retries),
      }
    );

    this.showResults(result);
  }

  private showResults(result: any): void {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n📊 Batch Operation Results:\n'));
    
    logger.info(`Total items: ${chalk.cyan(result.stats.total)}`);
    logger.info(`Succeeded: ${chalk.green(result.stats.succeeded)}`);
    
    if (result.stats.failed > 0) {
      logger.info(`Failed: ${chalk.red(result.stats.failed)}`);
      
      if (result.failed.length <= 5) {
        logger.info('\nFailed items:');
        result.failed.forEach((f: any) => {
          logger.error(`  • ${f.item}: ${f.error.message}`);
        });
      } else {
        logger.info('\nFirst 5 failed items:');
        result.failed.slice(0, 5).forEach((f: any) => {
          logger.error(`  • ${f.item}: ${f.error.message}`);
        });
        logger.info(`  ... and ${result.failed.length - 5} more`);
      }
    }
    
    if (result.stats.skipped > 0) {
      logger.info(`Skipped: ${chalk.yellow(result.stats.skipped)}`);
    }
    
    logger.info(`\nDuration: ${chalk.gray(this.formatDuration(result.duration))}`);
    logger.info(`Average time per item: ${chalk.gray(this.formatDuration(result.stats.averageTime))}`);
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}