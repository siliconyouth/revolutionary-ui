#!/usr/bin/env node
const child_process = require('child_process');
const path = require('path');

// Launch the CLI with a PTY to enable raw mode
const spawn = require('child_process').spawn;
const cli = spawn('node', [path.join(__dirname, 'dist/cli.js'), 'dashboard'], {
  stdio: 'inherit',
  env: { ...process.env, FORCE_COLOR: '1' }
});

cli.on('close', (code) => {
  process.exit(code);
});