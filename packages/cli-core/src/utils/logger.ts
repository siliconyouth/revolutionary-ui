import chalk from 'chalk';
import ora, { Ora } from 'ora';
import winston from 'winston';
import type { Logger, LogLevel } from '../types/index.js';

class CLILogger implements Logger {
  private winston: winston.Logger;
  private spinner: Ora | null = null;
  private level: LogLevel = 'info';

  constructor() {
    this.winston = winston.createLogger({
      level: this.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, ...rest }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: '.revolutionary-ui/error.log', level: 'error' }),
        new winston.transports.File({ filename: '.revolutionary-ui/combined.log' }),
      ],
    });
  }

  setLevel(level: LogLevel): void {
    this.level = level;
    this.winston.level = level;
  }

  error(message: string, ...args: any[]): void {
    if (this.spinner) {
      this.spinner.fail();
      this.spinner = null;
    }
    console.error(chalk.red('✖'), chalk.red(message), ...args);
    this.winston.error(message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    if (this.spinner) {
      this.spinner.warn();
      this.spinner = null;
    }
    console.warn(chalk.yellow('⚠'), chalk.yellow(message), ...args);
    this.winston.warn(message, ...args);
  }

  info(message: string, ...args: any[]): void {
    if (this.spinner) {
      this.spinner.info();
      this.spinner = null;
    }
    console.info(chalk.blue('ℹ'), message, ...args);
    this.winston.info(message, ...args);
  }

  success(message: string, ...args: any[]): void {
    if (this.spinner) {
      this.spinner.succeed();
      this.spinner = null;
    }
    console.log(chalk.green('✓'), chalk.green(message), ...args);
    this.winston.info(`[SUCCESS] ${message}`, ...args);
  }

  verbose(message: string, ...args: any[]): void {
    if (this.level === 'verbose' || this.level === 'debug') {
      console.log(chalk.gray('▸'), chalk.gray(message), ...args);
    }
    this.winston.verbose(message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (this.level === 'debug') {
      console.log(chalk.gray('●'), chalk.gray(message), ...args);
    }
    this.winston.debug(message, ...args);
  }

  startSpinner(text: string): void {
    this.spinner = ora({
      text,
      spinner: 'dots',
    }).start();
  }

  updateSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }

  stopSpinner(success: boolean = true, text?: string): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed(text);
      } else {
        this.spinner.fail(text);
      }
      this.spinner = null;
    }
  }
}

let instance: CLILogger | null = null;

export function createLogger(): CLILogger & {
  setLevel: (level: LogLevel) => void;
  startSpinner: (text: string) => void;
  updateSpinner: (text: string) => void;
  stopSpinner: (success?: boolean, text?: string) => void;
} {
  if (!instance) {
    instance = new CLILogger();
  }
  return instance;
}

export { CLILogger };