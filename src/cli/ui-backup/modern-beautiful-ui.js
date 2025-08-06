#!/usr/bin/env node

/**
 * Modern Beautiful Terminal UI for Revolutionary UI
 * Inspired by k9s, lazygit, and modern terminal design patterns
 */

const blessed = require('blessed');
const React = require('react');
const { render } = require('react-blessed');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Modern color themes
const THEMES = {
  cyberpunk: {
    primary: '#00ff41',      // Matrix green
    secondary: '#39ff14',    // Neon green
    accent: '#ff006e',       // Hot pink
    background: '#0a0a0a',   // Almost black
    surface: '#1a1a1a',      // Dark gray
    text: '#e0e0e0',         // Light gray
    muted: '#666666',        // Medium gray
    error: '#ff0040',        // Red
    warning: '#ffaa00',      // Orange
    success: '#00ff88',      // Bright green
    info: '#00ddff',         // Cyan
    border: '#333333'        // Dark border
  },
  nord: {
    primary: '#88c0d0',      // Nord frost
    secondary: '#81a1c1',    // Nord frost
    accent: '#5e81ac',       // Nord frost
    background: '#2e3440',   // Nord polar night
    surface: '#3b4252',      // Nord polar night
    text: '#eceff4',         // Nord snow storm
    muted: '#4c566a',        // Nord polar night
    error: '#bf616a',        // Nord aurora
    warning: '#d08770',      // Nord aurora
    success: '#a3be8c',      // Nord aurora
    info: '#5e81ac',         // Nord frost
    border: '#434c5e'        // Nord polar night
  },
  dracula: {
    primary: '#bd93f9',      // Purple
    secondary: '#ff79c6',    // Pink
    accent: '#50fa7b',       // Green
    background: '#282a36',   // Background
    surface: '#44475a',      // Current line
    text: '#f8f8f2',         // Foreground
    muted: '#6272a4',        // Comment
    error: '#ff5555',        // Red
    warning: '#ffb86c',      // Orange
    success: '#50fa7b',      // Green
    info: '#8be9fd',         // Cyan
    border: '#44475a'        // Current line
  },
  tokyoNight: {
    primary: '#7aa2f7',      // Blue
    secondary: '#bb9af7',    // Purple
    accent: '#7dcfff',       // Light blue
    background: '#1a1b26',   // Background
    surface: '#24283b',      // Surface
    text: '#c0caf5',         // Foreground
    muted: '#565f89',        // Comment
    error: '#f7768e',        // Red
    warning: '#e0af68',      // Orange
    success: '#9ece6a',      // Green
    info: '#7dcfff',         // Light blue
    border: '#3b4261'        // Border
  }
};

// Unicode symbols for better visuals
const SYMBOLS = {
  arrow: '→',
  arrowRight: '▶',
  arrowLeft: '◀',
  arrowUp: '▲',
  arrowDown: '▼',
  check: '✓',
  cross: '✗',
  dot: '•',
  star: '★',
  starEmpty: '☆',
  folder: '📁',
  file: '📄',
  package: '📦',
  rocket: '🚀',
  gear: '⚙',
  search: '🔍',
  chart: '📊',
  cloud: '☁',
  team: '👥',
  ai: '🤖',
  code: '💻',
  branch: '⎇',
  commit: '●',
  modified: '±',
  added: '+',
  deleted: '-',
  renamed: '→',
  corner: '└',
  pipe: '│',
  tee: '├',
  boxLight: {
    horizontal: '─',
    vertical: '│',
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    cross: '┼',
    teeUp: '┴',
    teeDown: '┬',
    teeRight: '├',
    teeLeft: '┤'
  }
};

