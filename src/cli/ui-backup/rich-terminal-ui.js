#!/usr/bin/env node

/**
 * Rich Terminal UI for Revolutionary UI
 * Features advanced widgets, charts, and emoji support
 */

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const React = require('react');
const { render } = require('react-blessed');
// const nodeEmoji = require('node-emoji'); // Removed to avoid complexity

// Check terminal emoji support
function supportsEmoji() {
  // Check if we're in a terminal that likely supports emoji
  const term = process.env.TERM || '';
  const colorTerm = process.env.COLORTERM || '';
  const termProgram = process.env.TERM_PROGRAM || '';
  
  // Known good terminals
  if (termProgram === 'iTerm.app' || termProgram === 'Apple_Terminal') return true;
  if (termProgram === 'vscode') return true;
  if (colorTerm === 'truecolor' || colorTerm === '24bit') return true;
  if (term.includes('256color')) return true;
  
  // Force with environment variable
  if (process.env.FORCE_EMOJI === 'true') return true;
  
  return false;
}

// Enhanced App Component with Rich Widgets
class RichTerminalUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView: 'dashboard',
      menuIndex: 0,
      useEmoji: supportsEmoji(),
      // Data for charts
      lineData: {
        title: 'Code Reduction Over Time',
        x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        y: [45, 52, 48, 65, 71, 68, 75]
      },
      barData: {
        titles: ['React', 'Vue', 'Angular', 'Svelte'],
        data: [156, 98, 67, 45]
      },
      gaugePercent: 0.75,
      sparklineData: [1, 2, 5, 3, 4, 8, 6, 7, 9, 8, 10, 12, 15],
      tableData: {
        headers: ['Component', 'Framework', 'Lines Saved', 'Efficiency'],
        data: [
          ['DataTable', 'React', '2,450', '82%'],
          ['FormBuilder', 'Vue', '1,890', '75%'],
          ['Dashboard', 'React', '3,200', '91%'],
          ['Calendar', 'Angular', '1,560', '68%'],
          ['KanbanBoard', 'React', '2,100', '79%']
        ]
      },
      logs: [],
      isLoading: false
    };
    
    this.updateInterval = null;
  }

  componentDidMount() {
    const { screen } = this.props;
    this.setupKeyHandlers(screen);
    this.startDataUpdates();
    this.addLog('Welcome to Revolutionary UI Rich Terminal Dashboard');
    this.addLog('Press ? for help, q to quit');
  }

  componentWillUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  setupKeyHandlers(screen) {
    // Navigation
    screen.key(['escape'], () => {
      if (this.state.currentView !== 'dashboard') {
        this.setState({ currentView: 'dashboard' });
      }
    });

    screen.key(['q', 'C-c'], () => {
      this.cleanup();
      process.exit(0);
    });

    // View shortcuts
    screen.key(['d'], () => this.setState({ currentView: 'dashboard' }));
    screen.key(['g'], () => this.setState({ currentView: 'generate' }));
    screen.key(['c'], () => this.setState({ currentView: 'catalog' }));
    screen.key(['a'], () => this.setState({ currentView: 'analytics' }));
    screen.key(['s'], () => this.setState({ currentView: 'settings' }));
    screen.key(['?', 'h'], () => this.showHelp());

    // Menu navigation
    screen.key(['up', 'k'], () => {
      this.setState(prev => ({
        menuIndex: Math.max(0, prev.menuIndex - 1)
      }));
    });

    screen.key(['down', 'j'], () => {
      this.setState(prev => ({
        menuIndex: Math.min(5, prev.menuIndex + 1)
      }));
    });

    screen.key(['enter', 'space'], () => {
      this.handleMenuSelect();
    });
  }

  getEmoji(name, fallback) {
    if (!this.state.useEmoji) return fallback;
    // Simple emoji mapping
    const emojis = {
      'chart_with_upwards_trend': '📈',
      'bar_chart': '📊',
      'speedometer': '🏃',
      'zap': '⚡',
      'clipboard': '📋',
      'scroll': '📜',
      'factory': '🏭',
      'books': '📚',
      'gear': '⚙️',
      'door': '🚪'
    };
    return emojis[name] || fallback;
  }

  startDataUpdates() {
    // Simulate real-time data updates
    this.updateInterval = setInterval(() => {
      // Update sparkline
      const newSparkData = [...this.state.sparklineData.slice(1)];
      newSparkData.push(Math.floor(Math.random() * 15) + 5);
      
      // Update gauge
      const newGauge = Math.min(1, Math.max(0, this.state.gaugePercent + (Math.random() - 0.5) * 0.1));
      
      // Update line chart
      const newY = this.state.lineData.y.map(v => 
        Math.max(30, Math.min(90, v + (Math.random() - 0.5) * 10))
      );
      
      this.setState({
        sparklineData: newSparkData,
        gaugePercent: newGauge,
        lineData: { ...this.state.lineData, y: newY }
      });
    }, 2000);
  }

  addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.setState(prev => ({
      logs: [...prev.logs, `[${timestamp}] ${message}`].slice(-10)
    }));
  }

  showHelp() {
    this.addLog('=== Keyboard Shortcuts ===');
    this.addLog('d - Dashboard | g - Generate | c - Catalog');
    this.addLog('a - Analytics | s - Settings | ? - Help');
    this.addLog('↑/↓ or j/k - Navigate | Enter - Select');
    this.addLog('ESC - Back | q - Quit');
  }

  handleMenuSelect() {
    const menuItems = ['dashboard', 'generate', 'catalog', 'analytics', 'settings', 'exit'];
    const selected = menuItems[this.state.menuIndex];
    
    if (selected === 'exit') {
      this.cleanup();
      process.exit(0);
    } else {
      this.setState({ currentView: selected });
      this.addLog(`Switched to ${selected} view`);
    }
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.addLog('Goodbye!');
  }

  renderDashboard() {
    // For react-blessed, we need to create widgets without contrib.grid
    return React.createElement('box', {
      width: '100%',
      height: '100%'
    }, [
      // Line Chart - Code Reduction Trend
      React.createElement('box', {
        key: 'line-container',
        top: 0,
        left: 0,
        width: '50%',
        height: '40%',
        border: { type: 'line' },
        style: { border: { fg: 'cyan' } },
        label: ` ${this.getEmoji('chart_with_upwards_trend', '[/]')} Code Reduction Trend `
      }, React.createElement('text', {
        content: `Efficiency: ${Math.round(Math.max(...this.state.lineData.y))}%\n\n` +
                 this.state.lineData.y.map((val, i) => 
                   `${this.state.lineData.x[i]}: ${'█'.repeat(Math.floor(val/5))} ${val}%`
                 ).join('\n')
      })),

      // Bar Chart - Framework Usage
      React.createElement('box', {
        key: 'bar-container',
        top: 0,
        left: '50%',
        width: '50%',
        height: '40%',
        border: { type: 'line' },
        style: { border: { fg: 'green' } },
        label: ` ${this.getEmoji('bar_chart', '[|]')} Framework Usage `
      }, React.createElement('text', {
        content: this.state.barData.titles.map((title, i) => 
          `${title}: ${'▓'.repeat(Math.floor(this.state.barData.data[i]/10))} ${this.state.barData.data[i]}`
        ).join('\n')
      })),

      // Gauge - Efficiency Meter
      React.createElement('box', {
        key: 'gauge-container',
        top: '40%',
        left: 0,
        width: '25%',
        height: '30%',
        border: { type: 'line' },
        style: { border: { fg: 'yellow' } },
        label: ` ${this.getEmoji('speedometer', '[O]')} Efficiency `,
        align: 'center',
        valign: 'middle'
      }, React.createElement('text', {
        content: `${Math.round(this.state.gaugePercent * 100)}%\n` +
                 `[${'█'.repeat(Math.floor(this.state.gaugePercent * 10))}${' '.repeat(10 - Math.floor(this.state.gaugePercent * 10))}]`
      })),

      // Sparkline - Activity
      React.createElement('box', {
        key: 'sparkline-container',
        top: '40%',
        left: '25%',
        width: '75%',
        height: '30%',
        border: { type: 'line' },
        style: { border: { fg: 'blue' } },
        label: ` ${this.getEmoji('zap', '[~]')} Real-time Activity `
      }, React.createElement('text', {
        content: 'Activity: ' + this.state.sparklineData.map(v => {
          if (v < 5) return '▁';
          if (v < 10) return '▃';
          if (v < 15) return '▅';
          return '▇';
        }).join('')
      })),

      // Table - Recent Components
      React.createElement('box', {
        key: 'table-container',
        top: '70%',
        left: 0,
        width: '60%',
        height: '30%',
        border: { type: 'line' },
        style: { border: { fg: 'magenta' } },
        label: ` ${this.getEmoji('clipboard', '[=]')} Recent Components `,
        scrollable: true,
        alwaysScroll: true
      }, React.createElement('text', {
        content: [this.state.tableData.headers.join(' | ')]
          .concat(this.state.tableData.data.map(row => row.join(' | ')))
          .join('\n')
      })),

      // Log - Activity Feed
      React.createElement('box', {
        key: 'log-container',
        top: '70%',
        left: '60%',
        width: '40%',
        height: '30%',
        border: { type: 'line' },
        style: { border: { fg: 'green' } },
        label: ` ${this.getEmoji('scroll', '[~]')} Activity Log `,
        scrollable: true,
        alwaysScroll: true
      }, React.createElement('text', {
        content: this.state.logs.join('\n')
      }))
    ]);
  }

  renderGenerateView() {
    return React.createElement('box', {
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: { type: 'line' },
      style: {
        border: { fg: 'green' },
        label: { fg: 'white', bold: true }
      },
      label: ` ${this.getEmoji('factory', '[+]')} Component Generator `
    }, [
      React.createElement('form', {
        key: 'generate-form',
        top: 1,
        left: 1,
        width: '50%',
        height: '100%-2',
        keys: true,
        vi: true
      }, [
        React.createElement('text', {
          key: 'title',
          top: 0,
          content: 'Generate New Component',
          style: { fg: 'yellow', bold: true }
        }),
        React.createElement('textbox', {
          key: 'name-input',
          top: 2,
          height: 3,
          label: ' Component Name ',
          border: { type: 'line' },
          style: { border: { fg: 'cyan' } },
          inputOnFocus: true
        }),
        React.createElement('radioset', {
          key: 'framework-radio',
          top: 6,
          height: 5,
          label: ' Framework ',
          border: { type: 'line' },
          style: { border: { fg: 'cyan' } }
        }),
        React.createElement('checkbox', {
          key: 'typescript-check',
          top: 12,
          content: 'Use TypeScript',
          checked: true
        }),
        React.createElement('button', {
          key: 'generate-button',
          top: 15,
          height: 3,
          width: 20,
          content: 'Generate',
          align: 'center',
          style: {
            bg: 'green',
            fg: 'white',
            focus: { bg: 'cyan' }
          }
        })
      ]),
      React.createElement('box', {
        key: 'preview',
        top: 1,
        left: '50%',
        width: '50%-1',
        height: '100%-2',
        label: ' Preview ',
        border: { type: 'line' },
        style: { border: { fg: 'magenta' } },
        scrollable: true,
        alwaysScroll: true,
        content: 'Component preview will appear here...'
      })
    ]);
  }

  renderMenu() {
    const menuItems = [
      { icon: this.getEmoji('chart_with_upwards_trend', '[/]'), label: 'Dashboard', value: 'dashboard' },
      { icon: this.getEmoji('factory', '[+]'), label: 'Generate', value: 'generate' },
      { icon: this.getEmoji('books', '[#]'), label: 'Catalog', value: 'catalog' },
      { icon: this.getEmoji('bar_chart', '[%]'), label: 'Analytics', value: 'analytics' },
      { icon: this.getEmoji('gear', '[~]'), label: 'Settings', value: 'settings' },
      { icon: this.getEmoji('door', '[X]'), label: 'Exit', value: 'exit' }
    ];

    return React.createElement('box', {
      key: 'menu-box',
      top: 0,
      left: 0,
      width: 20,
      height: '100%',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        label: { fg: 'white', bold: true }
      },
      label: ' Menu '
    }, menuItems.map((item, index) => {
      const selected = index === this.state.menuIndex;
      const prefix = selected ? '▶' : ' ';
      const style = selected ? { fg: 'cyan', bold: true } : { fg: 'white' };
      
      return React.createElement('text', {
        key: item.value,
        top: index * 2 + 1,
        left: 1,
        content: `${prefix} ${item.icon} ${item.label}`,
        style: style
      });
    }));
  }

  render() {
    const { currentView } = this.state;
    const elements = [];

    // Always render menu on the left with key
    const menu = this.renderMenu();
    elements.push(React.createElement(menu.type, { ...menu.props, key: 'menu' }));

    // Main content area
    const contentBox = React.createElement('box', {
      key: 'content',
      top: 0,
      left: 20,
      width: '100%-20',
      height: '100%'
    }, currentView === 'dashboard' ? this.renderDashboard() : 
       currentView === 'generate' ? this.renderGenerateView() :
       React.createElement('box', {
         key: 'placeholder',
         width: '100%',
         height: '100%',
         border: { type: 'line' },
         content: `${currentView.toUpperCase()} view - Coming soon!`,
         valign: 'middle',
         align: 'center'
       }));

    elements.push(contentBox);

    return React.createElement(React.Fragment, null, elements);
  }
}

