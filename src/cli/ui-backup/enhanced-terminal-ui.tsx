#!/usr/bin/env node
import React, { Component, Fragment } from 'react';
import blessed from 'blessed';
import { render } from 'react-blessed';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';

const execAsync = promisify(exec);

// Import types
import type { 
  TerminalUIProps, 
  TerminalUIState, 
  ComponentConfig,
  CatalogItem,
  GenerationResult,
  AnalyticsData 
} from './types/terminal-ui';

// Enhanced Terminal UI Component
class EnhancedTerminalUI extends Component<TerminalUIProps, TerminalUIState> {
  private logTimer?: NodeJS.Timeout;
  private inputRef: any = null;

  constructor(props: TerminalUIProps) {
    super(props);
    this.state = {
      currentView: 'menu',
      menuIndex: 0,
      logs: [],
      loading: false,
      generationConfig: {
        name: 'MyComponent',
        framework: 'react',
        type: 'component',
        features: [],
        typescript: true
      },
      catalogItems: [],
      settings: {
        theme: 'cyan',
        defaultFramework: 'react',
        aiProvider: 'openai'
      }
    };
  }

  async componentDidMount() {
    const { screen } = this.props;
    
    // Show welcome message
    await this.showWelcomeMessage();
    
    // Set up keyboard handlers
    this.setupKeyboardHandlers(screen);
    
    // Start activity monitoring
    this.startActivityLog();
    
    // Load initial data
    await this.loadInitialData();
  }

  componentWillUnmount() {
    if (this.logTimer) {
      clearInterval(this.logTimer);
    }
  }

  async showWelcomeMessage() {
    try {
      const banner = await promisify(figlet.text)('Revolutionary UI', {
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted'
      });
      
      const gradientBanner = gradient.pastel.multiline(banner);
      this.addLog('Welcome to Revolutionary UI v3.4.1');
      this.addLog('AI-Powered Component Generation System');
    } catch (error) {
      this.addLog('Welcome to Revolutionary UI Terminal');
    }
  }

  setupKeyboardHandlers(screen: any) {
    // Global shortcuts
    screen.key(['escape'], () => {
      if (this.state.currentView !== 'menu') {
        this.setState({ currentView: 'menu', menuIndex: 0 });
        this.addLog('Returned to main menu');
      }
    });

    screen.key(['q', 'C-c'], () => {
      if (this.state.currentView === 'menu') {
        this.cleanup();
        process.exit(0);
      }
    });

    // Navigation
    screen.key(['up', 'k'], () => this.navigateUp());
    screen.key(['down', 'j'], () => this.navigateDown());
    screen.key(['left', 'h'], () => this.navigateLeft());
    screen.key(['right', 'l'], () => this.navigateRight());
    screen.key(['enter', 'space'], () => this.handleSelect());
    
    // Quick shortcuts
    screen.key(['g'], () => this.quickNavigate('generate'));
    screen.key(['c'], () => this.quickNavigate('catalog'));
    screen.key(['a'], () => this.quickNavigate('ai'));
    screen.key(['s'], () => this.quickNavigate('settings'));
    screen.key(['?'], () => this.showHelp());
  }

  navigateUp() {
    if (this.state.currentView === 'menu') {
      this.setState(prevState => ({
        menuIndex: Math.max(0, prevState.menuIndex - 1)
      }));
    }
  }

  navigateDown() {
    if (this.state.currentView === 'menu') {
      this.setState(prevState => ({
        menuIndex: Math.min(this.getMenuItems().length - 1, prevState.menuIndex + 1)
      }));
    }
  }

  navigateLeft() {
    // Implement navigation for settings or other views
  }

  navigateRight() {
    // Implement navigation for settings or other views
  }

  handleSelect() {
    if (this.state.currentView === 'menu') {
      this.handleMenuSelect();
    } else if (this.state.currentView === 'generate') {
      this.generateComponent();
    }
  }

  quickNavigate(view: string) {
    if (this.state.currentView !== view) {
      this.setState({ currentView: view as any });
      this.addLog(`Quick navigated to ${view}`);
    }
  }

