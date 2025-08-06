#!/usr/bin/env node

/**
 * Simple Terminal UI for Revolutionary UI
 * Minimal blessed implementation to avoid compatibility issues
 */

const blessed = require('blessed');
const React = require('react');
const { render } = require('react-blessed');

// Simple App Component
class SimpleApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0
    };
  }

  componentDidMount() {
    const { screen } = this.props;
    
    // Basic key handlers
    screen.key(['escape', 'q', 'C-c'], () => {
      process.exit(0);
    });

    screen.key(['up'], () => {
      this.setState(prev => ({
        selectedIndex: Math.max(0, prev.selectedIndex - 1)
      }));
    });

    screen.key(['down'], () => {
      this.setState(prev => ({
        selectedIndex: Math.min(4, prev.selectedIndex + 1)
      }));
    });

    screen.key(['enter'], () => {
      if (this.state.selectedIndex === 4) {
        process.exit(0);
      }
    });
  }

  render() {
    const items = [
      'Generate Component',
      'Browse Catalog', 
      'AI Assistant',
      'Settings',
      'Exit'
    ];

    return React.createElement('box', {
      top: 'center',
      left: 'center',
      width: '80%',
      height: '80%',
      border: { type: 'line' },
      style: { border: { fg: 'cyan' } },
      label: ' Revolutionary UI Terminal ',
      children: [
        React.createElement('text', {
          top: 1,
          left: 'center',
          content: 'AI-Powered Component Generation',
          style: { fg: 'cyan' }
        }),
        React.createElement('list', {
          top: 3,
          left: 2,
          width: '100%-4',
          height: '70%',
          items: items.map((item, i) => 
            i === this.state.selectedIndex ? `> ${item}` : `  ${item}`
          ),
          style: {
            fg: 'white',
            selected: { fg: 'cyan' }
          },
          interactive: false
        }),
        React.createElement('text', {
          bottom: 1,
          left: 'center',
          content: 'Use ↑↓ to navigate, Enter to select, q to quit',
          style: { fg: 'gray' }
        })
      ]
    });
  }
}

// Main function
function main() {
  // Create screen with minimal options
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Revolutionary UI'
  });

  // Render app
  render(React.createElement(SimpleApp, { screen }), screen);
}

// Run
if (require.main === module) {
  main();
}

module.exports = { SimpleApp, main };