#!/usr/bin/env node

/**
 * Simple Rich Terminal UI for Revolutionary UI
 * Uses basic blessed widgets with rich visualization
 */

const blessed = require('blessed');
const React = require('react');
const { render } = require('react-blessed');

// Simple Rich UI Component
class SimpleRichUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView: 'dashboard',
      menuIndex: 0,
      // Chart data
      efficiency: [65, 70, 68, 75, 72, 78, 82],
      frameworks: {
        React: 156,
        Vue: 98,
        Angular: 67,
        Svelte: 45
      },
      activity: [],
      logs: [],
      components: [
        { name: 'DataTable', framework: 'React', stars: 5, downloads: '15.4k' },
        { name: 'FormBuilder', framework: 'Vue', stars: 4, downloads: '8.9k' },
        { name: 'Dashboard', framework: 'React', stars: 5, downloads: '12.6k' },
        { name: 'Calendar', framework: 'Angular', stars: 4, downloads: '6.7k' }
      ]
    };
    
    this.updateInterval = null;
  }

  componentDidMount() {
    const { screen } = this.props;
    this.setupKeyHandlers(screen);
    this.startUpdates();
    this.log('Welcome to Revolutionary UI Dashboard');
    this.log('Press ? for help');
  }

  componentWillUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  setupKeyHandlers(screen) {
    screen.key(['escape'], () => {
      this.setState({ currentView: 'dashboard' });
    });

    screen.key(['q', 'C-c'], () => {
      this.cleanup();
      process.exit(0);
    });

    screen.key(['up', 'k'], () => {
      this.setState(prev => ({
        menuIndex: Math.max(0, prev.menuIndex - 1)
      }));
    });

    screen.key(['down', 'j'], () => {
      this.setState(prev => ({
        menuIndex: Math.min(4, prev.menuIndex + 1)
      }));
    });

    screen.key(['enter'], () => {
      const views = ['dashboard', 'generate', 'catalog', 'analytics', 'exit'];
      const selected = views[this.state.menuIndex];
      
      if (selected === 'exit') {
        this.cleanup();
        process.exit(0);
      } else {
        this.setState({ currentView: selected });
        this.log(`Switched to ${selected}`);
      }
    });

    screen.key(['?', 'h'], () => {
      this.log('=== Help ===');
      this.log('↑/↓ - Navigate menu');
      this.log('Enter - Select');
      this.log('ESC - Back to dashboard');
      this.log('q - Quit');
    });
  }

  startUpdates() {
    // Generate random activity
    this.updateInterval = setInterval(() => {
      // Update activity sparkline
      const newActivity = [...this.state.activity, Math.floor(Math.random() * 10)].slice(-20);
      
      // Update efficiency
      const newEfficiency = [...this.state.efficiency.slice(1), 
        Math.min(100, Math.max(50, this.state.efficiency[6] + (Math.random() - 0.5) * 10))
      ];
      
      this.setState({
        activity: newActivity,
        efficiency: newEfficiency
      });
    }, 2000);
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.setState(prev => ({
      logs: [...prev.logs, `[${timestamp}] ${message}`].slice(-15)
    }));
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.log('Goodbye!');
  }

  renderChart(data, width, height, color = 'cyan') {
    const max = Math.max(...data);
    const normalized = data.map(v => Math.floor((v / max) * height));
    
    let chart = '';
    for (let row = height; row > 0; row--) {
      let line = '';
      for (let col = 0; col < data.length; col++) {
        if (normalized[col] >= row) {
          line += '█ ';
        } else {
          line += '  ';
        }
      }
      chart += line + '\n';
    }
    
    return chart;
  }

  renderSparkline(data) {
    const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const max = Math.max(...data, 1);
    return data.map(v => chars[Math.floor((v / max) * 7)]).join('');
  }

  renderProgressBar(value, max, width = 20) {
    const filled = Math.floor((value / max) * width);
    return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
  }

  renderDashboard() {
    const { efficiency, frameworks, activity, components } = this.state;
    
    return React.createElement('box', {
      width: '100%',
      height: '100%'
    }, [
      // Efficiency Chart
      React.createElement('box', {
        key: 'efficiency',
        top: 0,
        left: 0,
        width: '50%',
        height: '40%',
        border: { type: 'line' },
        style: { border: { fg: 'cyan' } },
        label: ' Code Efficiency Trend '
      }, React.createElement('text', {
        content: 'Last 7 days:\n\n' + 
                this.renderChart(efficiency, 7, 8) + '\n' +
                'Current: ' + efficiency[6] + '%'
      })),

      // Framework Usage
      React.createElement('box', {
        key: 'frameworks',
        top: 0,
        left: '50%',
        width: '50%',
        height: '40%',
        border: { type: 'line' },
        style: { border: { fg: 'green' } },
        label: ' Framework Usage '
      }, React.createElement('text', {
        content: Object.entries(frameworks).map(([name, count]) => 
          `${name.padEnd(10)} ${this.renderProgressBar(count, 200)} ${count}`
        ).join('\n')
      })),

      // Activity Monitor
      React.createElement('box', {
        key: 'activity',
        top: '40%',
        left: 0,
        width: '100%',
        height: '20%',
        border: { type: 'line' },
        style: { border: { fg: 'yellow' } },
        label: ' Real-time Activity '
      }, React.createElement('text', {
        content: '\nActivity: ' + this.renderSparkline(activity) + '\n' +
                 'Components Generated: 1,247 | Lines Saved: 48,392 | Users: 892'
      })),

      // Component List
      React.createElement('box', {
        key: 'components',
        top: '60%',
        left: 0,
        width: '60%',
        height: '40%',
        border: { type: 'line' },
        style: { border: { fg: 'magenta' } },
        label: ' Recent Components ',
        scrollable: true
      }, React.createElement('text', {
        content: 'Name         Framework  Rating  Downloads\n' +
                 '─'.repeat(40) + '\n' +
                 components.map(c => 
                   `${c.name.padEnd(12)} ${c.framework.padEnd(10)} ${'★'.repeat(c.stars)} ${c.downloads}`
                 ).join('\n')
      })),

      // Activity Log
      React.createElement('box', {
        key: 'logs',
        top: '60%',
        left: '60%',
        width: '40%',
        height: '40%',
        border: { type: 'line' },
        style: { border: { fg: 'blue' } },
        label: ' Activity Log ',
        scrollable: true,
        alwaysScroll: true
      }, React.createElement('text', {
        content: this.state.logs.join('\n')
      }))
    ]);
  }

  renderMenu() {
    const items = ['Dashboard', 'Generate', 'Catalog', 'Analytics', 'Exit'];
    
    return React.createElement('box', {
      top: 0,
      left: 0,
      width: 20,
      height: '100%',
      border: { type: 'line' },
      style: { border: { fg: 'white' } },
      label: ' Menu '
    }, items.map((item, index) => {
      const selected = index === this.state.menuIndex;
      return React.createElement('text', {
        key: item,
        top: index * 2 + 1,
        left: 1,
        content: (selected ? '▶ ' : '  ') + item,
        style: { fg: selected ? 'cyan' : 'white', bold: selected }
      });
    }));
  }

  renderAnalytics() {
    return React.createElement('box', {
      width: '100%',
      height: '100%'
    }, [
      React.createElement('box', {
        key: 'stats',
        top: 0,
        left: 0,
        width: '50%',
        height: '50%',
        border: { type: 'line' },
        style: { border: { fg: 'yellow' } },
        label: ' Overall Statistics '
      }, React.createElement('text', {
        content: '\nTotal Components Generated: 1,247\n' +
                 'Total Lines of Code Saved: 48,392\n' +
                 'Average Efficiency Rate: 87.5%\n' +
                 'Active Users: 892\n' +
                 'Most Used Framework: React (45%)\n' +
                 'Average Generation Time: 2.3s'
      })),
      
      React.createElement('box', {
        key: 'monthly',
        top: 0,
        left: '50%',
        width: '50%',
        height: '50%',
        border: { type: 'line' },
        style: { border: { fg: 'green' } },
        label: ' This Month '
      }, React.createElement('text', {
        content: '\nComponents: +234 (↑23%)\n' +
                 'New Users: +45 (↑15%)\n' +
                 'Code Saved: 8,456 lines\n' +
                 'Top Component: DataTable\n' +
                 'Revenue: $4,567'
      })),
      
      React.createElement('box', {
        key: 'performance',
        top: '50%',
        left: 0,
        width: '100%',
        height: '50%',
        border: { type: 'line' },
        style: { border: { fg: 'cyan' } },
        label: ' Performance Metrics '
      }, React.createElement('text', {
        content: '\nAverage Response Time: 145ms\n' +
                 'Uptime: 99.9%\n' +
                 'API Success Rate: 98.7%\n' +
                 'Cache Hit Rate: 85%\n\n' +
                 'Press ESC to return to dashboard'
      }))
    ]);
  }
  
  renderGenerate() {
    return React.createElement('box', {
      width: '100%',
      height: '100%'
    }, [
      React.createElement('box', {
        key: 'form',
        top: 0,
        left: 0,
        width: '100%',
        height: '60%',
        border: { type: 'line' },
        style: { border: { fg: 'green' } },
        label: ' Component Generator '
      }, React.createElement('text', {
        content: '\nComponent Configuration:\n\n' +
                 '  Name: MyComponent\n' +
                 '  Framework: React\n' +
                 '  Type: Functional Component\n' +
                 '  TypeScript: Yes\n' +
                 '  Styling: CSS Modules\n\n' +
                 'Press ENTER to generate component\n' +
                 'Press ESC to go back'
      })),
      
      React.createElement('box', {
        key: 'preview',
        top: '60%',
        left: 0,
        width: '100%',
        height: '40%',
        border: { type: 'line' },
        style: { border: { fg: 'blue' } },
        label: ' Preview '
      }, React.createElement('text', {
        content: '\nimport React from \'react\';\nimport styles from \'./MyComponent.module.css\';\n\n' +
                 'interface MyComponentProps {\n  // Add props here\n}\n\n' +
                 'const MyComponent: React.FC<MyComponentProps> = (props) => {\n' +
                 '  return (\n    <div className={styles.container}>\n' +
                 '      {/* Component content */}\n    </div>\n  );\n};\n\n' +
                 'export default MyComponent;'
      }))
    ]);
  }
  
  renderCatalog() {
    const { components } = this.state;
    
    return React.createElement('box', {
      width: '100%',
      height: '100%',
      border: { type: 'line' },
      style: { border: { fg: 'blue' } },
      label: ' Component Catalog ',
      scrollable: true
    }, React.createElement('text', {
      content: '\nAvailable Components:\n\n' +
               'Name         Framework  Rating  Downloads  Description\n' +
               '─'.repeat(60) + '\n' +
               components.map(c => 
                 `${c.name.padEnd(12)} ${c.framework.padEnd(10)} ${'★'.repeat(c.stars)} ${c.downloads.padEnd(8)} Advanced component`
               ).join('\n') + '\n\n' +
               'Use ↑/↓ to browse, ENTER to install, ESC to go back'
    }));
  }
  
  renderView() {
    const { currentView } = this.state;
    
    switch (currentView) {
      case 'dashboard':
        return this.renderDashboard();
      case 'generate':
        return this.renderGenerate();
      case 'catalog':
        return this.renderCatalog();
      case 'analytics':
        return this.renderAnalytics();
      default:
        return React.createElement('box', {
          key: 'placeholder-view',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: { type: 'line' },
          style: { border: { fg: 'white' } },
          label: ` ${currentView.charAt(0).toUpperCase() + currentView.slice(1)} `
        }, React.createElement('text', {
          key: 'placeholder-text',
          top: 'center',
          left: 'center',
          content: `${currentView.toUpperCase()} view\n\nComing soon!\n\nPress ESC to return`,
          style: { fg: 'yellow' }
        }));
    }
  }

  render() {
    return React.createElement('box', {
      width: '100%',
      height: '100%'
    }, [
      React.createElement('box', {
        key: 'menu-container',
        top: 0,
        left: 0,
        width: 20,
        height: '100%'
      }, this.renderMenu()),
      
      React.createElement('box', {
        key: 'content-container',
        top: 0,
        left: 20,
        width: '100%-20',
        height: '100%'
      }, this.renderView())
    ]);
  }
}

// Main function
function main() {
  try {
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Revolutionary UI - Simple Rich Dashboard',
      fullUnicode: true,
      warnings: false,
      terminal: 'xterm'
    });

    render(React.createElement(SimpleRichUI, { screen }), screen);
    
  } catch (error) {
    console.error('Failed to start Simple Rich UI:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SimpleRichUI, main };