// Main function
function main() {
  try {
    // Create screen with enhanced settings
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Revolutionary UI - Rich Terminal Dashboard',
      fullUnicode: supportsEmoji(),
      dockBorders: true,
      warnings: false,
      terminal: 'xterm',  // Use basic xterm to avoid compatibility issues
      forceUnicode: supportsEmoji()
    });

    // Show loading message
    const loadingBox = blessed.box({
      top: 'center',
      left: 'center',
      width: 40,
      height: 5,
      border: { type: 'line' },
      content: 'Loading Rich Terminal UI...',
      align: 'center',
      valign: 'middle'
    });
    
    screen.append(loadingBox);
    screen.render();

    // Small delay for effect
    setTimeout(() => {
      screen.remove(loadingBox);
      
      // Render the app
      const component = render(React.createElement(RichTerminalUI, { screen }), screen);
      
      // Handle graceful exit
      process.on('SIGINT', () => {
        process.exit(0);
      });
    }, 500);
    
  } catch (error) {
    console.error('Failed to start Rich Terminal UI:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Revolutionary UI - Rich Terminal Dashboard');
    console.log('');
    console.log('Features:');
    console.log('  - Real-time charts and graphs');
    console.log('  - Interactive widgets');
    console.log('  - Emoji support (when available)');
    console.log('  - Keyboard navigation');
    console.log('');
    console.log('Usage: node rich-terminal-ui.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  -h, --help     Show this help');
    console.log('  --version      Show version');
    console.log('');
    console.log('Environment:');
    console.log('  FORCE_EMOJI=true   Force emoji display');
    process.exit(0);
  }
  
  if (process.argv.includes('--version')) {
    console.log('Revolutionary UI v3.4.1 - Rich Terminal');
    process.exit(0);
  }
  
  // Check if blessed-contrib is available
  try {
    require('blessed-contrib');
  } catch (e) {
    console.error('Error: blessed-contrib is required but not installed');
    console.error('Run: npm install blessed-contrib');
    process.exit(1);
  }
  
  // Check if node-emoji is available
  try {
    require('node-emoji');
  } catch (e) {
    console.error('Error: node-emoji is required but not installed');
    console.error('Run: npm install node-emoji');
    process.exit(1);
  }
  
  main();
}

module.exports = { RichTerminalUI, main };