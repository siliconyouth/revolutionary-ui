import ora, { Ora } from 'ora';
import chalk from 'chalk';

export class Spinner {
  private ora: Ora;

  constructor(text?: string) {
    this.ora = ora({
      text,
      spinner: 'dots',
    });
  }

  start(text?: string): this {
    if (text) {
      this.ora.text = text;
    }
    this.ora.start();
    return this;
  }

  stop(): this {
    this.ora.stop();
    return this;
  }

  succeed(text?: string): this {
    this.ora.succeed(text);
    return this;
  }

  fail(text?: string): this {
    this.ora.fail(text);
    return this;
  }

  warn(text?: string): this {
    this.ora.warn(text);
    return this;
  }

  info(text?: string): this {
    this.ora.info(text);
    return this;
  }

  update(text: string): this {
    this.ora.text = text;
    return this;
  }

  clear(): this {
    this.ora.clear();
    return this;
  }

  isSpinning(): boolean {
    return this.ora.isSpinning;
  }
}

export function createSpinner(text?: string): Spinner {
  return new Spinner(text);
}

export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>,
  options?: {
    successText?: string | ((result: T) => string);
    failText?: string | ((error: Error) => string);
  }
): Promise<T> {
  const spinner = createSpinner(text);
  spinner.start();

  try {
    const result = await fn();
    const successText = options?.successText
      ? typeof options.successText === 'function'
        ? options.successText(result)
        : options.successText
      : chalk.green('✓') + ' ' + text;
    
    spinner.succeed(successText);
    return result;
  } catch (error) {
    const failText = options?.failText
      ? typeof options.failText === 'function'
        ? options.failText(error as Error)
        : options.failText
      : chalk.red('✗') + ' ' + text;
    
    spinner.fail(failText);
    throw error;
  }
}