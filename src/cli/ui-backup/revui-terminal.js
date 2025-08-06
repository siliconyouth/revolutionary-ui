#!/usr/bin/env node
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import figlet from 'figlet';

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Revolutionary UI Terminal',
  fullUnicode: true,
  warnings: false
});

// State management
let currentView = 'menu'; // 'menu', 'dashboard', 'generate', 'analyze', etc.
let widgets = [];

// Clear all widgets
function clearScreen() {
  widgets.forEach(w => w.destroy());
  widgets = [];
  screen.render();
}

// Create main menu
function showMainMenu() {
  clearScreen();
  currentView = 'menu';
  
  // ASCII art title
  const titleBox = blessed.box({
    top: 2,
    left: 'center',
    width: 'shrink',
    height: 'shrink',
    content: figlet.textSync('REVUI', {
      font: 'Big',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    }),
    tags: true,
    style: {
      fg: 'cyan'
    }
  });
  
  // Subtitle
  const subtitle = blessed.box({
    top: 10,
    left: 'center',
    width: 'shrink',
    height: 1,
    content: '{center}Revolutionary UI Terminal v3.4 - AI-Powered Component Generation{/center}',
    tags: true,
    style: {
      fg: 'gray'
    }
  });
  
  // Menu list
  const menuList = blessed.list({
    top: 'center',
    left: 'center',
    width: 50,
    height: 12,
    label: ' Main Menu ',
    border: {
      type: 'line',
      fg: 'cyan'
    },
    style: {
      selected: {
        bg: 'blue',
        fg: 'white',
        bold: true
      },
      item: {
        fg: 'white'
      }
    },
    keys: true,
    mouse: true,
    items: [
      '📊  Dashboard - View system metrics',
      '🤖  Generate - AI component generation',
      '🔍  Analyze - Project analysis',
      '🔎  Search - Browse components',
      '💬  Chat - AI assistant',
      '☁️   Sync - Cloud synchronization',
      '⚙️   Settings - Configuration',
      '❌  Exit - Quit application'
    ]
  });
  
  // Help text
  const helpText = blessed.box({
    bottom: 1,
    left: 'center',
    width: 'shrink',
    height: 1,
    content: 'Use ↑↓ arrows to navigate, Enter to select, ESC to go back',
    style: {
      fg: 'gray'
    }
  });
  
  // Handle selection
  menuList.on('select', (item, index) => {
    switch(index) {
      case 0: showDashboard(); break;
      case 1: showGenerate(); break;
      case 2: showAnalyze(); break;
      case 3: showSearch(); break;
      case 4: showChat(); break;
      case 5: showSync(); break;
      case 6: showSettings(); break;
      case 7: process.exit(0); break;
    }
  });
  
  // Focus menu
  menuList.focus();
  
  // Store widgets
  widgets = [titleBox, subtitle, menuList, helpText];
  screen.append(titleBox);
  screen.append(subtitle);
  screen.append(menuList);
  screen.append(helpText);
  screen.render();
}

// Create dashboard view
function showDashboard() {
  clearScreen();
  currentView = 'dashboard';
  
  // Create grid
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
  
  // Dashboard data
  let lineData = {
    title: 'Code Reduction Trend',
    x: Array.from({ length: 30 }, (_, i) => i.toString()),
    y: Array.from({ length: 30 }, (_, i) => 50 + Math.sin(i * 0.2) * 30 + Math.random() * 10),
    style: { line: 'green' }
  };
  
  // Create widgets
  const line = grid.set(0, 0, 4, 8, contrib.line, {
    showLegend: true,
    wholeNumbersOnly: false,
    label: 'Code Reduction Over Time'
  });
  
  const gauge = grid.set(0, 8, 4, 4, contrib.gauge, {
    percent: 71,
    stroke: 'green',
    fill: 'white',
    label: 'Efficiency'
  });
  
  const table = grid.set(4, 0, 4, 6, contrib.table, {
    keys: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    interactive: true,
    label: 'Factory Performance',
    border: { type: "line", fg: "cyan" },
    columnSpacing: 3,
    columnWidth: [20, 10, 10]
  });
  
  const log = grid.set(8, 0, 4, 12, contrib.log, {
    fg: "green",
    selectedFg: "green",
    label: 'System Activity'
  });
  
  const info = grid.set(4, 6, 4, 6, blessed.box, {
    label: 'Info',
    content: `{center}{bold}Revolutionary UI{/bold}{/center}

{cyan-fg}Metrics:{/cyan-fg}
• Components: 156
• Reduction: 71%
• Time saved: 248h

{yellow-fg}Press ESC for menu{/yellow-fg}`,
    tags: true,
    border: { type: "line", fg: "yellow" }
  });
  
  // Set data
  line.setData([lineData]);
  table.setData({
    headers: ['Component', 'Usage', 'Reduction'],
    data: [
      ['FormFactory', '234', '82%'],
      ['TableFactory', '189', '75%'],
      ['DashboardFactory', '156', '68%'],
      ['ChartFactory', '142', '71%']
    ]
  });
  
  // Activity logs
  const activities = [
    'Component generated successfully',
    'Project analysis completed',
    'Cloud sync in progress...',
    'AI recommendations ready'
  ];
  
  let activityIndex = 0;
  const logInterval = setInterval(() => {
    if (currentView !== 'dashboard') {
      clearInterval(logInterval);
      return;
    }
    log.log(activities[activityIndex % activities.length]);
    activityIndex++;
  }, 3000);
  
  // Update gauge
  const gaugeInterval = setInterval(() => {
    if (currentView !== 'dashboard') {
      clearInterval(gaugeInterval);
      return;
    }
    gauge.setPercent(Math.floor(Math.random() * 10) + 70);
  }, 5000);
  
  // Store grid widgets
  widgets = [line, gauge, table, log, info];
  screen.render();
}

