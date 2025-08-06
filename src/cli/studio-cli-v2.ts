#!/usr/bin/env node
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import gradient from 'gradient-string';
import ora from 'ora';
import cliProgress from 'cli-progress';
import { plot } from 'asciichart';
import { Command } from 'commander';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface StudioScreen {
  screen: blessed.Widgets.Screen;
  grid: any;
  widgets: {
    title?: blessed.Widgets.BoxElement;
    menu?: blessed.Widgets.ListElement;
    content?: blessed.Widgets.BoxElement;
    log?: contrib.Widgets.LogElement;
    gauge?: contrib.Widgets.GaugeElement;
    sparkline?: contrib.Widgets.SparklineElement;
    table?: contrib.Widgets.TableElement;
    markdown?: blessed.Widgets.BoxElement;
    donut?: contrib.Widgets.DonutElement;
    map?: contrib.Widgets.MapElement;
    bar?: contrib.Widgets.BarElement;
    line?: contrib.Widgets.LineElement;
    lcd?: contrib.Widgets.LcdElement;
  };
}

export class RevolutionaryStudioCLI {
  private screen!: blessed.Widgets.Screen;
  private grid!: any;
  private widgets: StudioScreen['widgets'] = {};
  private currentView: string = 'dashboard';
  private animationInterval?: NodeJS.Timeout;
  private currentSection: number = 0;
  private sections = ['dashboard', 'components', 'ai', 'analytics', 'settings'];
  private focusableWidgets: blessed.Widgets.BlessedElement[] = [];
  private currentFocusIndex: number = 0;
  private metrics = {
    componentsGenerated: 0,
    codeReduction: 71,
    activeProjects: 0,
    aiRequests: 0,
    performance: []
  };

  constructor() {
    this.initializeScreen();
  }

