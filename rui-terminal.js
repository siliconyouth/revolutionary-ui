#!/usr/bin/env node

/**
 * Revolutionary UI Terminal CLI
 * Simple, working implementation
 */

const blessed = require('blessed');
const React = require('react');
const { render } = require('react-blessed');

// Set environment
process.env.TERM = 'xterm';
process.env.NCURSES_NO_UTF8_ACS = '1';

// Simple Terminal App Component
const TerminalApp = ({ screen }) => {
  const [view, setView] = React.useState('main');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [logs, setLogs] = React.useState(['Welcome to Revolutionary UI!']);
  
  const menuItems = [
    'Generate Component',
    'Browse Catalog', 
    'Settings',
    'Exit'
  ];
  
  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-20));
  };
  
  React.useEffect(() => {
    const handleKey = (ch, key) => {
      if (!key) return;
      
      if (view === 'main') {
        if (key.name === 'up') {
          setSelectedIndex(prev => Math.max(0, prev - 1));
        } else if (key.name === 'down') {
          setSelectedIndex(prev => Math.min(menuItems.length - 1, prev + 1));
        } else if (key.name === 'return') {
          if (selectedIndex === menuItems.length - 1) {
            process.exit(0);
          }
          addLog(`Selected: ${menuItems[selectedIndex]}`);
          if (selectedIndex === 0) setView('generate');
          else if (selectedIndex === 1) setView('catalog');
        }
      } else {
        if (key.name === 'escape') {
          setView('main');
          addLog('Back to main menu');
        }
      }
    };
    
    screen.on('keypress', handleKey);
    return () => screen.off('keypress', handleKey);
  }, [view, selectedIndex]);
  
  return React.createElement(React.Fragment, null,
    // Header
    React.createElement('box', {
      top: 0,
      left: 0,
      width: '100%',
      height: 4,
      border: { type: 'line' },
      style: { border: { fg: 'cyan' } },
      content: '{center}Revolutionary UI - Terminal Mode{/center}\n{center}AI-Powered Component Generation{/center}',
      tags: true
    }),
    
    // Main content
    view === 'main' ? [
      // Menu
      React.createElement('list', {
        key: 'menu',
        top: 4,
        left: 0,
        width: '50%',
        height: '70%',
        border: { type: 'line' },
        style: {
          border: { fg: 'cyan' },
          selected: { bg: 'blue', fg: 'white' }
        },
        label: ' Main Menu ',
        items: menuItems,
        selected: selectedIndex,
        interactive: true,
        keys: true,
        mouse: true
      }),
      
      // Logs
      React.createElement('box', {
        key: 'logs',
        top: 4,
        left: '50%',
        width: '50%',
        height: '70%',
        border: { type: 'line' },
        style: { border: { fg: 'cyan' } },
        label: ' Activity Log ',
        content: logs.join('\n'),
        scrollable: true
      })
    ] : React.createElement('box', {
      top: 4,
      left: 0,
      width: '100%',
      height: '70%',
      border: { type: 'line' },
      style: { border: { fg: 'cyan' } },
      label: ` ${view} `,
      content: `{center}${view} view{/center}\n\n{center}Press ESC to go back{/center}`,
      tags: true
    }),
    
    // Status bar
    React.createElement('box', {
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      border: { type: 'line' },
      style: { border: { fg: 'cyan' } },
      content: '{center}↑↓: Navigate | Enter: Select | ESC: Back | Ctrl-C: Exit{/center}',
      tags: true
    })
  );
};

// Main function
function main() {
  console.clear();
  
  // Create screen
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Revolutionary UI',
    warnings: false
  });
  
  // Exit handler
  screen.key(['C-c', 'q'], () => process.exit(0));
  
  // Render app
  render(React.createElement(TerminalApp, { screen }), screen);
  
  // Initial render
  screen.render();
}

// Handle command line
if (process.argv.length > 2 && process.argv[2] === '--help') {
  console.log('Revolutionary UI Terminal CLI');
  console.log('Usage: rui-terminal');
  console.log('');
  console.log('A clean Terminal UI for AI-powered component generation');
  process.exit(0);
}

// Start the app
main();