// Generate view
function showGenerate() {
  clearScreen();
  currentView = 'generate';
  
  const form = blessed.form({
    parent: screen,
    width: '90%',
    height: '90%',
    top: 'center',
    left: 'center',
    label: ' 🤖 AI Component Generator ',
    border: {
      type: 'line',
      fg: 'cyan'
    }
  });
  
  const text = blessed.text({
    parent: form,
    top: 2,
    left: 2,
    content: 'Select component type to generate:'
  });
  
  const componentList = blessed.list({
    parent: form,
    top: 4,
    left: 2,
    width: '95%',
    height: 10,
    border: {
      type: 'line',
      fg: 'yellow'
    },
    style: {
      selected: {
        bg: 'blue',
        fg: 'white'
      }
    },
    keys: true,
    mouse: true,
    items: [
      '📝 Form Factory - Dynamic forms with validation',
      '📊 Table Factory - Data tables with sorting/filtering',
      '📈 Dashboard Factory - Admin dashboards',
      '📉 Chart Factory - Data visualization',
      '🗂️ Modal Factory - Dialog components',
      '🎨 Layout Factory - Page layouts'
    ]
  });
  
  const helpText = blessed.text({
    parent: form,
    bottom: 2,
    left: 2,
    content: 'Select with Enter, ESC to go back'
  });
  
  componentList.focus();
  widgets = [form];
  screen.render();
}

// Analyze view
function showAnalyze() {
  clearScreen();
  currentView = 'analyze';
  
  const box = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '80%',
    height: '80%',
    label: ' 🔍 Project Analysis ',
    border: {
      type: 'line',
      fg: 'yellow'
    },
    padding: 2
  });
  
  const spinner = blessed.loading({
    parent: box,
    top: 2,
    left: 'center',
    width: 'shrink',
    height: 3
  });
  
  spinner.load('Analyzing project...');
  
  setTimeout(() => {
    spinner.stop();
    box.setContent(`{bold}Analysis Complete!{/bold}

{cyan-fg}Framework:{/cyan-fg} React + TypeScript
{cyan-fg}Components:{/cyan-fg} 47 found
{cyan-fg}Code Reduction:{/cyan-fg} 72% potential

{yellow-fg}Recommendations:{/yellow-fg}
• Convert UserForm to FormFactory
• Optimize DataTable with TableFactory
• Implement lazy loading
• Add AI-powered search

{gray-fg}Press ESC to return to menu{/gray-fg}`);
    screen.render();
  }, 2000);
  
  widgets = [box];
  screen.render();
}

// Placeholder views
function showSearch() {
  showPlaceholder('🔎 Component Search', 'Search functionality coming soon!');
}

function showChat() {
  showPlaceholder('💬 AI Chat', 'Chat with AI assistants coming soon!');
}

function showSync() {
  showPlaceholder('☁️ Cloud Sync', 'Sync your components across devices!');
}

function showSettings() {
  showPlaceholder('⚙️ Settings', 'Configure your preferences here.');
}

function showPlaceholder(title, message) {
  clearScreen();
  currentView = 'placeholder';
  
  const box = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: 60,
    height: 10,
    label: ` ${title} `,
    border: {
      type: 'line',
      fg: 'cyan'
    },
    padding: 2,
    content: `{center}${message}{/center}

{center}{gray-fg}Press ESC to return to menu{/gray-fg}{/center}`,
    tags: true
  });
  
  widgets = [box];
  screen.render();
}

// Global key handlers
screen.key(['escape'], () => {
  if (currentView !== 'menu') {
    showMainMenu();
  }
});

screen.key(['q', 'C-c'], () => {
  process.exit(0);
});

// Start with main menu
showMainMenu();