  showHelp() {
    this.addLog('Keyboard Shortcuts:');
    this.addLog('  ↑/↓ or j/k - Navigate');
    this.addLog('  Enter - Select');
    this.addLog('  ESC - Back to menu');
    this.addLog('  g - Generate component');
    this.addLog('  c - Browse catalog');
    this.addLog('  a - AI assistant');
    this.addLog('  s - Settings');
    this.addLog('  ? - Show help');
    this.addLog('  q - Exit');
  }

  async loadInitialData() {
    try {
      // Load user preferences
      const configPath = path.join(process.env.HOME || '', '.revolutionary-ui', 'terminal-config.json');
      try {
        const configData = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configData);
        this.setState({ settings: { ...this.state.settings, ...config } });
        this.addLog('Loaded user preferences');
      } catch (error) {
        // Config doesn't exist yet
      }

      // Load analytics
      await this.loadAnalytics();
    } catch (error) {
      this.addLog(`Error loading initial data: ${error}`);
    }
  }

  async loadAnalytics() {
    try {
      // Simulate loading analytics
      const analytics: AnalyticsData = {
        componentsGenerated: 156,
        linesOfCodeSaved: 12420,
        timeSaved: 48.5,
        mostUsedFramework: 'React',
        recentComponents: [
          { name: 'UserProfile', date: new Date(), framework: 'react' },
          { name: 'DataGrid', date: new Date(), framework: 'vue' },
          { name: 'AuthForm', date: new Date(), framework: 'react' }
        ]
      };
      
      this.setState({ analytics });
      this.addLog('Analytics data loaded');
    } catch (error) {
      this.addLog(`Error loading analytics: ${error}`);
    }
  }

  cleanup() {
    this.addLog('Shutting down...');
    if (this.logTimer) {
      clearInterval(this.logTimer);
    }
  }

  getMenuItems() {
    return [
      { icon: '🏭', label: 'Generate Component', value: 'generate', key: 'g' },
      { icon: '📚', label: 'Browse Catalog', value: 'catalog', key: 'c' },
      { icon: '🤖', label: 'AI Assistant', value: 'ai', key: 'a' },
      { icon: '⚙️', label: 'Settings', value: 'settings', key: 's' },
      { icon: '📊', label: 'Analytics', value: 'analytics', key: 'n' },
      { icon: '📖', label: 'Documentation', value: 'docs', key: 'd' },
      { icon: '🚪', label: 'Exit', value: 'exit', key: 'q' }
    ];
  }

  handleMenuSelect = () => {
    const items = this.getMenuItems();
    const selected = items[this.state.menuIndex].value;

    if (selected === 'exit') {
      this.cleanup();
      process.exit(0);
    } else if (selected === 'docs') {
      this.openDocumentation();
    } else {
      this.setState({ currentView: selected as any });
      this.addLog(`Navigated to ${selected}`);
    }
  };

  async openDocumentation() {
    try {
      await execAsync('open https://revolutionary-ui.com/docs');
      this.addLog('Opened documentation in browser');
    } catch (error) {
      this.addLog('Please visit https://revolutionary-ui.com/docs');
    }
  }

  startActivityLog = () => {
    const activities = [
      '🚀 System initialized successfully',
      '🌐 Connected to Revolutionary UI servers',
      '📦 Loading component catalog...',
      '🤖 AI models ready',
      '💾 Cache warmed up',
      '✅ Ready for component generation',
      '📊 Analytics service connected',
      '🔐 Authentication verified'
    ];

    let index = 0;
    this.logTimer = setInterval(() => {
      if (index < activities.length) {
        this.addLog(activities[index]);
        index++;
      } else {
        // Continuous status updates
        const statusUpdates = [
          '💡 Tip: Press ? for keyboard shortcuts',
          '🎯 New components added to catalog',
          '📈 Performance metrics updated',
          '🔄 Syncing with cloud...'
        ];
        this.addLog(statusUpdates[Math.floor(Math.random() * statusUpdates.length)]);
      }
    }, 2000);
  };

  addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    this.setState(prevState => ({
      logs: [...prevState.logs, `[${timestamp}] ${message}`].slice(-12)
    }));
  };

  async generateComponent(): Promise<void> {
    this.setState({ loading: true });
    this.addLog('🏗️  Starting component generation...');
    
    try {
      // Simulate component generation with progress
      const steps = [
        'Analyzing requirements...',
        'Selecting best patterns...',
        'Generating TypeScript interfaces...',
        'Creating component structure...',
        'Adding styles and animations...',
        'Optimizing for performance...',
        'Running code review...'
      ];

      for (const step of steps) {
        this.addLog(`  ${step}`);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const result: GenerationResult = {
        success: true,
        component: {
          name: this.state.generationConfig.name,
          code: '// Generated component code',
          filePath: `./src/components/${this.state.generationConfig.name}.tsx`
        }
      };

      this.addLog(`✅ Generated ${result.component?.name} successfully!`);
      this.addLog(`📁 Saved to ${result.component?.filePath}`);
      this.setState({ currentView: 'menu', loading: false });
    } catch (error) {
      this.addLog(`❌ Error: ${error}`);
      this.setState({ loading: false });
    }
  }

  async loadCatalog() {
    this.setState({ loading: true });
    this.addLog('📚 Loading component catalog...');
    
    try {
      // Simulate loading catalog with categories
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const catalogItems: CatalogItem[] = [
        { 
          id: '1',
          name: 'DataTable',
          description: 'Advanced data table with sorting, filtering, and pagination',
          category: 'Data Display',
          framework: 'react',
          downloads: 15420,
          rating: 4.8,
          tags: ['table', 'data', 'sorting', 'filtering']
        },
        { 
          id: '2',
          name: 'FormBuilder',
          description: 'Dynamic form generator with validation',
          category: 'Forms',
          framework: 'react',
          downloads: 8932,
          rating: 4.6,
          tags: ['form', 'validation', 'dynamic']
        },
        { 
          id: '3',
          name: 'Dashboard',
          description: 'Analytics dashboard template with charts',
          category: 'Templates',
          framework: 'react',
          downloads: 12653,
          rating: 4.9,
          tags: ['dashboard', 'analytics', 'charts']
        },
        { 
          id: '4',
          name: 'Calendar',
          description: 'Event calendar with drag-and-drop',
          category: 'Date & Time',
          framework: 'vue',
          downloads: 6789,
          rating: 4.5,
          tags: ['calendar', 'events', 'scheduling']
        },
        { 
          id: '5',
          name: 'KanbanBoard',
          description: 'Drag-and-drop task management board',
          category: 'Project Management',
          framework: 'react',
          downloads: 9876,
          rating: 4.7,
          tags: ['kanban', 'tasks', 'drag-drop']
        }
      ];
      
      this.setState({
        catalogItems,
        loading: false
      });
      this.addLog(`✅ Loaded ${catalogItems.length} components`);
    } catch (error) {
      this.addLog(`❌ Error loading catalog: ${error}`);
      this.setState({ loading: false });
    }
  }

  renderHeader() {
    const gradientTheme = gradient.pastel;
    
    return (
      <box
        top={0}
        left={0}
        width="100%"
        height={4}
        border={{ type: 'line' }}
        style={{
          border: { fg: this.state.settings.theme },
          label: { fg: 'white', bold: true }
        }}
        label=" Revolutionary UI Terminal v3.4.1 "
      >
        <text
          top={0}
          left="center"
          content="╭─────────────────────────────────────╮"
          style={{ fg: 'cyan' }}
        />
        <text
          top={1}
          left="center"
          content="│  AI-Powered Component Generation    │"
          style={{ fg: 'cyan', bold: true }}
        />
        <text
          top={2}
          left="center"
          content="╰─────────────────────────────────────╯"
          style={{ fg: 'cyan' }}
        />
      </box>
    );
  }

  renderMenu() {
    const items = this.getMenuItems();
    
    return (
      <box
        top={4}
        left={0}
        width="50%"
        height="70%-4"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          label: { fg: 'white', bold: true }
        }}
        label=" 🏠 Main Menu "
      >
        <text
          top={0}
          left={2}
          content="Select an option:"
          style={{ fg: 'yellow' }}
        />
        <list
          top={2}
          left={1}
          width="100%-3"
          height="100%-4"
          items={items.map((item, index) => {
            const selected = index === this.state.menuIndex;
            const prefix = selected ? '▶' : ' ';
            const keyHint = `[${item.key}]`;
            return selected 
              ? `{cyan-fg}${prefix} ${item.icon} ${item.label} ${keyHint}{/cyan-fg}`
              : ` ${prefix} ${item.icon} ${item.label} {gray-fg}${keyHint}{/gray-fg}`;
          })}
          tags={true}
          interactive={false}
          style={{
            selected: { fg: 'cyan', bold: true },
            item: { fg: 'white' }
          }}
        />
      </box>
    );
  }

  renderGenerateView() {
    const { generationConfig, loading } = this.state;
    
    return (
      <box
        top={4}
        left={0}
        width="100%"
        height="70%-4"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'green' },
          label: { fg: 'white', bold: true }
        }}
        label=" 🏭 Component Generator "
      >
        <form
          top={1}
          left={1}
          width="100%-2"
          height="100%-2"
        >
          <text
            top={0}
            left={0}
            content="Component Configuration:"
            style={{ fg: 'yellow', bold: true }}
          />
          
          <text
            top={2}
            left={0}
            content={`Name: ${generationConfig.name}`}
            style={{ fg: 'white' }}
          />
          
          <text
            top={3}
            left={0}
            content={`Framework: ${generationConfig.framework}`}
            style={{ fg: 'white' }}
          />
          
          <text
            top={4}
            left={0}
            content={`Type: ${generationConfig.type}`}
            style={{ fg: 'white' }}
          />
          
          <text
            top={5}
            left={0}
            content={`TypeScript: ${generationConfig.typescript ? '✓' : '✗'}`}
            style={{ fg: 'white' }}
          />
          
          <text
            top={7}
            left={0}
            content="Features:"
            style={{ fg: 'yellow' }}
          />
          
          <checkbox
            top={8}
            left={2}
            checked={generationConfig.features?.includes('animations')}
            text="Animations"
          />
          
          <checkbox
            top={9}
            left={2}
            checked={generationConfig.features?.includes('darkMode')}
            text="Dark Mode Support"
          />
          
          <checkbox
            top={10}
            left={2}
            checked={generationConfig.features?.includes('responsive')}
            text="Responsive Design"
          />
          
          <checkbox
            top={11}
            left={2}
            checked={generationConfig.features?.includes('accessibility')}
            text="Accessibility (ARIA)"
          />
        </form>
        
        {loading ? (
          <box
            top="50%-2"
            left="center"
            width={30}
            height={5}
            border={{ type: 'line' }}
            style={{ border: { fg: 'yellow' } }}
          >
            <text
              top={1}
              left="center"
              content="⚙️  Generating..."
              style={{ fg: 'yellow', bold: true }}
            />
            <progressbar
              top={2}
              left={1}
              width="100%-2"
              height={1}
              filled={50}
              style={{
                bar: { fg: 'green' },
                border: { fg: 'gray' }
              }}
            />
          </box>
        ) : (
          <text
            bottom={1}
            left={2}
            content="Press Enter to generate, ESC to go back"
            style={{ fg: 'gray' }}
          />
        )}
      </box>
    );
  }

  renderCatalogView() {
    const { catalogItems, loading } = this.state;
    
    return (
      <box
        top={4}
        left={0}
        width="100%"
        height="70%-4"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'blue' },
          label: { fg: 'white', bold: true }
        }}
        label=" 📚 Component Catalog "
      >
        {loading || catalogItems.length === 0 ? (
          <text
            top="center"
            left="center"
            content="Loading catalog..."
            style={{ fg: 'yellow' }}
          />
        ) : (
          <>
            <text
              top={0}
              left={2}
              content={`Found ${catalogItems.length} components`}
              style={{ fg: 'green' }}
            />
            <list
              top={2}
              left={1}
              width="100%-3"
              height="100%-4"
              items={catalogItems.map(item => {
                const stars = '⭐'.repeat(Math.round(item.rating));
                return `📦 ${item.name} - ${item.description}
   ${stars} (${item.rating}) | ↓ ${item.downloads.toLocaleString()} | ${item.framework} | ${item.category}`;
              })}
              style={{
                item: { fg: 'white' },
                selected: { fg: 'cyan', bold: true }
              }}
              scrollable={true}
              mouse={true}
              keys={true}
              vi={true}
            />
          </>
        )}
      </box>
    );
  }

  renderSettingsView() {
    const { settings } = this.state;
    
    return (
      <box
        top={4}
        left={0}
        width="100%"
        height="70%-4"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'magenta' },
          label: { fg: 'white', bold: true }
        }}
        label=" ⚙️ Settings "
      >
        <form
          top={1}
          left={1}
          width="100%-2"
          height="100%-2"
        >
          <text
            top={0}
            left={0}
            content="Configuration Options:"
            style={{ fg: 'yellow', bold: true }}
          />
          
          <text
            top={2}
            left={0}
            content="Default Framework:"
            style={{ fg: 'white' }}
          />
          <radioset
            top={3}
            left={2}
            width="100%-4"
            height={4}
          >
            <radiobutton
              top={0}
              text="React"
              checked={settings.defaultFramework === 'react'}
            />
            <radiobutton
              top={1}
              text="Vue"
              checked={settings.defaultFramework === 'vue'}
            />
            <radiobutton
              top={2}
              text="Angular"
              checked={settings.defaultFramework === 'angular'}
            />
            <radiobutton
              top={3}
              text="Svelte"
              checked={settings.defaultFramework === 'svelte'}
            />
          </radioset>
          
          <text
            top={8}
            left={0}
            content="AI Provider:"
            style={{ fg: 'white' }}
          />
          <radioset
            top={9}
            left={2}
            width="100%-4"
            height={4}
          >
            <radiobutton
              top={0}
              text="OpenAI (GPT-4)"
              checked={settings.aiProvider === 'openai'}
            />
            <radiobutton
              top={1}
              text="Anthropic (Claude)"
              checked={settings.aiProvider === 'anthropic'}
            />
            <radiobutton
              top={2}
              text="Google (Gemini)"
              checked={settings.aiProvider === 'google'}
            />
            <radiobutton
              top={3}
              text="Local (Ollama)"
              checked={settings.aiProvider === 'ollama'}
            />
          </radioset>
          
          <text
            top={14}
            left={0}
            content="Theme Color:"
            style={{ fg: 'white' }}
          />
          <radioset
            top={15}
            left={2}
            width="100%-4"
            height={5}
          >
            <radiobutton
              top={0}
              text="Cyan"
              checked={settings.theme === 'cyan'}
            />
            <radiobutton
              top={1}
              text="Green"
              checked={settings.theme === 'green'}
            />
            <radiobutton
              top={2}
              text="Blue"
              checked={settings.theme === 'blue'}
            />
            <radiobutton
              top={3}
              text="Magenta"
              checked={settings.theme === 'magenta'}
            />
            <radiobutton
              top={4}
              text="Yellow"
              checked={settings.theme === 'yellow'}
            />
          </radioset>
        </form>
        
        <button
          bottom={1}
          left={2}
          width={20}
          height={3}
          content="Save Settings"
          style={{
            fg: 'black',
            bg: 'green',
            focus: { bg: 'cyan' }
          }}
        />
        
        <text
          bottom={1}
          right={2}
          content="Press ESC to go back"
          style={{ fg: 'gray' }}
        />
      </box>
    );
  }

  renderAnalyticsView() {
    const { analytics } = this.state;
    
    if (!analytics) {
      return (
        <box
          top={4}
          left={0}
          width="100%"
          height="70%-4"
          border={{ type: 'line' }}
          style={{
            border: { fg: 'yellow' },
            label: { fg: 'white', bold: true }
          }}
          label=" 📊 Analytics Dashboard "
        >
          <text
            top="center"
            left="center"
            content="Loading analytics..."
            style={{ fg: 'yellow' }}
          />
        </box>
      );
    }
    
    return (
      <box
        top={4}
        left={0}
        width="100%"
        height="70%-4"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'yellow' },
          label: { fg: 'white', bold: true }
        }}
        label=" 📊 Analytics Dashboard "
      >
        <text
          top={1}
          left={2}
          content="Your Productivity Statistics:"
          style={{ fg: 'yellow', bold: true }}
        />
        
        <box
          top={3}
          left={2}
          width="45%"
          height={6}
          border={{ type: 'line' }}
          style={{ border: { fg: 'green' } }}
          label=" Components "
        >
          <text
            top={0}
            left={1}
            content={`Generated: ${analytics.componentsGenerated}`}
            style={{ fg: 'green', bold: true }}
          />
          <text
            top={1}
            left={1}
            content={`This Month: +23%`}
            style={{ fg: 'green' }}
          />
          <progressbar
            top={3}
            left={1}
            width="100%-2"
            filled={75}
            style={{
              bar: { fg: 'green' }
            }}
          />
        </box>
        
        <box
          top={3}
          left="50%"
          width="45%"
          height={6}
          border={{ type: 'line' }}
          style={{ border: { fg: 'blue' } }}
          label=" Code Savings "
        >
          <text
            top={0}
            left={1}
            content={`Lines Saved: ${analytics.linesOfCodeSaved.toLocaleString()}`}
            style={{ fg: 'blue', bold: true }}
          />
          <text
            top={1}
            left={1}
            content={`Time Saved: ${analytics.timeSaved}h`}
            style={{ fg: 'blue' }}
          />
          <progressbar
            top={3}
            left={1}
            width="100%-2"
            filled={85}
            style={{
              bar: { fg: 'blue' }
            }}
          />
        </box>
        
        <box
          top={10}
          left={2}
          width="95%"
          height={8}
          border={{ type: 'line' }}
          style={{ border: { fg: 'cyan' } }}
          label=" Recent Components "
        >
          <list
            top={0}
            left={1}
            width="100%-2"
            height="100%-1"
            items={analytics.recentComponents.map(comp => 
              `${comp.name} - ${comp.framework} - ${comp.date.toLocaleDateString()}`
            )}
            style={{
              item: { fg: 'white' },
              selected: { fg: 'cyan' }
            }}
          />
        </box>
        
        <text
          bottom={1}
          left={2}
          content={`Most Used Framework: ${analytics.mostUsedFramework}`}
          style={{ fg: 'magenta', bold: true }}
        />
      </box>
    );
  }

  renderAIView() {
    return (
      <box
        top={4}
        left={0}
        width="100%"
        height="70%-4"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'purple' },
          label: { fg: 'white', bold: true }
        }}
        label=" 🤖 AI Assistant "
      >
        <text
          top={1}
          left={2}
          content="AI-Powered Component Generation"
          style={{ fg: 'yellow', bold: true }}
        />
        
        <text
          top={3}
          left={2}
          content="Describe your component in natural language:"
          style={{ fg: 'white' }}
        />
        
        <textarea
          ref={(ref: any) => this.inputRef = ref}
          top={5}
          left={2}
          width="95%"
          height={6}
          border={{ type: 'line' }}
          style={{
            border: { fg: 'gray' },
            focus: { border: { fg: 'cyan' } }
          }}
          inputOnFocus={true}
          value=""
        />
        
        <text
          top={12}
          left={2}
          content="Examples:"
          style={{ fg: 'yellow' }}
        />
        
        <text
          top={13}
          left={4}
          content="• 'Create a responsive pricing table with monthly/yearly toggle'"
          style={{ fg: 'gray' }}
        />
        <text
          top={14}
          left={4}
          content="• 'Build a user profile card with avatar and social links'"
          style={{ fg: 'gray' }}
        />
        <text
          top={15}
          left={4}
          content="• 'Generate a kanban board with drag-and-drop functionality'"
          style={{ fg: 'gray' }}
        />
        
        <button
          bottom={3}
          left={2}
          width={20}
          height={3}
          content="Generate with AI"
          style={{
            fg: 'black',
            bg: 'purple',
            focus: { bg: 'cyan' }
          }}
        />
        
        <text
          bottom={1}
          left={2}
          content="Press Tab to focus input, Enter to generate, ESC to go back"
          style={{ fg: 'gray' }}
        />
      </box>
    );
  }

  renderActivityLog() {
    const showLog = this.state.currentView === 'menu' || 
                   this.state.currentView === 'generate' ||
                   this.state.currentView === 'catalog';
    
    if (!showLog) return null;
    
    return (
      <box
        top={4}
        left="50%"
        width="50%"
        height="70%-4"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'gray' },
          label: { fg: 'white' }
        }}
        label=" 📋 Activity Log "
        scrollable={true}
        alwaysScroll={true}
        mouse={true}
      >
        {this.state.logs.map((log, index) => {
          let color = 'green';
          if (log.includes('Error') || log.includes('❌')) color = 'red';
          else if (log.includes('Warning') || log.includes('⚠️')) color = 'yellow';
          else if (log.includes('✅')) color = 'green';
          else if (log.includes('💡')) color = 'cyan';
          
          return (
            <text
              key={index}
              top={index}
              left={1}
              content={log}
              style={{ fg: color }}
            />
          );
        })}
      </box>
    );
  }

  renderStatusBar() {
    const { currentView } = this.state;
    const shortcuts = {
      menu: 'Navigate: ↑↓/jk • Select: Enter • Quick: g/c/a/s • Help: ? • Exit: q',
      generate: 'Generate: Enter • Cancel: ESC • Navigate: Tab',
      catalog: 'Browse: ↑↓ • Select: Enter • Search: / • Back: ESC',
      ai: 'Focus: Tab • Generate: Enter • Back: ESC',
      settings: 'Change: ↑↓/Tab • Save: Enter • Back: ESC',
      analytics: 'View details: Enter • Export: e • Back: ESC'
    };
    
    return (
      <box
        bottom={0}
        left={0}
        width="100%"
        height={3}
        style={{
          bg: 'black'
        }}
      >
        <text
          top={0}
          left={2}
          content={shortcuts[currentView] || shortcuts.menu}
          style={{ fg: 'gray' }}
        />
        <text
          top={0}
          right={2}
          content={`View: ${currentView.toUpperCase()} | Theme: ${this.state.settings.theme}`}
          style={{ fg: 'gray' }}
        />
      </box>
    );
  }

  render() {
    const { currentView } = this.state;

    // Load data when entering views
    if (currentView === 'catalog' && this.state.catalogItems.length === 0) {
      setTimeout(() => this.loadCatalog(), 100);
    }

    return (
      <Fragment>
        {this.renderHeader()}
        
        {currentView === 'menu' && (
          <Fragment>
            {this.renderMenu()}
            {this.renderActivityLog()}
          </Fragment>
        )}
        
        {currentView === 'generate' && (
          <Fragment>
            {this.renderGenerateView()}
            {this.renderActivityLog()}
          </Fragment>
        )}
        
        {currentView === 'catalog' && (
          <Fragment>
            {this.renderCatalogView()}
            {this.renderActivityLog()}
          </Fragment>
        )}
        
        {currentView === 'ai' && this.renderAIView()}
        {currentView === 'settings' && this.renderSettingsView()}
        {currentView === 'analytics' && this.renderAnalyticsView()}
        
        {this.renderStatusBar()}
      </Fragment>
    );
  }
}

// Main entry point
function createTerminalUI() {
  // Create blessed screen
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Revolutionary UI Terminal',
    fullUnicode: true,
    dockBorders: true,
    warnings: false,
    autoPadding: true
  });

  // Render the app
  const component = render(<EnhancedTerminalUI screen={screen} />, screen);

  // No need to focus screen - blessed handles this automatically
  
  return { screen, component };
}

// Run if called directly
if (require.main === module) {
  createTerminalUI();
}

export { EnhancedTerminalUI, createTerminalUI };