// Modern Beautiful Terminal UI Component
class ModernBeautifulUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: 'cyberpunk',
      currentView: 'dashboard',
      sidebarCollapsed: false,
      selectedSidebarIndex: 0,
      
      // Dashboard state
      stats: {
        componentsGenerated: 42,
        linesOfCodeSaved: 12847,
        activeProjects: 3,
        teamMembers: 5
      },
      
      // Component generation state
      componentForm: {
        name: '',
        framework: 'react',
        type: 'functional',
        typescript: true,
        styling: 'styled-components',
        testing: true
      },
      
      // Activity feed
      activities: [
        { time: '2 mins ago', user: 'You', action: 'Generated DataTable component', type: 'success' },
        { time: '15 mins ago', user: 'Alice', action: 'Updated FormBuilder template', type: 'info' },
        { time: '1 hour ago', user: 'System', action: 'AI model updated to GPT-4', type: 'warning' },
        { time: '2 hours ago', user: 'Bob', action: 'Published Calendar component', type: 'success' }
      ],
      
      // Search state
      searchQuery: '',
      searchResults: [],
      
      // Modal state
      modalOpen: false,
      modalContent: null,
      
      // Loading states
      isLoading: false,
      loadingMessage: '',
      
      // Notifications
      notifications: []
    };
    
    this.animationFrame = null;
    this.sparklineData = this.generateSparklineData();
  }

  componentDidMount() {
    const { screen } = this.props;
    this.setupKeyHandlers(screen);
    this.startAnimations();
    this.showWelcomeNotification();
  }

  componentWillUnmount() {
    if (this.animationFrame) {
      clearInterval(this.animationFrame);
    }
  }

  setupKeyHandlers(screen) {
    // Global shortcuts
    screen.key(['q', 'C-c'], () => {
      this.showExitConfirmation();
    });

    screen.key(['escape'], () => {
      if (this.state.modalOpen) {
        this.setState({ modalOpen: false, modalContent: null });
      } else {
        this.setState({ currentView: 'dashboard' });
      }
    });

    // Theme switching
    screen.key(['t'], () => {
      this.cycleTheme();
    });

    // Sidebar toggle
    screen.key(['b'], () => {
      this.setState(prev => ({ sidebarCollapsed: !prev.sidebarCollapsed }));
    });

    // View shortcuts
    screen.key(['d'], () => this.switchView('dashboard'));
    screen.key(['g'], () => this.switchView('generate'));
    screen.key(['c'], () => this.switchView('catalog'));
    screen.key(['a'], () => this.switchView('analytics'));
    screen.key(['s'], () => this.switchView('settings'));

    // Vim-style navigation
    screen.key(['j', 'down'], () => this.navigateDown());
    screen.key(['k', 'up'], () => this.navigateUp());
    screen.key(['h', 'left'], () => this.navigateLeft());
    screen.key(['l', 'right'], () => this.navigateRight());
    screen.key(['enter', 'space'], () => this.handleSelect());

    // Search
    screen.key(['/', 'C-f'], () => {
      this.setState({ currentView: 'search' });
    });

    // Help
    screen.key(['?'], () => {
      this.showHelp();
    });

    // Refresh
    screen.key(['r', 'C-r'], () => {
      this.refresh();
    });
  }

  startAnimations() {
    // Update sparkline data every second
    this.animationFrame = setInterval(() => {
      this.sparklineData = this.generateSparklineData();
      this.forceUpdate();
    }, 1000);
  }

  generateSparklineData() {
    return Array.from({ length: 20 }, () => Math.floor(Math.random() * 10));
  }

  renderSparkline(data, width = 20) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const chars = ' ▁▂▃▄▅▆▇█';
    
    return data.slice(-width).map(value => {
      const normalized = (value - min) / range;
      const index = Math.floor(normalized * (chars.length - 1));
      return chars[index];
    }).join('');
  }

  cycleTheme() {
    const themes = Object.keys(THEMES);
    const currentIndex = themes.indexOf(this.state.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setState({ theme: themes[nextIndex] });
    this.showNotification(`Theme changed to ${themes[nextIndex]}`, 'info');
  }

  switchView(view) {
    this.setState({ currentView: view });
  }

  navigateDown() {
    const { currentView } = this.state;
    if (currentView === 'dashboard' || !this.state.sidebarCollapsed) {
      this.setState(prev => ({
        selectedSidebarIndex: Math.min(prev.selectedSidebarIndex + 1, 4)
      }));
    }
  }

  navigateUp() {
    const { currentView } = this.state;
    if (currentView === 'dashboard' || !this.state.sidebarCollapsed) {
      this.setState(prev => ({
        selectedSidebarIndex: Math.max(prev.selectedSidebarIndex - 1, 0)
      }));
    }
  }

  navigateLeft() {
    // Implement view-specific navigation
  }

  navigateRight() {
    // Implement view-specific navigation
  }

  handleSelect() {
    const { selectedSidebarIndex } = this.state;
    const views = ['dashboard', 'generate', 'catalog', 'analytics', 'settings'];
    this.switchView(views[selectedSidebarIndex]);
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
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.setState(prev => ({
        notifications: prev.notifications.filter(n => n.id !== notification.id)
      }));
    }, 5000);
  }

  showWelcomeNotification() {
    this.showNotification('Welcome to Revolutionary UI v3.4.1 - Modern Beautiful Edition', 'success');
  }

  showHelp() {
    const helpContent = `
╭─────────────────────────────────────────╮
│          Keyboard Shortcuts             │
├─────────────────────────────────────────┤
│ Navigation                              │
│   j/↓    Move down                      │
│   k/↑    Move up                        │
│   h/←    Move left                      │
│   l/→    Move right                     │
│   Enter  Select                         │
│                                         │
│ Views                                   │
│   d      Dashboard                      │
│   g      Generate Component             │
│   c      Component Catalog              │
│   a      Analytics                      │
│   s      Settings                       │
│                                         │
│ Global                                  │
│   /      Search                         │
│   t      Change theme                   │
│   b      Toggle sidebar                 │
│   r      Refresh                        │
│   ?      This help                      │
│   q      Quit                           │
│                                         │
│ Theme: ${this.state.theme.padEnd(16)}         │
╰─────────────────────────────────────────╯
`;
    this.setState({
      modalOpen: true,
      modalContent: { type: 'help', content: helpContent }
    });
  }

  showExitConfirmation() {
    this.setState({
      modalOpen: true,
      modalContent: {
        type: 'confirm',
        title: 'Exit Revolutionary UI?',
        message: 'Are you sure you want to quit?',
        onConfirm: () => process.exit(0),
        onCancel: () => this.setState({ modalOpen: false })
      }
    });
  }

  refresh() {
    this.setState({ isLoading: true, loadingMessage: 'Refreshing...' });
    setTimeout(() => {
      this.setState({ isLoading: false, loadingMessage: '' });
      this.showNotification('Refreshed successfully', 'success');
    }, 1000);
  }

  renderSidebar() {
    const theme = THEMES[this.state.theme];
    const { sidebarCollapsed, selectedSidebarIndex, currentView } = this.state;
    
    const menuItems = [
      { icon: SYMBOLS.chart, label: 'Dashboard', view: 'dashboard', key: 'd' },
      { icon: SYMBOLS.rocket, label: 'Generate', view: 'generate', key: 'g' },
      { icon: SYMBOLS.package, label: 'Catalog', view: 'catalog', key: 'c' },
      { icon: SYMBOLS.chart, label: 'Analytics', view: 'analytics', key: 'a' },
      { icon: SYMBOLS.gear, label: 'Settings', view: 'settings', key: 's' }
    ];

    if (sidebarCollapsed) {
      return React.createElement('box', {
        key: 'sidebar-collapsed',
        left: 0,
        top: 0,
        width: 3,
        height: '100%',
        style: {
          bg: theme.surface,
          fg: theme.text
        }
      }, React.createElement('text', {
        content: menuItems.map((item, i) => {
          const selected = i === selectedSidebarIndex;
          const active = item.view === currentView;
          return `${selected ? theme.accent : active ? theme.primary : theme.muted}${item.icon}`;
        }).join('\n')
      }));
    }

    return React.createElement('box', {
      key: 'sidebar',
      left: 0,
      top: 0,
      width: 25,
      height: '100%',
      style: {
        bg: theme.surface,
        fg: theme.text
      },
      border: {
        type: 'line',
        fg: theme.border
      },
      label: ` ${SYMBOLS.rocket} Revolutionary UI `
    }, React.createElement('text', {
      content: '\n' + menuItems.map((item, i) => {
        const selected = i === selectedSidebarIndex;
        const active = item.view === currentView;
        const prefix = selected ? SYMBOLS.arrowRight : '  ';
        const color = active ? theme.primary : theme.text;
        
        return `${prefix} ${item.icon} ${item.label} {${theme.muted}-fg}[${item.key}]{/${theme.muted}-fg}`;
      }).join('\n\n') + '\n\n\n' +
      `{${theme.muted}-fg}${SYMBOLS.boxLight.horizontal.repeat(21)}{/${theme.muted}-fg}\n\n` +
      `  ${SYMBOLS.team} Team: 5 members\n` +
      `  ${SYMBOLS.cloud} Cloud: Connected\n` +
      `  ${SYMBOLS.ai} AI: GPT-4 Active\n\n` +
      `{${theme.muted}-fg}${SYMBOLS.boxLight.horizontal.repeat(21)}{/${theme.muted}-fg}\n\n` +
      `  Theme: ${this.state.theme}\n` +
      `  {${theme.muted}-fg}Press [t] to change{/${theme.muted}-fg}`
    }));
  }

  renderHeader() {
    const theme = THEMES[this.state.theme];
    const { currentView } = this.state;
    
    const viewTitles = {
      dashboard: 'Dashboard',
      generate: 'Component Generator',
      catalog: 'Component Catalog',
      analytics: 'Analytics & Insights',
      settings: 'Settings',
      search: 'Search'
    };

    return React.createElement('box', {
      key: 'header',
      left: this.state.sidebarCollapsed ? 3 : 25,
      top: 0,
      width: this.state.sidebarCollapsed ? '100%-3' : '100%-25',
      height: 3,
      style: {
        bg: theme.background,
        fg: theme.text
      }
    }, React.createElement('text', {
      left: 2,
      content: `{${theme.primary}-fg}{bold}${viewTitles[currentView] || 'Revolutionary UI'}{/bold}{/${theme.primary}-fg}\n` +
               `{${theme.muted}-fg}Modern Terminal Interface v3.4.1{/${theme.muted}-fg}`
    }));
  }

  renderFooter() {
    const theme = THEMES[this.state.theme];
    const time = new Date().toLocaleTimeString();
    
    return React.createElement('box', {
      key: 'footer',
      left: this.state.sidebarCollapsed ? 3 : 25,
      bottom: 0,
      width: this.state.sidebarCollapsed ? '100%-3' : '100%-25',
      height: 3,
      style: {
        bg: theme.surface,
        fg: theme.muted
      },
      border: {
        type: 'line',
        fg: theme.border
      }
    }, React.createElement('text', {
      content: ` ${SYMBOLS.dot} ${time} ${SYMBOLS.dot} ` +
               `CPU: ${this.renderSparkline(this.sparklineData, 10)} ` +
               `${SYMBOLS.dot} Mem: 42% ${SYMBOLS.dot} ` +
               `Net: ${SYMBOLS.arrowUp}12KB/s ${SYMBOLS.arrowDown}3KB/s ${SYMBOLS.dot} ` +
               `[?] Help ${SYMBOLS.dot} [q] Quit`
    }));
  }

  renderNotifications() {
    const theme = THEMES[this.state.theme];
    const { notifications } = this.state;
    
    if (notifications.length === 0) return [];
    
    return notifications.map((notification, index) => {
      const colors = {
        success: theme.success,
        error: theme.error,
        warning: theme.warning,
        info: theme.info
      };
      
      return React.createElement('box', {
        key: `notification-${notification.id}`,
        right: 2,
        top: 3 + (index * 3),
        width: 40,
        height: 3,
        style: {
          bg: colors[notification.type],
          fg: theme.background
        },
        border: {
          type: 'line',
          fg: theme.background
        }
      }, React.createElement('text', {
        content: ` ${notification.message}`
      }));
    });
  }

  renderModal() {
    const theme = THEMES[this.state.theme];
    const { modalOpen, modalContent } = this.state;
    
    if (!modalOpen || !modalContent) return null;
    
    const width = modalContent.type === 'help' ? 45 : 40;
    const height = modalContent.type === 'help' ? 25 : 10;
    
    return React.createElement('box', {
      key: 'modal-overlay',
      left: 'center',
      top: 'center',
      width: width,
      height: height,
      style: {
        bg: theme.surface,
        fg: theme.text
      },
      border: {
        type: 'line',
        fg: theme.accent
      },
      label: modalContent.title || ' Press ESC to close '
    }, React.createElement('text', {
      content: modalContent.content || modalContent.message || ''
    }));
  }

  renderDashboard() {
    const theme = THEMES[this.state.theme];
    const { stats, activities } = this.state;
    
    return React.createElement('box', {
      key: 'dashboard-content',
      left: this.state.sidebarCollapsed ? 3 : 25,
      top: 3,
      width: this.state.sidebarCollapsed ? '100%-3' : '100%-25',
      height: '100%-6'
    }, [
      // Stats cards
      React.createElement('box', {
        key: 'stats-row',
        left: 0,
        top: 0,
        width: '100%',
        height: 8
      }, [
        this.renderStatCard('Components', stats.componentsGenerated, theme.success, 0),
        this.renderStatCard('Lines Saved', `${(stats.linesOfCodeSaved / 1000).toFixed(1)}k`, theme.primary, '25%'),
        this.renderStatCard('Projects', stats.activeProjects, theme.warning, '50%'),
        this.renderStatCard('Team', stats.teamMembers, theme.info, '75%')
      ]),
      
      // Activity feed
      React.createElement('box', {
        key: 'activity-feed',
        left: 0,
        top: 8,
        width: '50%',
        height: '100%-8',
        border: {
          type: 'line',
          fg: theme.border
        },
        label: ` ${SYMBOLS.code} Recent Activity `,
        scrollable: true
      }, React.createElement('text', {
        content: activities.map(activity => {
          const colors = {
            success: theme.success,
            error: theme.error,
            warning: theme.warning,
            info: theme.info
          };
          
          return `{${theme.muted}-fg}${activity.time}{/${theme.muted}-fg}\n` +
                 `{${colors[activity.type]}-fg}${SYMBOLS.dot}{/${colors[activity.type]}-fg} ` +
                 `{bold}${activity.user}{/bold}: ${activity.action}\n`;
        }).join('\n')
      })),
      
      // Quick actions
      React.createElement('box', {
        key: 'quick-actions',
        left: '50%',
        top: 8,
        width: '50%',
        height: '100%-8',
        border: {
          type: 'line',
          fg: theme.border
        },
        label: ` ${SYMBOLS.rocket} Quick Actions `
      }, React.createElement('text', {
        content: `\n  {${theme.primary}-fg}${SYMBOLS.arrowRight} Generate Component [g]{/${theme.primary}-fg}\n\n` +
                 `  {${theme.accent}-fg}${SYMBOLS.arrowRight} Browse Catalog [c]{/${theme.accent}-fg}\n\n` +
                 `  {${theme.success}-fg}${SYMBOLS.arrowRight} View Analytics [a]{/${theme.success}-fg}\n\n` +
                 `  {${theme.warning}-fg}${SYMBOLS.arrowRight} Team Dashboard [t]{/${theme.warning}-fg}\n\n` +
                 `  {${theme.info}-fg}${SYMBOLS.arrowRight} Cloud Sync [C-s]{/${theme.info}-fg}`
      }))
    ]);
  }

  renderStatCard(label, value, color, left) {
    const theme = THEMES[this.state.theme];
    
    return React.createElement('box', {
      key: `stat-${label}`,
      left: left,
      top: 0,
      width: '25%',
      height: 7,
      border: {
        type: 'line',
        fg: color
      }
    }, React.createElement('text', {
      left: 'center',
      content: `\n{${theme.muted}-fg}${label}{/${theme.muted}-fg}\n\n` +
               `{${color}-fg}{bold}${value}{/bold}{/${color}-fg}\n` +
               `{${theme.muted}-fg}${this.renderSparkline(this.sparklineData, 10)}{/${theme.muted}-fg}`
    }));
  }

  renderContent() {
    const { currentView } = this.state;
    
    switch (currentView) {
      case 'dashboard':
        return this.renderDashboard();
      case 'generate':
        return this.renderGenerator();
      case 'catalog':
        return this.renderCatalog();
      case 'analytics':
        return this.renderAnalytics();
      case 'settings':
        return this.renderSettings();
      case 'search':
        return this.renderSearch();
      default:
        return this.renderDashboard();
    }
  }

  renderGenerator() {
    const theme = THEMES[this.state.theme];
    
    return React.createElement('box', {
      key: 'generator-content',
      left: this.state.sidebarCollapsed ? 3 : 25,
      top: 3,
      width: this.state.sidebarCollapsed ? '100%-3' : '100%-25',
      height: '100%-6',
      style: {
        bg: theme.background
      }
    }, React.createElement('text', {
      content: `{${theme.primary}-fg}{bold}Component Generator{/bold}{/${theme.primary}-fg}\n\n` +
               `Modern component generation interface coming soon...`
    }));
  }

  renderCatalog() {
    const theme = THEMES[this.state.theme];
    
    return React.createElement('box', {
      key: 'catalog-content',
      left: this.state.sidebarCollapsed ? 3 : 25,
      top: 3,
      width: this.state.sidebarCollapsed ? '100%-3' : '100%-25',
      height: '100%-6'
    }, React.createElement('text', {
      content: `{${theme.primary}-fg}{bold}Component Catalog{/bold}{/${theme.primary}-fg}\n\n` +
               `Browse and install components...`
    }));
  }

  renderAnalytics() {
    const theme = THEMES[this.state.theme];
    
    return React.createElement('box', {
      key: 'analytics-content',
      left: this.state.sidebarCollapsed ? 3 : 25,
      top: 3,
      width: this.state.sidebarCollapsed ? '100%-3' : '100%-25',
      height: '100%-6'
    }, React.createElement('text', {
      content: `{${theme.primary}-fg}{bold}Analytics & Insights{/bold}{/${theme.primary}-fg}\n\n` +
               `Performance metrics and insights...`
    }));
  }

  renderSettings() {
    const theme = THEMES[this.state.theme];
    
    return React.createElement('box', {
      key: 'settings-content',
      left: this.state.sidebarCollapsed ? 3 : 25,
      top: 3,
      width: this.state.sidebarCollapsed ? '100%-3' : '100%-25',
      height: '100%-6'
    }, React.createElement('text', {
      content: `{${theme.primary}-fg}{bold}Settings{/bold}{/${theme.primary}-fg}\n\n` +
               `Configure your preferences...`
    }));
  }

  renderSearch() {
    const theme = THEMES[this.state.theme];
    
    return React.createElement('box', {
      key: 'search-content',
      left: this.state.sidebarCollapsed ? 3 : 25,
      top: 3,
      width: this.state.sidebarCollapsed ? '100%-3' : '100%-25',
      height: '100%-6'
    }, React.createElement('text', {
      content: `{${theme.primary}-fg}{bold}Search{/bold}{/${theme.primary}-fg}\n\n` +
               `Search for components, templates, and more...`
    }));
  }

  render() {
    const theme = THEMES[this.state.theme];
    
    const elements = [
      this.renderSidebar(),
      this.renderHeader(),
      this.renderContent(),
      this.renderFooter()
    ];
    
    // Add notifications if any exist
    const notifications = this.renderNotifications();
    if (notifications) {
      if (Array.isArray(notifications)) {
        elements.push(...notifications);
      } else {
        elements.push(notifications);
      }
    }
    
    // Add modal if open
    const modal = this.renderModal();
    if (modal) {
      elements.push(modal);
    }
    
    return React.createElement('box', {
      width: '100%',
      height: '100%',
      style: {
        bg: theme.background
      }
    }, elements);
  }
}

// Main function
function main() {
  try {
    // Set safer terminal environment
    process.env.TERM = 'xterm';
    
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Revolutionary UI - Modern Beautiful Terminal',
      fullUnicode: true,
      warnings: false,
      terminal: 'xterm',  // Use basic xterm to avoid Setulc error
      forceUnicode: false,
      dockBorders: false,
      ignoreDockContrast: true,
      autoPadding: true
    });

    render(React.createElement(ModernBeautifulUI, { screen }), screen);
    
  } catch (error) {
    console.error('Failed to start Modern Beautiful Terminal UI:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ModernBeautifulUI, main };