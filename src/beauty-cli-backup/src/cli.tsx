#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { App } from './App.js';

// Clear the screen and move cursor to top
console.clear();

const cli = meow(`
  Revolutionary UI CLI - AI-powered component generation

  Usage
    $ revui [command] [options]

  Commands
    generate    Generate AI-powered components
    analyze     Analyze your project
    search      Search component catalog
    chat        AI chat assistant
    sync        Cloud sync manager
    settings    Manage settings
    templates   Template manager
    docs        Generate documentation
    factory     Browse factory patterns

  Options
    --help      Show help
    --version   Show version

  Examples
    $ revui
    $ revui generate form
    $ revui search "data table"
    $ revui analyze --detailed
`, {
  importMeta: import.meta,
  flags: {
    help: {
      type: 'boolean',
      shortFlag: 'h'
    },
    version: {
      type: 'boolean',
      shortFlag: 'v'
    }
  }
});

// Parse command from input
const command = cli.input[0];
const args = cli.input.slice(1);

render(<App command={command} args={args} flags={cli.flags} />);