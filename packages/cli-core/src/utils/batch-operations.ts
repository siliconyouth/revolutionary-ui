import { EventEmitter } from 'events';
import { createLogger } from './logger.js';
import { withSpinner } from './spinner.js';
import chalk from 'chalk';
import pLimit from 'p-limit';
import { performance } from 'perf_hooks';

export interface BatchOperation<T, R> {
  name: string;
  items: T[];
  operation: (item: T, index: number) => Promise<R>;
  onProgress?: (progress: BatchProgress) => void;
  onError?: (error: BatchError) => void;
  concurrency?: number;
  continueOnError?: boolean;
  retries?: number;
  retryDelay?: number;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  current: string;
  percentage: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}

export interface BatchError {
  item: any;
  error: Error;
  index: number;
  retries: number;
}

export interface BatchResult<R> {
  success: R[];
  failed: Array<{ item: any; error: Error }>;
  skipped: any[];
  duration: number;
  stats: {
    total: number;
    succeeded: number;
    failed: number;
    skipped: number;
    averageTime: number;
  };
}

export class BatchExecutor<T = any, R = any> extends EventEmitter {
  private logger = createLogger();
  private progress: BatchProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    skipped: 0,
    current: '',
    percentage: 0,
    timeElapsed: 0,
    estimatedTimeRemaining: 0,
  };
  private startTime = 0;
  private itemTimes: number[] = [];

  async execute(operation: BatchOperation<T, R>): Promise<BatchResult<R>> {
    this.startTime = performance.now();
    this.progress.total = operation.items.length;
    
    const limit = pLimit(operation.concurrency || 5);
    const results: R[] = [];
    const failed: Array<{ item: T; error: Error }> = [];
    const skipped: T[] = [];

    // Create tasks with concurrency limit
    const tasks = operation.items.map((item, index) => 
      limit(async () => {
        try {
          const itemStart = performance.now();
          
          // Update progress
          this.updateProgress({
            current: this.getItemName(item, index),
          });

          // Execute with retries
          const result = await this.executeWithRetry(
            () => operation.operation(item, index),
            operation.retries || 0,
            operation.retryDelay || 1000
          );

          // Track timing
          const itemTime = performance.now() - itemStart;
          this.itemTimes.push(itemTime);

          // Update progress
          this.progress.completed++;
          this.updateProgress();

          results.push(result);
          
          this.emit('item:success', { item, result, index });
          
        } catch (error: any) {
          this.progress.failed++;
          this.updateProgress();
          
          failed.push({ item, error });
          
          const batchError: BatchError = {
            item,
            error,
            index,
            retries: operation.retries || 0,
          };
          
          this.emit('item:error', batchError);
          
          if (operation.onError) {
            operation.onError(batchError);
          }

          if (!operation.continueOnError) {
            throw error;
          }
        }
      })
    );

    // Execute all tasks
    try {
      await Promise.all(tasks);
    } catch (error) {
      if (!operation.continueOnError) {
        // If we're not continuing on error, we still need to wait for running tasks
        await Promise.allSettled(tasks);
      }
    }

    const duration = performance.now() - this.startTime;

    const result: BatchResult<R> = {
      success: results,
      failed,
      skipped,
      duration,
      stats: {
        total: operation.items.length,
        succeeded: results.length,
        failed: failed.length,
        skipped: skipped.length,
        averageTime: this.itemTimes.length > 0 
          ? this.itemTimes.reduce((a, b) => a + b, 0) / this.itemTimes.length 
          : 0,
      },
    };

    this.emit('complete', result);
    
    return result;
  }

  /**
   * Execute batch operations with progress spinner
   */
  async executeWithProgress<T, R>(
    name: string,
    items: T[],
    operation: (item: T, index: number) => Promise<R>,
    options: Partial<BatchOperation<T, R>> = {}
  ): Promise<BatchResult<R>> {
    const logger = this.logger;
    
    return withSpinner(
      name,
      async (spinner) => {
        const result = await this.execute({
          name,
          items,
          operation,
          ...options,
          onProgress: (progress) => {
            spinner.text = this.formatProgress(name, progress);
            if (options.onProgress) {
              options.onProgress(progress);
            }
          },
        });

        // Show final summary
        if (result.stats.failed > 0) {
          spinner.fail(
            `${name}: ${result.stats.succeeded} succeeded, ${result.stats.failed} failed`
          );
        } else {
          spinner.succeed(
            `${name}: All ${result.stats.total} items processed successfully`
          );
        }

        return result;
      }
    );
  }

  /**
   * Execute operation with retries
   */
  private async executeWithRetry<R>(
    operation: () => Promise<R>,
    retries: number,
    retryDelay: number
  ): Promise<R> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (attempt < retries) {
          this.emit('retry', { attempt: attempt + 1, error });
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Update progress tracking
   */
  private updateProgress(updates: Partial<BatchProgress> = {}): void {
    Object.assign(this.progress, updates);
    
    // Calculate percentage
    this.progress.percentage = Math.round(
      ((this.progress.completed + this.progress.failed) / this.progress.total) * 100
    );
    
    // Calculate times
    this.progress.timeElapsed = performance.now() - this.startTime;
    
    if (this.progress.completed > 0) {
      const averageTime = this.progress.timeElapsed / (this.progress.completed + this.progress.failed);
      const remaining = this.progress.total - this.progress.completed - this.progress.failed;
      this.progress.estimatedTimeRemaining = averageTime * remaining;
    }
    
    this.emit('progress', this.progress);
  }

  /**
   * Format progress for display
   */
  private formatProgress(name: string, progress: BatchProgress): string {
    const bar = this.createProgressBar(progress.percentage);
    const time = this.formatTime(progress.estimatedTimeRemaining);
    
    return `${name} ${bar} ${progress.percentage}% | ${progress.completed}/${progress.total} | ETA: ${time}`;
  }

  /**
   * Create visual progress bar
   */
  private createProgressBar(percentage: number): string {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    return chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  /**
   * Format time duration
   */
  private formatTime(ms: number): string {
    if (ms < 1000) return '<1s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get display name for item
   */
  private getItemName(item: T, index: number): string {
    if (typeof item === 'string') {
      return item;
    } else if (typeof item === 'object' && item !== null) {
      return (item as any).name || (item as any).id || `Item ${index + 1}`;
    }
    return `Item ${index + 1}`;
  }
}

/**
 * Execute batch operations helper
 */
export async function executeBatch<T, R>(
  operation: BatchOperation<T, R>
): Promise<BatchResult<R>> {
  const executor = new BatchExecutor<T, R>();
  return executor.execute(operation);
}

/**
 * Execute batch operations with progress helper
 */
export async function executeBatchWithProgress<T, R>(
  name: string,
  items: T[],
  operation: (item: T, index: number) => Promise<R>,
  options: Partial<BatchOperation<T, R>> = {}
): Promise<BatchResult<R>> {
  const executor = new BatchExecutor<T, R>();
  return executor.executeWithProgress(name, items, operation, options);
}

/**
 * Batch operations for common tasks
 */
export const BatchOperations = {
  /**
   * Install multiple components
   */
  async installComponents(
    components: string[],
    installer: (name: string) => Promise<void>,
    options: Partial<BatchOperation<string, void>> = {}
  ): Promise<BatchResult<void>> {
    return executeBatchWithProgress(
      'Installing components',
      components,
      installer,
      {
        concurrency: 3,
        continueOnError: true,
        ...options,
      }
    );
  },

  /**
   * Process multiple files
   */
  async processFiles<R>(
    files: string[],
    processor: (file: string) => Promise<R>,
    options: Partial<BatchOperation<string, R>> = {}
  ): Promise<BatchResult<R>> {
    return executeBatchWithProgress(
      'Processing files',
      files,
      processor,
      {
        concurrency: 5,
        continueOnError: true,
        ...options,
      }
    );
  },

  /**
   * Run multiple tests
   */
  async runTests(
    tests: string[],
    runner: (test: string) => Promise<boolean>,
    options: Partial<BatchOperation<string, boolean>> = {}
  ): Promise<BatchResult<boolean>> {
    return executeBatchWithProgress(
      'Running tests',
      tests,
      runner,
      {
        concurrency: 4,
        continueOnError: true,
        ...options,
      }
    );
  },

  /**
   * Download multiple resources
   */
  async downloadResources<R>(
    urls: string[],
    downloader: (url: string) => Promise<R>,
    options: Partial<BatchOperation<string, R>> = {}
  ): Promise<BatchResult<R>> {
    return executeBatchWithProgress(
      'Downloading resources',
      urls,
      downloader,
      {
        concurrency: 5,
        continueOnError: true,
        retries: 3,
        retryDelay: 2000,
        ...options,
      }
    );
  },
};