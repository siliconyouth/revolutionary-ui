#!/usr/bin/env node

/**
 * Basic Terminal UI for Revolutionary UI
 * Ultra-minimal implementation to avoid all compatibility issues
 */

const blessed = require('blessed');

// Create screen with minimal capabilities
const screen = blessed.screen({
  smartCSR: false,  // Disable CSR to avoid terminal issues
  fullUnicode: false,  // Disable unicode
  useBCE: false,  // Don't use background color erase
  cursor: {
    artificial: true,
    shape: 'line',
    color: null
  }
});

// Set title
screen.title = 'Revolutionary UI';

// Create main box
const mainBox = blessed.box({
  top: 'center',
  left: 'center',
  width: '80%',
  height: '80%',
  content: '',
  tags: false,  // Disable tags to avoid parsing issues
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    border: {
      fg: 'cyan'
    }
  },
  label: ' Revolutionary UI Terminal v3.4.1 '
});

// Create menu list
const menuList = blessed.list({
  parent: mainBox,
  top: 3,
  left: 2,
  width: '100%-4',
  height: '70%',
  items: [
    '1. Generate Component',
    '2. Browse Catalog',
    '3. AI Assistant',
    '4. Settings',
    '5. Exit'
  ],
  keys: true,
  vi: true,
  style: {
    fg: 'white',
    selected: {
      fg: 'black',
      bg: 'cyan'
    }
  }
});

// Create header text
const headerText = blessed.text({
  parent: mainBox,
  top: 1,
  left: 'center',
  content: 'AI-Powered Component Generation',
  style: {
    fg: 'cyan'
  }
});

// Create help text
const helpText = blessed.text({
  parent: mainBox,
  bottom: 1,
  left: 'center',
  content: 'Use arrows to navigate, Enter to select, q to quit',
  style: {
    fg: 'gray'
  }
});

// Append to screen
screen.append(mainBox);

// Handle selection
menuList.on('select', (item, index) => {
  const actions = [
    () => showMessage('Generate Component - Coming Soon!'),
    () => showMessage('Browse Catalog - Coming Soon!'),
    () => showMessage('AI Assistant - Coming Soon!'),
    () => showMessage('Settings - Coming Soon!'),
    () => process.exit(0)
  ];
  
  if (actions[index]) {
    actions[index]();
  }
});

// Show message function
function showMessage(msg) {
  const msgBox = blessed.message({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '50%',
    height: 'shrink',
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      border: {
        fg: 'yellow'
      }
    },
    label: ' Info '
  });
  
  msgBox.display(msg, () => {
    msgBox.destroy();
    screen.render();
  });
}

// Key bindings
screen.key(['escape', 'q', 'C-c'], () => {
  process.exit(0);
});

// Focus menu
menuList.focus();

// Render
screen.render();

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Terminal UI Error:', err.message);
  console.error('Try running with: TERM=xterm node', __filename);
  process.exit(1);
});