#!/usr/bin/env node

/**
 * Revolutionary UI Terminal Application
 * Following react-blessed best practices
 */

const React = require('react');
const blessed = require('blessed');
const { render } = require('react-blessed');

// Main App Component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'main',
      selectedIndex: 0,
      logs: ['Welcome to Revolutionary UI!', 'Terminal UI initialized'],
      loading: false,
      progress: 0
    };
  }

  componentDidMount() {
    // Set up key handlers after mount
    this.setupKeyHandlers();
  }

  setupKeyHandlers() {
    const { screen } = this.props;
    
    screen.key(['up', 'k'], () => {
      if (this.state.view === 'main') {
        this.setState(prev => ({
          selectedIndex: Math.max(0, prev.selectedIndex - 1)
        }));
      }
    });

    screen.key(['down', 'j'], () => {
      if (this.state.view === 'main') {
        const maxIndex = this.getMenuItems().length - 1;
        this.setState(prev => ({
          selectedIndex: Math.min(maxIndex, prev.selectedIndex + 1)
        }));
      }
    });

    screen.key(['enter', 'return'], () => {
      if (this.state.view === 'main') {
        this.handleMenuSelect(this.state.selectedIndex);
      }
    });

    screen.key(['escape', 'q'], () => {
      if (this.state.view !== 'main') {
        this.setState({ view: 'main' });
        this.addLog('Returned to main menu');
      } else {
        process.exit(0);
      }
    });
  }

  getMenuItems() {
    return [
      '🚀 Generate Component',
      '📊 Browse Catalog',
      '⚙️  Settings',
      '📈 Analytics',
      '❌ Exit'
    ];
  }

  handleMenuSelect(index) {
    const items = this.getMenuItems();
    const item = items[index];
    
    this.addLog(`Selected: ${item}`);

    switch (index) {
      case 0:
        this.setState({ view: 'generate' });
        break;
      case 1:
        this.setState({ view: 'catalog' });
        break;
      case 2:
        this.setState({ view: 'settings' });
        break;
      case 3:
        this.setState({ view: 'analytics' });
        break;
      case 4:
        process.exit(0);
        break;
    }
  }

  addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.setState(prev => ({
      logs: [...prev.logs, `[${timestamp}] ${message}`].slice(-30)
    }));
  }

  renderMainView() {
    const items = this.getMenuItems();
    
    return [
      React.createElement('list', {
        key: 'menu',
        ref: 'menuList',
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
        items: items,
        selected: this.state.selectedIndex,
        interactive: false,  // We handle keys manually
        mouse: true
      }),
      
      React.createElement('box', {
        key: 'logs',
        top: 4,
        left: '50%',
        width: '50%',
        height: '70%',
        border: { type: 'line' },
        style: { border: { fg: 'cyan' } },
        label: ' Activity Log ',
        scrollable: true,
        alwaysScroll: true,
        content: this.state.logs.join('\n')
      })
    ];
  }

  renderGenerateView() {
    return React.createElement('box', {
      top: 4,
      left: 0,
      width: '100%',
      height: '70%',
      border: { type: 'line' },
      style: { border: { fg: 'cyan' } },
      label: ' Component Generator ',
      content: [
        '{center}AI-Powered Component Generation{/center}',
        '',
        '1. Enter component name',
        '2. Select component type',
        '3. Choose framework',
        '4. Describe features',
        '5. Generate with AI',
        '',
        '{center}Press ESC to go back{/center}'
      ].join('\n'),
      tags: true
    });
  }

  renderCatalogView() {
    return React.createElement('box', {
      top: 4,
      left: 0,
      width: '100%',
      height: '70%',
      border: { type: 'line' },
      style: { border: { fg: 'cyan' } },
      label: ' Component Catalog ',
      content: [
        'Browse available components:',
        '',
        '• Form Components',
        '• Table Components',
        '• Navigation Components',
        '• Chart Components',
        '• Modal Components',
        '',
        '{center}Press ESC to go back{/center}'
      ].join('\n'),
      tags: true
    });
  }

  renderView() {
    switch (this.state.view) {
      case 'main':
        return this.renderMainView();
      case 'generate':
        return this.renderGenerateView();
      case 'catalog':
        return this.renderCatalogView();
      default:
        return React.createElement('box', {
          top: 4,
          left: 0,
          width: '100%',
          height: '70%',
          border: { type: 'line' },
          style: { border: { fg: 'cyan' } },
          label: ` ${this.state.view} `,
          content: `{center}${this.state.view} view{/center}\n\n{center}Press ESC to go back{/center}`,
          tags: true
        });
    }
  }

  render() {
    return React.createElement(React.Fragment, null,
      // Header
      React.createElement('box', {
        top: 0,
        left: 0,
        width: '100%',
        height: 4,
        border: { type: 'line' },
        style: { 
          border: { fg: 'cyan' },
          bg: 'black'
        },
        label: ' Revolutionary UI v3.4.1 ',
        content: '{center}AI-Powered Component Generation{/center}\n{center}60-95% Code Reduction{/center}',
        tags: true
      }),

      // Main content area
      ...Array.isArray(this.renderView()) ? this.renderView() : [this.renderView()],

      // Status bar
      React.createElement('box', {
        bottom: 0,
        left: 0,
        width: '100%',
        height: 3,
        border: { type: 'line' },
        style: { border: { fg: 'cyan' } },
        content: this.state.view === 'main' 
          ? '{center}↑↓/jk: Navigate | Enter: Select | q: Quit{/center}'
          : '{center}ESC/q: Back | ↑↓: Navigate{/center}',
        tags: true
      })
    );
  }
}

// Main function
function main() {
  // Create blessed screen
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Revolutionary UI - Terminal Mode',
    fullUnicode: true,
    warnings: false
  });

  // Global exit handler
  screen.key(['C-c'], () => {
    process.exit(0);
  });

  // Render the app
  const component = render(React.createElement(App, { screen }), screen);
}

// Handle command line arguments
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Revolutionary UI Terminal Application');
    console.log('');
    console.log('Usage: ./terminal-ui-app.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  -h, --help     Show this help message');
    console.log('  --version      Show version');
    console.log('');
    console.log('Navigation:');
    console.log('  ↑/↓ or j/k     Navigate menu');
    console.log('  Enter          Select item');
    console.log('  ESC or q       Go back / Exit');
    console.log('  Ctrl+C         Force exit');
    process.exit(0);
  }

  if (process.argv.includes('--version')) {
    console.log('Revolutionary UI v3.4.1');
    process.exit(0);
  }

  // Clear screen and start
  console.clear();
  main();
}

module.exports = { App, main };