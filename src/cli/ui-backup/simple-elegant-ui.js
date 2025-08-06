#!/usr/bin/env node

/**
 * Simple Elegant Terminal UI for Revolutionary UI
 * A working version with basic functionality
 */

const blessed = require('blessed');

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Revolutionary UI - Simple Elegant Terminal',
  fullUnicode: true,
  warnings: false
});

// Color theme
const theme = {
  primary: 'cyan',
  secondary: 'blue',
  accent: 'magenta',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  border: 'white',
  muted: 'gray'
};

// Header
const header = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 3,
  border: { type: 'line' },
  style: { 
    border: { fg: theme.border },
    fg: theme.primary,
    bold: true
  },
  content: ' Revolutionary UI - Elegant Terminal Interface v3.4.1',
  align: 'center'
});

// Sidebar
const sidebar = blessed.list({
  top: 3,
  left: 0,
  width: 20,
  height: '100%-6',
  border: { type: 'line' },
  style: {
    border: { fg: theme.border },
    selected: { 
      bg: theme.accent,
      fg: 'white',
      bold: true
    }
  },
  label: ' Menu ',
  items: [
    '> Dashboard',
    '  Generate',
    '  Catalog',
    '  Analytics',
    '  Settings'
  ],
  mouse: true,
  keys: true,
  vi: true
});

// Main content
const content = blessed.box({
  top: 3,
  left: 20,
  width: '100%-20',
  height: '100%-6',
  border: { type: 'line' },
  style: { border: { fg: theme.border } },
  label: ' Dashboard ',
  padding: 1
});

// Stats
const statsBox = blessed.box({
  parent: content,
  top: 0,
  left: 0,
  width: '100%',
  height: 10,
  content: `
{${theme.success}-fg}Components Generated:{/}  156
{${theme.primary}-fg}Lines of Code Saved:{/}   45,234
{${theme.warning}-fg}Active Projects:{/}       12
{${theme.secondary}-fg}Team Members:{/}          8

Performance: ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁`,
  tags: true
});

// Activity log
const activityBox = blessed.log({
  parent: content,
  top: 10,
  left: 0,
  width: '100%',
  height: '100%-10',
  border: { type: 'line' },
  style: { border: { fg: theme.muted } },
  label: ' Recent Activity ',
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  tags: true
});

// Footer
const footer = blessed.box({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 3,
  border: { type: 'line' },
  style: { 
    border: { fg: theme.border },
    fg: theme.muted
  },
  content: ' [↑↓] Navigate | [Enter] Select | [q] Quit | [?] Help',
  align: 'center'
});

// Add all elements to screen
screen.append(header);
screen.append(sidebar);
screen.append(content);
screen.append(footer);

// Initial activity
const activities = [
  `{${theme.success}-fg}✓{/} 2m ago - You: Generated DataTable component`,
  `{${theme.secondary}-fg}•{/} 15m ago - Alice: Updated FormBuilder template`,
  `{${theme.warning}-fg}⚠{/} 1h ago - System: AI model updated to GPT-4`,
  `{${theme.success}-fg}✓{/} 2h ago - Bob: Published Calendar component`
];

activities.forEach(activity => {
  activityBox.log(activity);
});

// Handle sidebar selection
sidebar.on('select', (item, index) => {
  const views = ['Dashboard', 'Generate', 'Catalog', 'Analytics', 'Settings'];
  content.setLabel(` ${views[index]} `);
  
  // Update sidebar items to show selection
  const items = views.map((view, i) => 
    i === index ? `> ${view}` : `  ${view}`
  );
  sidebar.setItems(items);
  
  // Update content based on selection
  switch(index) {
    case 0: // Dashboard
      statsBox.show();
      activityBox.show();
      break;
    case 1: // Generate
      statsBox.hide();
      activityBox.hide();
      content.setContent('\n  Component Generator\n\n  Press Enter to start generating a component...');
      break;
    case 2: // Catalog
      statsBox.hide();
      activityBox.hide();
      content.setContent('\n  Component Catalog\n\n  Browse available components...');
      break;
    case 3: // Analytics
      statsBox.hide();
      activityBox.hide();
      content.setContent('\n  Analytics & Insights\n\n  View performance metrics...');
      break;
    case 4: // Settings
      statsBox.hide();
      activityBox.hide();
      content.setContent('\n  Settings\n\n  Configure your preferences...');
      break;
  }
  
  screen.render();
});

// Keyboard shortcuts
screen.key(['q', 'C-c'], () => {
  process.exit(0);
});

screen.key(['?'], () => {
  const helpBox = blessed.message({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    border: { type: 'line' },
    style: { 
      border: { fg: theme.accent },
      fg: theme.primary
    },
    label: ' Help ',
    content: `
Keyboard Shortcuts:

↑/↓ or j/k  - Navigate menu
Enter       - Select item
q           - Quit
?           - Show this help
t           - Change theme
r           - Refresh

Navigation:
d - Dashboard
g - Generate Component
c - Component Catalog
a - Analytics
s - Settings`,
    align: 'left'
  });
  
  helpBox.display('', 0, () => {
    screen.render();
  });
});

// Quick navigation
screen.key(['d'], () => sidebar.select(0));
screen.key(['g'], () => sidebar.select(1));
screen.key(['c'], () => sidebar.select(2));
screen.key(['a'], () => sidebar.select(3));
screen.key(['s'], () => sidebar.select(4));

// Focus sidebar
sidebar.focus();

// Render screen
screen.render();

// Log startup
const time = new Date().toLocaleTimeString();
activityBox.log(`{${theme.muted}-fg}[${time}] Terminal UI started successfully{/}`);

console.log('Elegant UI is running. Press q to quit.');