  private initializeScreen() {
    // Create blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Revolutionary UI Studio',
      fullUnicode: true,
      dockBorders: true,
      cursor: {
        artificial: true,
        shape: 'line',
        blink: true,
        color: 'white'
      }
    });

    // Create grid for layout
    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen
    });

    // Set up key bindings
    this.setupKeyBindings();

    // Initialize with splash screen
    this.showSplashScreen();
  }

  private setupKeyBindings() {
    // Quit on Escape, q, or Control-C
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.cleanup();
      process.exit(0);
    });

    // Navigation keys
    this.screen.key(['1'], () => this.showDashboard());
    this.screen.key(['2'], () => this.showComponentBrowser());
    this.screen.key(['3'], () => this.showAIAssistant());
    this.screen.key(['4'], () => this.showProjectAnalytics());
    this.screen.key(['5'], () => this.showSettings());
    this.screen.key(['h'], () => this.showHelp());
    this.screen.key(['r'], () => this.refresh());

    // Arrow key navigation
    this.screen.key(['left', 'right'], (ch, key) => {
      this.handleArrowNavigation(key.name);
    });

    // Tab navigation
    this.screen.key(['tab', 'S-tab'], (ch, key) => {
      if (key.shift) {
        this.focusPrevious();
      } else {
        this.focusNext();
      }
    });
  }

  private handleArrowNavigation(direction: string) {
    if (direction === 'left') {
      this.currentSection = (this.currentSection - 1 + this.sections.length) % this.sections.length;
    } else if (direction === 'right') {
      this.currentSection = (this.currentSection + 1) % this.sections.length;
    }

    // Navigate to the section
    switch (this.sections[this.currentSection]) {
      case 'dashboard':
        this.showDashboard();
        break;
      case 'components':
        this.showComponentBrowser();
        break;
      case 'ai':
        this.showAIAssistant();
        break;
      case 'analytics':
        this.showProjectAnalytics();
        break;
      case 'settings':
        this.showSettings();
        break;
    }
  }

  private focusNext() {
    if (this.focusableWidgets.length === 0) return;
    
    // Remove focus from current widget
    if (this.focusableWidgets[this.currentFocusIndex]) {
      this.focusableWidgets[this.currentFocusIndex].style.border.fg = 'white';
    }
    
    // Move to next widget
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableWidgets.length;
    
    // Focus new widget
    const widget = this.focusableWidgets[this.currentFocusIndex];
    if (widget) {
      widget.focus();
      widget.style.border.fg = 'cyan';
      this.screen.render();
    }
  }

  private focusPrevious() {
    if (this.focusableWidgets.length === 0) return;
    
    // Remove focus from current widget
    if (this.focusableWidgets[this.currentFocusIndex]) {
      this.focusableWidgets[this.currentFocusIndex].style.border.fg = 'white';
    }
    
    // Move to previous widget
    this.currentFocusIndex = (this.currentFocusIndex - 1 + this.focusableWidgets.length) % this.focusableWidgets.length;
    
    // Focus new widget
    const widget = this.focusableWidgets[this.currentFocusIndex];
    if (widget) {
      widget.focus();
      widget.style.border.fg = 'cyan';
      this.screen.render();
    }
  }

  private registerFocusableWidget(widget: blessed.Widgets.BlessedElement) {
    this.focusableWidgets.push(widget);
    
    // Add click handler
    widget.on('click', () => {
      const index = this.focusableWidgets.indexOf(widget);
      if (index !== -1) {
        this.currentFocusIndex = index;
        this.focusableWidgets.forEach((w, i) => {
          w.style.border.fg = i === index ? 'cyan' : 'white';
        });
        widget.focus();
        this.screen.render();
      }
    });
  }

  private async showSplashScreen() {
    // Clear screen
    this.clearWidgets();

    // Create centered box for splash
    const splashBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: '80%',
      height: '80%',
      border: {
        type: 'line',
        fg: 'cyan'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'cyan'
        }
      }
    });

    // Animated title
    const title = gradient.rainbow.multiline(figlet.textSync('Revolutionary UI', {
      font: 'ANSI Shadow',
      horizontalLayout: 'fitted'
    }));

    const titleBox = blessed.box({
      parent: splashBox,
      top: 2,
      left: 'center',
      width: '90%',
      height: 8,
      content: title,
      align: 'center'
    });

    // Version and tagline
    const versionBox = blessed.box({
      parent: splashBox,
      top: 10,
      left: 'center',
      width: '90%',
      height: 3,
      content: chalk.cyan('v3.5.0 Studio Edition\n') + 
               chalk.gray('Revolutionizing UI Development with AI-Powered Factory Patterns'),
      align: 'center'
    });

    // Loading animation
    const spinner = ora({
      text: 'Initializing Revolutionary Studio...',
      spinner: 'dots12',
      color: 'cyan'
    });

    // Progress bar
    const progressBar = new cliProgress.SingleBar({
      format: 'Loading |' + chalk.cyan('{bar}') + '| {percentage}% | {value}/{total}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    // Features list with animations
    const features = [
      '🏭 Factory System - 71% Code Reduction',
      '🤖 AI Integration - GPT-4, Claude, Gemini',
      '☁️ Cloud Sync & Team Collaboration',
      '📊 Real-time Analytics & Metrics',
      '🎨 50+ UI Frameworks Supported',
      '🔍 Semantic Search with Vector DB',
      '🛍️ Component Marketplace',
      '🚀 Lightning Fast Generation'
    ];

    const featureBox = blessed.list({
      parent: splashBox,
      top: 14,
      left: 'center',
      width: '80%',
      height: 10,
      items: features,
      style: {
        fg: 'green',
        selected: {
          bg: 'blue',
          fg: 'white'
        }
      }
    });

    this.screen.render();

    // Animate features
    let currentFeature = 0;
    const animateFeatures = setInterval(() => {
      featureBox.select(currentFeature);
      this.screen.render();
      currentFeature = (currentFeature + 1) % features.length;
    }, 500);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 3000));
    clearInterval(animateFeatures);

    // Transition to dashboard
    this.showDashboard();
  }

  private showDashboard() {
    this.currentView = 'dashboard';
    this.currentSection = 0;
    this.clearWidgets();

    // Title bar
    this.widgets.title = this.grid.set(0, 0, 1, 12, blessed.box, {
      content: gradient.rainbow(' Revolutionary UI Studio - Dashboard '),
      align: 'center',
      style: {
        fg: 'white',
        bold: true
      }
    });

    // Navigation menu
    this.widgets.menu = this.grid.set(1, 0, 10, 2, blessed.list, {
      label: ' Navigation ',
      items: [
        '1. Dashboard',
        '2. Components',
        '3. AI Assistant',
        '4. Analytics',
        '5. Settings',
        '',
        'H. Help',
        'Q. Quit'
      ],
      style: {
        fg: 'cyan',
        border: { fg: 'cyan' },
        selected: { bg: 'blue', fg: 'white' }
      },
      border: { type: 'line' },
      interactive: true,
      keys: true,
      mouse: true,
      vi: true
    });

    // Enable arrow keys on the menu
    this.widgets.menu.key(['up', 'down'], (ch, key) => {
      if (key.name === 'up') {
        this.widgets.menu.up();
      } else {
        this.widgets.menu.down();
      }
      this.screen.render();
    });

    // Handle menu selection
    this.widgets.menu.on('select', (item, index) => {
      switch (index) {
        case 0: this.showDashboard(); break;
        case 1: this.showComponentBrowser(); break;
        case 2: this.showAIAssistant(); break;
        case 3: this.showProjectAnalytics(); break;
        case 4: this.showSettings(); break;
        case 6: this.showHelp(); break;
        case 7: this.cleanup(); process.exit(0); break;
      }
    });

    // Register as focusable
    this.registerFocusableWidget(this.widgets.menu);

    // Metrics gauges
    this.widgets.gauge = this.grid.set(1, 2, 3, 3, contrib.gauge, {
      label: ' Code Reduction ',
      percent: this.metrics.codeReduction,
      stroke: 'green',
      fill: 'white'
    });

    // Real-time sparkline
    const sparklineData = Array(20).fill(0).map(() => Math.random() * 100);
    this.widgets.sparkline = this.grid.set(1, 5, 3, 5, contrib.sparkline, {
      label: ' Generation Performance ',
      tags: true,
      style: { fg: 'blue' }
    });
    this.widgets.sparkline.setData(['Performance'], [sparklineData]);

    // Activity log
    this.widgets.log = this.grid.set(4, 2, 4, 5, contrib.log, {
      label: ' Activity Log ',
      tags: true,
      border: { type: 'line', fg: 'cyan' }
    });

    // Component stats table
    this.widgets.table = this.grid.set(4, 7, 4, 5, contrib.table, {
      label: ' Component Statistics ',
      columnSpacing: 3,
      columnWidth: [15, 10, 10],
      data: {
        headers: ['Framework', 'Count', 'Reduction'],
        data: [
          ['React', '156', '73%'],
          ['Vue', '98', '71%'],
          ['Angular', '87', '69%'],
          ['Svelte', '45', '75%']
        ]
      },
      border: { type: 'line', fg: 'yellow' },
      style: { fg: 'white' }
    });

    // Status bar
    const statusBar = this.grid.set(11, 0, 1, 12, blessed.box, {
      content: ' ← → Navigate sections | ↑ ↓ Navigate items | Tab Focus | Enter Select | Q Quit ',
      align: 'center',
      style: { fg: 'gray', bg: 'black' }
    });

    // Start animations
    this.startDashboardAnimations();

    this.screen.render();
  }

  private startDashboardAnimations() {
    // Animate metrics
    this.animationInterval = setInterval(() => {
      // Update gauge
      const reduction = 60 + Math.random() * 35;
      this.widgets.gauge?.setPercent(reduction);

      // Update sparkline
      const newData = Array(20).fill(0).map(() => Math.random() * 100);
      this.widgets.sparkline?.setData(['Performance'], [newData]);

      // Add log entries
      const actions = [
        'Component generated: FormFactory',
        'AI optimization completed',
        'Code reduction: 76%',
        'Template cached successfully',
        'Framework analysis complete'
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      this.widgets.log?.log(chalk.green('✓ ') + randomAction);

      this.screen.render();
    }, 2000);
  }

  private showComponentBrowser() {
    this.currentView = 'components';
    this.currentSection = 1;
    this.clearWidgets();

    // Title
    this.widgets.title = this.grid.set(0, 0, 1, 12, blessed.box, {
      content: gradient.cristal(' Component Browser '),
      align: 'center',
      style: { fg: 'white', bold: true }
    });

    // Component categories
    const categories = this.grid.set(1, 0, 10, 3, blessed.list, {
      label: ' Categories ',
      items: [
        '📝 Forms',
        '📊 Tables',
        '📈 Charts',
        '🎛️ Dashboards',
        '🔐 Auth',
        '🎮 Game UI',
        '💳 E-commerce',
        '📱 Mobile',
        '🎨 Themes'
      ],
      style: {
        fg: 'cyan',
        border: { fg: 'cyan' },
        selected: { bg: 'blue', fg: 'white' }
      },
      border: { type: 'line' },
      interactive: true,
      mouse: true,
      keys: true,
      vi: true
    });

    // Enable arrow navigation
    categories.key(['up', 'down'], (ch, key) => {
      if (key.name === 'up') {
        categories.up();
      } else {
        categories.down();
      }
      this.screen.render();
    });

    // Register as focusable
    this.registerFocusableWidget(categories);

    // Component preview with ASCII art
    const preview = this.grid.set(1, 3, 5, 6, blessed.box, {
      label: ' Preview ',
      content: this.generateASCIIComponentPreview(),
      border: { type: 'line', fg: 'green' },
      style: { fg: 'white' }
    });

    // Component details
    const details = this.grid.set(6, 3, 5, 6, blessed.box, {
      label: ' Details ',
      content: `${chalk.yellow('FormFactory Component')}
      
${chalk.gray('Framework:')} React, Vue, Angular
${chalk.gray('Type:')} Dynamic Form Generator
${chalk.gray('Size:')} 2.1KB (gzipped)
${chalk.gray('Features:')} 
  • Validation
  • Dynamic Fields
  • Conditional Logic
  • Custom Styling
  
${chalk.green('Code Reduction: 76%')}`,
      border: { type: 'line', fg: 'yellow' },
      style: { fg: 'white' }
    });

    // Search box
    const search = this.grid.set(1, 9, 2, 3, blessed.textbox, {
      label: ' Search ',
      value: '',
      border: { type: 'line', fg: 'magenta' },
      style: { fg: 'white' },
      inputOnFocus: true
    });

    // Component list
    const componentList = this.grid.set(3, 9, 8, 3, blessed.list, {
      label: ' Components ',
      items: [
        'FormFactory',
        'TableFactory',
        'ChartFactory',
        'DashboardFactory',
        'AuthFactory',
        'ModalFactory',
        'NavigationFactory'
      ],
      style: {
        fg: 'white',
        border: { fg: 'magenta' },
        selected: { bg: 'magenta', fg: 'white' }
      },
      border: { type: 'line' },
      interactive: true,
      mouse: true,
      keys: true,
      vi: true
    });

    // Enable arrow navigation
    componentList.key(['up', 'down'], (ch, key) => {
      if (key.name === 'up') {
        componentList.up();
      } else {
        componentList.down();
      }
      this.screen.render();
    });

    // Register as focusable
    this.registerFocusableWidget(componentList);

    this.screen.render();
  }

  private generateASCIIComponentPreview(): string {
    return `
┌─────────────────────────┐
│  Dynamic Form Preview   │
├─────────────────────────┤
│ Name:    [___________]  │
│ Email:   [___________]  │
│ Role:    [▼ Select  ]  │
│                         │
│ ☐ Subscribe to updates  │
│                         │
│ [Submit] [Cancel]       │
└─────────────────────────┘

${chalk.gray('Generated with FormFactory')}`;
  }

  private showAIAssistant() {
    this.currentView = 'ai';
    this.currentSection = 2;
    this.clearWidgets();

    // Title
    this.widgets.title = this.grid.set(0, 0, 1, 12, blessed.box, {
      content: gradient.mind(' AI Assistant '),
      align: 'center',
      style: { fg: 'white', bold: true }
    });

    // AI chat interface
    const chatHistory = this.grid.set(1, 0, 7, 8, blessed.box, {
      label: ' Chat History ',
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white' }
    });

    // Input box
    const input = this.grid.set(8, 0, 2, 8, blessed.textbox, {
      label: ' Your Message ',
      value: '',
      border: { type: 'line', fg: 'green' },
      style: { fg: 'white' },
      inputOnFocus: true
    });

    // AI suggestions
    const suggestions = this.grid.set(1, 8, 4, 4, blessed.list, {
      label: ' Quick Actions ',
      items: [
        '🚀 Generate Component',
        '🔍 Analyze Project',
        '💡 Suggest Optimization',
        '📚 Show Examples',
        '🎨 Create Theme'
      ],
      style: {
        fg: 'yellow',
        border: { fg: 'yellow' },
        selected: { bg: 'yellow', fg: 'black' }
      },
      border: { type: 'line' },
      interactive: true
    });

    // Model selection
    const models = this.grid.set(5, 8, 3, 4, blessed.list, {
      label: ' AI Model ',
      items: [
        '• GPT-4o',
        '• Claude 3.5',
        '• Gemini Ultra',
        '• Llama 3',
        '• Local Model'
      ],
      style: {
        fg: 'magenta',
        border: { fg: 'magenta' },
        selected: { bg: 'magenta', fg: 'white' }
      },
      border: { type: 'line' }
    });

    // Status
    const status = this.grid.set(10, 0, 1, 12, blessed.box, {
      content: chalk.green(' AI Ready ') + ' - Type your request or select a quick action',
      style: { fg: 'white' }
    });

    // Add sample chat
    chatHistory.setContent(`${chalk.cyan('AI:')} Hello! I'm your Revolutionary UI assistant. How can I help you create amazing components today?

${chalk.yellow('You:')} Generate a dashboard component

${chalk.cyan('AI:')} I'll create a comprehensive dashboard component for you. Here's what I'll include:

${chalk.green('✓')} Real-time metrics display
${chalk.green('✓')} Interactive charts
${chalk.green('✓')} Data tables with sorting
${chalk.green('✓')} Responsive grid layout

Would you like me to proceed with React, Vue, or Angular?`);

    this.screen.render();
  }

  private showProjectAnalytics() {
    this.currentView = 'analytics';
    this.currentSection = 3;
    this.clearWidgets();

    // Title
    this.widgets.title = this.grid.set(0, 0, 1, 12, blessed.box, {
      content: gradient.passion(' Project Analytics '),
      align: 'center',
      style: { fg: 'white', bold: true }
    });

    // Line chart
    const lineData = {
      x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      y: [22, 35, 48, 52, 67, 72, 85]
    };

    this.widgets.line = this.grid.set(1, 0, 5, 6, contrib.line, {
      label: ' Components Generated ',
      showLegend: true,
      style: {
        line: 'cyan',
        text: 'white',
        baseline: 'yellow'
      },
      xLabelPadding: 3,
      xPadding: 5
    });
    this.widgets.line.setData([{
      title: 'This Week',
      x: lineData.x,
      y: lineData.y,
      style: { line: 'cyan' }
    }]);

    // Bar chart
    this.widgets.bar = this.grid.set(1, 6, 5, 6, contrib.bar, {
      label: ' Framework Usage ',
      barWidth: 6,
      barSpacing: 4,
      xOffset: 0,
      maxHeight: 15
    });
    this.widgets.bar.setData({
      titles: ['React', 'Vue', 'Angular', 'Svelte'],
      data: [15, 12, 8, 5]
    });

    // Donut chart
    this.widgets.donut = this.grid.set(6, 0, 5, 6, contrib.donut, {
      label: ' Component Types ',
      radius: 10,
      arcWidth: 3,
      data: [
        { percent: 35, label: 'Forms', color: 'green' },
        { percent: 25, label: 'Tables', color: 'cyan' },
        { percent: 20, label: 'Charts', color: 'yellow' },
        { percent: 20, label: 'Other', color: 'magenta' }
      ]
    });

    // Metrics
    const metrics = this.grid.set(6, 6, 5, 6, blessed.box, {
      label: ' Key Metrics ',
      content: `${chalk.green('Total Components:')} 342
${chalk.cyan('Average Reduction:')} 71%
${chalk.yellow('Time Saved:')} 127 hours
${chalk.magenta('Active Projects:')} 8

${chalk.bold('This Month:')}
• Components: +45
• New Users: +12
• AI Requests: 234
• Templates: +8`,
      border: { type: 'line', fg: 'white' },
      style: { fg: 'white' }
    });

    this.screen.render();
  }

  private showSettings() {
    this.currentView = 'settings';
    this.currentSection = 4;
    this.clearWidgets();

    // Title
    this.widgets.title = this.grid.set(0, 0, 1, 12, blessed.box, {
      content: gradient.retro(' Settings '),
      align: 'center',
      style: { fg: 'white', bold: true }
    });

    // Settings categories
    const categories = this.grid.set(1, 0, 10, 3, blessed.list, {
      label: ' Categories ',
      items: [
        '🎨 Appearance',
        '🤖 AI Configuration',
        '☁️ Cloud Services',
        '🔧 Build Options',
        '📊 Analytics',
        '🔐 Security',
        '🌍 Language',
        '💾 Backup'
      ],
      style: {
        fg: 'cyan',
        border: { fg: 'cyan' },
        selected: { bg: 'blue', fg: 'white' }
      },
      border: { type: 'line' },
      interactive: true
    });

    // Settings form
    const settingsForm = this.grid.set(1, 3, 10, 9, blessed.form, {
      label: ' AI Configuration ',
      border: { type: 'line', fg: 'green' },
      style: { fg: 'white' }
    });

    // Add form elements
    const apiKeyLabel = blessed.text({
      parent: settingsForm,
      top: 1,
      left: 2,
      content: 'OpenAI API Key:'
    });

    const apiKeyInput = blessed.textbox({
      parent: settingsForm,
      top: 2,
      left: 2,
      width: 50,
      height: 1,
      border: { type: 'line' },
      style: { fg: 'white', border: { fg: 'gray' } }
    });

    const modelLabel = blessed.text({
      parent: settingsForm,
      top: 4,
      left: 2,
      content: 'Default Model:'
    });

    const modelSelect = blessed.list({
      parent: settingsForm,
      top: 5,
      left: 2,
      width: 30,
      height: 5,
      items: ['GPT-4o', 'GPT-3.5', 'Claude 3.5', 'Gemini'],
      border: { type: 'line' },
      style: { 
        fg: 'white', 
        border: { fg: 'gray' },
        selected: { bg: 'blue', fg: 'white' }
      }
    });

    const saveButton = blessed.button({
      parent: settingsForm,
      bottom: 2,
      left: 2,
      content: ' Save Settings ',
      style: {
        fg: 'black',
        bg: 'green',
        focus: { bg: 'white' }
      }
    });

    this.screen.render();
  }

  private showHelp() {
    this.clearWidgets();

    const helpBox = this.grid.set(1, 1, 10, 10, blessed.box, {
      label: ' Help ',
      content: `${gradient.rainbow('Revolutionary UI Studio Help')}

${chalk.yellow('Navigation:')}
  1-5    Navigate to different sections
  Tab    Focus next element
  Enter  Select/Activate
  ESC    Go back / Cancel
  Q      Quit application

${chalk.cyan('Sections:')}
  1. Dashboard    - Overview and metrics
  2. Components   - Browse and preview
  3. AI Assistant - Chat and generate
  4. Analytics    - Project statistics
  5. Settings     - Configure studio

${chalk.green('Tips:')}
  • Use mouse to click on elements
  • Scroll with mouse wheel
  • Type / to search
  • Press ? for context help

${chalk.gray('Version 3.5.0 - Studio Edition')}`,
      border: { type: 'line', fg: 'yellow' },
      style: { fg: 'white' },
      scrollable: true,
      mouse: true
    });

    const closeButton = blessed.button({
      parent: this.screen,
      bottom: 2,
      left: 'center',
      content: ' Press any key to close ',
      style: {
        fg: 'black',
        bg: 'yellow',
        focus: { bg: 'white' }
      }
    });

    this.screen.render();

    // Close help on any key
    this.screen.once('keypress', () => {
      this.refresh();
    });
  }

  private clearWidgets() {
    // Stop animations
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = undefined;
    }

    // Clear all widgets
    Object.values(this.widgets).forEach(widget => {
      if (widget) {
        widget.destroy();
      }
    });
    this.widgets = {};

    // Clear focusable widgets
    this.focusableWidgets = [];
    this.currentFocusIndex = 0;

    // Clear screen children except grid
    this.screen.children.forEach(child => {
      if (child !== this.grid) {
        child.destroy();
      }
    });
  }

  private refresh() {
    switch (this.currentView) {
      case 'dashboard':
        this.showDashboard();
        break;
      case 'components':
        this.showComponentBrowser();
        break;
      case 'ai':
        this.showAIAssistant();
        break;
      case 'analytics':
        this.showProjectAnalytics();
        break;
      case 'settings':
        this.showSettings();
        break;
    }
  }

  private cleanup() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    this.screen.destroy();
  }

  public async start() {
    this.screen.render();
  }
}

// CLI entry point
const program = new Command();

program
  .name('revolutionary-studio')
  .description('Revolutionary UI Studio - Rich Terminal Interface')
  .version('3.5.0');

program
  .command('start', { isDefault: true })
  .description('Start Revolutionary UI Studio')
  .option('-d, --debug', 'Enable debug mode')
  .action(async (options) => {
    const studio = new RevolutionaryStudioCLI();
    await studio.start();
  });

program.parse(process.argv);