#!/usr/bin/env node

const blessed = require('blessed');

// Create a simple test screen to verify arrow navigation
const screen = blessed.screen({
  smartCSR: true,
  title: 'Arrow Navigation Test'
});

const box = blessed.box({
  top: 'center',
  left: 'center',
  width: '80%',
  height: '80%',
  content: 'Arrow Navigation Test\n\nPress arrows to test:\n← Left Arrow\n→ Right Arrow\n↑ Up Arrow\n↓ Down Arrow\n\nESC to quit',
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'cyan'
    }
  }
});

const status = blessed.box({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 3,
  content: 'Ready to test arrow keys...',
  style: {
    fg: 'yellow'
  }
});

screen.append(box);
screen.append(status);

// Test arrow key handling
screen.key(['left', 'right', 'up', 'down'], (ch, key) => {
  status.setContent(`Arrow key pressed: ${key.name} (${key.full})`);
  screen.render();
});

screen.key(['escape', 'q', 'C-c'], () => {
  process.exit(0);
});

box.focus();
screen.render();

console.log('Arrow navigation test started. Press arrow keys to test.');