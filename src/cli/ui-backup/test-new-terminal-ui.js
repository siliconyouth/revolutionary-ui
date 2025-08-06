#!/usr/bin/env node

/**
 * Test script for the new Revolutionary UI Terminal
 */

const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.cyan.bold('Testing Revolutionary UI Terminal...'));
console.log(chalk.gray('===================================='));

// Test 1: Check if the executable exists
const terminalPath = path.join(__dirname, 'revolutionary-ui-terminal');
const fs = require('fs');

if (!fs.existsSync(terminalPath)) {
  console.error(chalk.red('✗ Terminal UI executable not found'));
  process.exit(1);
}

console.log(chalk.green('✓ Terminal UI executable found'));

// Test 2: Check if it's executable
try {
  fs.accessSync(terminalPath, fs.constants.X_OK);
  console.log(chalk.green('✓ File is executable'));
} catch (error) {
  console.error(chalk.red('✗ File is not executable'));
  console.log(chalk.yellow('  Run: chmod +x revolutionary-ui-terminal'));
  process.exit(1);
}

// Test 3: Launch the terminal UI
console.log(chalk.cyan('\nLaunching Terminal UI...'));
console.log(chalk.gray('Press Ctrl+C to exit the test'));

const child = spawn(terminalPath, [], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TERM: 'xterm-256color',
    NODE_ENV: 'development'
  }
});

child.on('error', (error) => {
  console.error(chalk.red('\n✗ Failed to launch Terminal UI:'), error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(chalk.green('\n✓ Terminal UI exited successfully'));
  } else {
    console.error(chalk.red(`\n✗ Terminal UI exited with code ${code}`));
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\nStopping test...'));
  child.kill('SIGINT');
});