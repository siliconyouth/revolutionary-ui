#!/usr/bin/env node

/**
 * Elegant Terminal UI for Revolutionary UI
 * Clean, modern design without terminal compatibility issues
 */

const blessed = require('blessed');
const React = require('react');
const { render } = require('react-blessed');
const fs = require('fs').promises;
const path = require('path');

// Color schemes using blessed color names
const THEMES = {
  modern: {
    primary: 'cyan',
    secondary: 'blue',
    accent: 'magenta',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue',
    border: 'white',
    muted: 'gray'
  },
  nord: {
    primary: 'blue',
    secondary: 'cyan',
    accent: 'magenta',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'cyan',
    border: 'blue',
    muted: 'gray'
  },
  dark: {
    primary: 'white',
    secondary: 'gray',
    accent: 'yellow',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'cyan',
    border: 'gray',
    muted: 'gray'
  }
};

// Simple ASCII symbols
const SYMBOLS = {
  arrow: '->',
  pointer: '>',
  check: '[✓]',
  cross: '[x]',
  dot: '•',
  star: '*',
  plus: '+',
  minus: '-',
  pipe: '|',
  corner: 'L',
  dash: '-'
};

class ElegantUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: 'modern',
      currentView: 'dashboard',
      selectedMenuIndex: 0,
      
      // Component form
      componentName: '',
      framework: 'react',
      typescript: true,
      editingField: null,
      
      // Stats
      stats: {
        components: 156,
        linesaved: 45234,
        projects: 12,
        team: 8
      },
      
      // Activities
      activities: [
        { time: '2m', action: 'Generated DataTable component', type: 'success' },
        { time: '15m', action: 'Updated FormBuilder template', type: 'info' },
        { time: '1h', action: 'AI model updated to GPT-4', type: 'warning' },
        { time: '2h', action: 'Published Calendar component', type: 'success' }
      ],
      
      // Notifications
      notifications: [],
      
      // Loading
      isLoading: false
    };
  }

  componentDidMount() {
    const { screen } = this.props;
    this.setupKeyHandlers(screen);
    this.showNotification('Welcome to Revolutionary UI - Elegant Edition', 'info');
  }

  setupKeyHandlers(screen) {
    // Quit
    screen.key(['q', 'C-c'], () => {
      process.exit(0);
    });

    // Navigation
    screen.key(['escape'], () => {
      this.setState({ currentView: 'dashboard', editingField: null });
    });

    // Menu navigation
    screen.key(['up', 'k'], () => {
      this.setState(prev => ({
        selectedMenuIndex: Math.max(0, prev.selectedMenuIndex - 1)
      }));
    });

    screen.key(['down', 'j'], () => {
      this.setState(prev => ({
        selectedMenuIndex: Math.min(4, prev.selectedMenuIndex + 1)
      }));
    });

    screen.key(['enter'], () => {
      const views = ['dashboard', 'generate', 'catalog', 'analytics', 'settings'];
      this.setState({ currentView: views[this.state.selectedMenuIndex] });
    });

    // Quick navigation
    screen.key(['d'], () => this.setState({ currentView: 'dashboard' }));
    screen.key(['g'], () => this.setState({ currentView: 'generate' }));
    screen.key(['c'], () => this.setState({ currentView: 'catalog' }));
    screen.key(['a'], () => this.setState({ currentView: 'analytics' }));
    screen.key(['s'], () => this.setState({ currentView: 'settings' }));

    // Theme switching
    screen.key(['t'], () => {
      const themes = Object.keys(THEMES);
      const currentIndex = themes.indexOf(this.state.theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      this.setState({ theme: themes[nextIndex] });
      this.showNotification(`Theme changed to ${themes[nextIndex]}`, 'info');
    });

    // Help
    screen.key(['?'], () => {
      this.showNotification('Help: Use arrow keys to navigate, Enter to select, q to quit', 'info');
    });

    // Text input
    screen.on('keypress', (ch, key) => {
      if (this.state.editingField && ch && !key.ctrl) {
        this.handleTextInput(ch);
      }
    });

    screen.key(['backspace'], () => {
      if (this.state.editingField) {
        this.handleBackspace();
      }
    });
  }

  handleTextInput(ch) {
    if (this.state.editingField === 'componentName') {
      this.setState(prev => ({
        componentName: prev.componentName + ch
      }));
    }
  }

  handleBackspace() {
    if (this.state.editingField === 'componentName') {
      this.setState(prev => ({
        componentName: prev.componentName.slice(0, -1)
      }));
    }
  }

  showNotification(message, type = 'info') {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    this.setState(prev => ({
      notifications: [...prev.notifications, notification]
    }));
    
    setTimeout(() => {
      this.setState(prev => ({
        notifications: prev.notifications.filter(n => n.id !== notification.id)
      }));
    }, 3000);
  }

  generateSparkline(length = 10) {
    const chars = '▁▂▃▄▅▆▇';
    return Array.from({ length }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  renderHeader() {
    const theme = THEMES[this.state.theme];
    
    return React.createElement('box', {
      key: 'header',
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      border: { type: 'line' },
      style: { border: { fg: theme.border } }
    }, React.createElement('text', {
      left: 'center',
      content: 'Revolutionary UI - Elegant Terminal Interface v3.4.1',
      style: { fg: theme.primary, bold: true }
    }));
  }

  renderSidebar() {
    const theme = THEMES[this.state.theme];
    const { selectedMenuIndex, currentView } = this.state;
    
    const menuItems = [
      { label: 'Dashboard', view: 'dashboard' },
      { label: 'Generate', view: 'generate' },
      { label: 'Catalog', view: 'catalog' },
      { label: 'Analytics', view: 'analytics' },
      { label: 'Settings', view: 'settings' }
    ];

    return React.createElement('box', {
      key: 'sidebar',
      top: 3,
      left: 0,
      width: 20,
      height: '100%-6',
      border: { type: 'line' },
      style: { border: { fg: theme.border } },
      label: ' Menu '
    }, React.createElement('text', {
      content: menuItems.map((item, i) => {
        const selected = i === selectedMenuIndex;
        const active = item.view === currentView;
        const prefix = selected ? SYMBOLS.pointer : ' ';
        const style = active ? `{${theme.accent}-fg}` : '';
        return `${prefix} ${style}${item.label}{/}`;
      }).join('\n') + '\n\n' +
      '─────────────────\n' +
      `Theme: ${this.state.theme} [t]\n` +
      'Help: [?]\n' +
      'Quit: [q]'
    }));
  }

  renderDashboard() {
    const theme = THEMES[this.state.theme];
    const { stats, activities } = this.state;
    
    return React.createElement('box', {
      key: 'dashboard',
      top: 3,
      left: 20,
      width: '100%-20',
      height: '100%-6'
    }, [
      // Stats row
      React.createElement('box', {
        key: 'stats',
        top: 0,
        left: 0,
        width: '100%',
        height: 10,
        border: { type: 'line' },
        style: { border: { fg: theme.border } },
        label: ' Statistics '
      }, React.createElement('text', {
        content: `
  Components Generated:  {${theme.success}-fg}${stats.components}{/}
  Lines of Code Saved:   {${theme.primary}-fg}${stats.linesaved.toLocaleString()}{/}
  Active Projects:       {${theme.warning}-fg}${stats.projects}{/}
  Team Members:          {${theme.info}-fg}${stats.team}{/}
  
  Performance: ${this.generateSparkline(15)}
  `
      })),
      
      // Activities
      React.createElement('box', {
        key: 'activities',
        top: 10,
        left: 0,
        width: '100%',
        height: '100%-10',
        border: { type: 'line' },
        style: { border: { fg: theme.border } },
        label: ' Recent Activity ',
        scrollable: true
      }, React.createElement('text', {
        content: activities.map(activity => {
          const colors = {
            success: theme.success,
            error: theme.error,
            warning: theme.warning,
            info: theme.info
          };
          return `  {gray-fg}${activity.time.padEnd(5)}{/} {${colors[activity.type]}-fg}${SYMBOLS.dot}{/} ${activity.action}`;
        }).join('\n')
      }))
    ]);
  }

  renderGenerate() {
    const theme = THEMES[this.state.theme];
    const { componentName, framework, typescript, editingField } = this.state;
    
    return React.createElement('box', {
      key: 'generate',
      top: 3,
      left: 20,
      width: '100%-20',
      height: '100%-6',
      border: { type: 'line' },
      style: { border: { fg: theme.border } },
      label: ' Component Generator '
    }, React.createElement('text', {
      content: `
  Component Name: {${theme.primary}-fg}${componentName}${editingField === 'componentName' ? '_' : ''}{/}
  ${editingField === 'componentName' ? '{gray-fg}(Press Enter to confirm){/}' : '{gray-fg}(Press Enter to edit){/}'}
  
  Framework:      {${theme.accent}-fg}${framework}{/}
  TypeScript:     {${theme.accent}-fg}${typescript ? 'Yes' : 'No'}{/}
  
  ─────────────────────────────────────
  
  Preview:
  ${this.generatePreview()}
  
  ─────────────────────────────────────
  
  {${theme.success}-fg}[G]{/} Generate Component
  {${theme.muted}-fg}[ESC]{/} Back to Dashboard
`
    }));
  }

  generatePreview() {
    const { componentName, framework, typescript } = this.state;
    if (!componentName) return '{gray-fg}Enter a component name to see preview...{/}';
    
    if (framework === 'react') {
      return typescript ? 
`interface ${componentName}Props {
  // Add props here
}

const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return <div>${componentName} Component</div>;
};

export default ${componentName};` :
`const ${componentName} = (props) => {
  return <div>${componentName} Component</div>;
};

export default ${componentName};`;
    }
    
    return `// ${framework} component preview...`;
  }

  renderCatalog() {
    const theme = THEMES[this.state.theme];
    
    const components = [
      { name: 'DataTable', downloads: 15420, rating: 4.8 },
      { name: 'FormBuilder', downloads: 8932, rating: 4.6 },
      { name: 'Dashboard', downloads: 12653, rating: 4.9 },
      { name: 'Calendar', downloads: 6789, rating: 4.5 }
    ];
    
    return React.createElement('box', {
      key: 'catalog',
      top: 3,
      left: 20,
      width: '100%-20',
      height: '100%-6',
      border: { type: 'line' },
      style: { border: { fg: theme.border } },
      label: ' Component Catalog '
    }, React.createElement('text', {
      content: `
  Popular Components:
  
${components.map(comp => 
  `  ${SYMBOLS.arrow} {${theme.primary}-fg}${comp.name.padEnd(15)}{/} ` +
  `{${theme.warning}-fg}${'*'.repeat(Math.round(comp.rating))}{/} ` +
  `{gray-fg}(${comp.downloads.toLocaleString()} downloads){/}`
).join('\n')}
  
  ─────────────────────────────────────
  
  {${theme.info}-fg}[Enter]{/} Install Selected
  {${theme.muted}-fg}[/]{/} Search Components
`
    }));
  }

  renderFooter() {
    const theme = THEMES[this.state.theme];
    const time = new Date().toLocaleTimeString();
    
    return React.createElement('box', {
      key: 'footer',
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      border: { type: 'line' },
      style: { border: { fg: theme.border } }
    }, React.createElement('text', {
      content: ` ${time} ${SYMBOLS.pipe} CPU: ${this.generateSparkline(8)} ${SYMBOLS.pipe} MEM: 42% ${SYMBOLS.pipe} Theme: ${this.state.theme}`
    }));
  }

  renderNotifications() {
    const theme = THEMES[this.state.theme];
    const { notifications } = this.state;
    
    return notifications.map((notification, index) => {
      const colors = {
        success: theme.success,
        error: theme.error,
        warning: theme.warning,
        info: theme.info
      };
      
      return React.createElement('box', {
        key: `notification-${notification.id}`,
        right: 1,
        top: 4 + (index * 3),
        width: 40,
        height: 3,
        border: { type: 'line' },
        style: { 
          border: { fg: colors[notification.type] },
          bg: 'black'
        }
      }, React.createElement('text', {
        content: ` {${colors[notification.type]}-fg}${notification.message}{/}`
      }));
    });
  }

  renderContent() {
    const { currentView } = this.state;
    
    switch (currentView) {
      case 'dashboard':
        return this.renderDashboard();
      case 'generate':
        return this.renderGenerate();
      case 'catalog':
        return this.renderCatalog();
      case 'analytics':
        return this.renderSimpleView('Analytics', 'Performance metrics and insights coming soon...');
      case 'settings':
        return this.renderSimpleView('Settings', 'Configure your preferences here...');
      default:
        return this.renderDashboard();
    }
  }

  renderSimpleView(title, message) {
    const theme = THEMES[this.state.theme];
    
    return React.createElement('box', {
      key: title.toLowerCase(),
      top: 3,
      left: 20,
      width: '100%-20',
      height: '100%-6',
      border: { type: 'line' },
      style: { border: { fg: theme.border } },
      label: ` ${title} `
    }, React.createElement('text', {
      content: `\n  {${theme.primary}-fg}${message}{/}`
    }));
  }

  render() {
    return React.createElement('box', {
      width: '100%',
      height: '100%'
    }, [
      this.renderHeader(),
      this.renderSidebar(),
      this.renderContent(),
      this.renderFooter(),
      ...this.renderNotifications()
    ]);
  }
}

// Main function
function main() {
  try {
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Revolutionary UI - Elegant Terminal',
      fullUnicode: true,
      warnings: false,
      terminal: 'xterm',
      autoPadding: true
    });

    // Key handlers need to be on screen, not just in component
    screen.key(['q', 'C-c'], () => {
      process.exit(0);
    });

    const component = render(React.createElement(ElegantUI, { screen }), screen);
    
    // Focus the screen
    screen.render();
    
  } catch (error) {
    console.error('Failed to start Elegant Terminal UI:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ElegantUI, main };