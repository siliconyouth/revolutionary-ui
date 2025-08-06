#!/usr/bin/env node
import React, { Component } from 'react';
import blessed from 'blessed';
import { render } from 'react-blessed';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Types
interface AppState {
  currentView: 'menu' | 'generate' | 'catalog' | 'ai' | 'settings' | 'analytics';
  menuIndex: number;
  logs: string[];
  loading: boolean;
  generationConfig: {
    name: string;
    framework: string;
    type: string;
  };
  catalogItems: Array<{
    name: string;
    description: string;
    downloads: number;
  }>;
  settings: {
    framework: string;
    aiProvider: string;
    theme: string;
  };
}

interface AppProps {
  screen: any;
}

// Main App Component
class App extends Component<AppProps, AppState> {
  private logTimer?: NodeJS.Timeout;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      currentView: 'menu',
      menuIndex: 0,
      logs: ['Welcome to Revolutionary UI Terminal'],
      loading: false,
      generationConfig: {
        name: '',
        framework: 'react',
        type: 'component'
      },
      catalogItems: [],
      settings: {
        framework: 'react',
        aiProvider: 'openai',
        theme: 'cyan'
      }
    };
  }

  componentDidMount() {
    const { screen } = this.props;
    
    // Set up keyboard handlers
    screen.key(['escape', 'q', 'C-c'], () => {
      if (this.state.currentView === 'menu') {
        return process.exit(0);
      }
      this.setState({ currentView: 'menu', menuIndex: 0 });
    });

    screen.key(['up', 'k'], () => {
      if (this.state.currentView === 'menu') {
        this.setState(prevState => ({
          menuIndex: Math.max(0, prevState.menuIndex - 1)
        }));
      }
    });

    screen.key(['down', 'j'], () => {
      if (this.state.currentView === 'menu') {
        this.setState(prevState => ({
          menuIndex: Math.min(this.getMenuItems().length - 1, prevState.menuIndex + 1)
        }));
      }
    });

    screen.key(['enter', 'space'], () => {
      if (this.state.currentView === 'menu') {
        this.handleMenuSelect();
      }
    });

    // Start activity simulation
    this.startActivityLog();
  }

  componentWillUnmount() {
    if (this.logTimer) {
      clearInterval(this.logTimer);
    }
  }

  getMenuItems() {
    return [
      { icon: '🏭', label: 'Generate Component', value: 'generate' },
      { icon: '📚', label: 'Browse Catalog', value: 'catalog' },
      { icon: '🤖', label: 'AI Assistant', value: 'ai' },
      { icon: '⚙️', label: 'Settings', value: 'settings' },
      { icon: '📊', label: 'Analytics', value: 'analytics' },
      { icon: '🚪', label: 'Exit', value: 'exit' }
    ];
  }

  handleMenuSelect = () => {
    const items = this.getMenuItems();
    const selected = items[this.state.menuIndex].value;

    if (selected === 'exit') {
      process.exit(0);
    } else {
      this.setState({ currentView: selected as any });
      this.addLog(`Navigated to ${selected}`);
    }
  };

  startActivityLog = () => {
    const activities = [
      'System initialized successfully',
      'Connected to Revolutionary UI servers',
      'Loading component catalog...',
      'AI models ready',
      'Cache warmed up',
      'Ready for component generation'
    ];

    let index = 0;
    this.logTimer = setInterval(() => {
      if (index < activities.length) {
        this.addLog(activities[index]);
        index++;
      }
    }, 1000);
  };

  addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    this.setState(prevState => ({
      logs: [...prevState.logs, `[${timestamp}] ${message}`].slice(-10)
    }));
  };

  generateComponent = async () => {
    this.setState({ loading: true });
    this.addLog('Starting component generation...');
    
    try {
      // Simulate component generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.addLog(`Generated ${this.state.generationConfig.name} component`);
      this.addLog('Component saved to ./src/components/');
      this.setState({ currentView: 'menu', loading: false });
    } catch (error) {
      this.addLog(`Error: ${error}`);
      this.setState({ loading: false });
    }
  };

  loadCatalog = async () => {
    this.setState({ loading: true });
    this.addLog('Loading component catalog...');
    
    try {
      // Simulate loading catalog
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.setState({
        catalogItems: [
          { name: 'DataTable', description: 'Advanced data table with sorting', downloads: 15420 },
          { name: 'FormBuilder', description: 'Dynamic form generator', downloads: 8932 },
          { name: 'Dashboard', description: 'Analytics dashboard template', downloads: 12653 },
          { name: 'Calendar', description: 'Event calendar component', downloads: 6789 },
          { name: 'KanbanBoard', description: 'Drag-and-drop task board', downloads: 9876 }
        ],
        loading: false
      });
      this.addLog('Catalog loaded successfully');
    } catch (error) {
      this.addLog(`Error loading catalog: ${error}`);
      this.setState({ loading: false });
    }
  };

  renderHeader() {
    return (
      <box
        top={0}
        left={0}
        width="100%"
        height={3}
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
          content="AI-Powered Component Generation System"
          style={{ fg: 'cyan' }}
        />
      </box>
    );
  }

  renderMenu() {
    const items = this.getMenuItems();
    
    return (
      <box
        top={3}
        left={0}
        width="50%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          label: { fg: 'white', bold: true }
        }}
        label=" Main Menu "
      >
        <list
          top={1}
          left={1}
          width="100%-3"
          height="100%-3"
          items={items.map((item, index) => {
            const selected = index === this.state.menuIndex;
            return selected 
              ? `{cyan-fg}▶ ${item.icon} ${item.label}{/cyan-fg}`
              : `  ${item.icon} ${item.label}`;
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
    return (
      <box
        top={3}
        left={0}
        width="100%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'green' },
          label: { fg: 'white', bold: true }
        }}
        label=" Component Generator "
      >
        <text
          top={1}
          left={2}
          content="Component Configuration:"
          style={{ fg: 'yellow', bold: true }}
        />
        <text
          top={3}
          left={2}
          content={`Name: ${this.state.generationConfig.name || 'MyComponent'}`}
          style={{ fg: 'white' }}
        />
        <text
          top={4}
          left={2}
          content={`Framework: ${this.state.generationConfig.framework}`}
          style={{ fg: 'white' }}
        />
        <text
          top={5}
          left={2}
          content={`Type: ${this.state.generationConfig.type}`}
          style={{ fg: 'white' }}
        />
        {this.state.loading ? (
          <text
            top={7}
            left="center"
            content="⚙️  Generating component..."
            style={{ fg: 'yellow' }}
          />
        ) : (
          <text
            top={7}
            left={2}
            content="Press Enter to generate, ESC to go back"
            style={{ fg: 'gray' }}
          />
        )}
      </box>
    );
  }

  renderCatalogView() {
    return (
      <box
        top={3}
        left={0}
        width="100%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'blue' },
          label: { fg: 'white', bold: true }
        }}
        label=" Component Catalog "
      >
        {this.state.catalogItems.length === 0 ? (
          <text
            top="center"
            left="center"
            content="Loading catalog..."
            style={{ fg: 'yellow' }}
          />
        ) : (
          <list
            top={1}
            left={1}
            width="100%-3"
            height="100%-3"
            items={this.state.catalogItems.map(item => 
              `📦 ${item.name} - ${item.description} (↓ ${item.downloads.toLocaleString()})`
            )}
            style={{
              item: { fg: 'white' },
              selected: { fg: 'cyan', bold: true }
            }}
          />
        )}
      </box>
    );
  }

  renderSettingsView() {
    return (
      <box
        top={3}
        left={0}
        width="100%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'magenta' },
          label: { fg: 'white', bold: true }
        }}
        label=" Settings "
      >
        <text
          top={1}
          left={2}
          content="Configuration:"
          style={{ fg: 'yellow', bold: true }}
        />
        <text
          top={3}
          left={2}
          content={`Default Framework: ${this.state.settings.framework}`}
          style={{ fg: 'white' }}
        />
        <text
          top={4}
          left={2}
          content={`AI Provider: ${this.state.settings.aiProvider}`}
          style={{ fg: 'white' }}
        />
        <text
          top={5}
          left={2}
          content={`Theme: ${this.state.settings.theme}`}
          style={{ fg: 'white' }}
        />
        <text
          top={7}
          left={2}
          content="Press ESC to go back"
          style={{ fg: 'gray' }}
        />
      </box>
    );
  }

  renderAnalyticsView() {
    return (
      <box
        top={3}
        left={0}
        width="100%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'yellow' },
          label: { fg: 'white', bold: true }
        }}
        label=" Analytics Dashboard "
      >
        <text
          top={1}
          left={2}
          content="Your Statistics:"
          style={{ fg: 'yellow', bold: true }}
        />
        <text
          top={3}
          left={2}
          content="Components Generated: 156"
          style={{ fg: 'green' }}
        />
        <text
          top={4}
          left={2}
          content="Lines of Code Saved: 12,420"
          style={{ fg: 'green' }}
        />
        <text
          top={5}
          left={2}
          content="Time Saved: 48.5 hours"
          style={{ fg: 'green' }}
        />
        <text
          top={6}
          left={2}
          content="Most Used Framework: React"
          style={{ fg: 'cyan' }}
        />
        <text
          top={8}
          left={2}
          content="Press ESC to go back"
          style={{ fg: 'gray' }}
        />
      </box>
    );
  }

  renderAIView() {
    return (
      <box
        top={3}
        left={0}
        width="100%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'purple' },
          label: { fg: 'white', bold: true }
        }}
        label=" AI Assistant "
      >
        <text
          top={1}
          left={2}
          content="🤖 AI-Powered Component Generation"
          style={{ fg: 'yellow', bold: true }}
        />
        <text
          top={3}
          left={2}
          content="Describe your component in natural language:"
          style={{ fg: 'white' }}
        />
        <text
          top={5}
          left={2}
          content="Example: 'Create a responsive pricing table with monthly/yearly toggle'"
          style={{ fg: 'gray' }}
        />
        <text
          top={7}
          left={2}
          content="Press Enter to start, ESC to go back"
          style={{ fg: 'gray' }}
        />
      </box>
    );
  }

  renderActivityLog() {
    return (
      <box
        top={3}
        left="50%"
        width="50%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'gray' },
          label: { fg: 'white' }
        }}
        label=" Activity Log "
        scrollable={true}
        alwaysScroll={true}
      >
        {this.state.logs.map((log, index) => (
          <text
            key={index}
            top={index}
            left={1}
            content={log}
            style={{ fg: 'green' }}
          />
        ))}
      </box>
    );
  }

  renderStatusBar() {
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
          content="Navigation: ↑↓ or j/k • Select: Enter • Back: ESC • Exit: q"
          style={{ fg: 'gray' }}
        />
      </box>
    );
  }

  render() {
    const { currentView } = this.state;

    // Load catalog when entering catalog view
    if (currentView === 'catalog' && this.state.catalogItems.length === 0) {
      setTimeout(() => this.loadCatalog(), 100);
    }

    // Handle component generation
    if (currentView === 'generate' && !this.state.loading) {
      this.props.screen.key(['enter'], () => {
        if (currentView === 'generate') {
          this.generateComponent();
        }
      });
    }

    return (
      <>
        {this.renderHeader()}
        
        {currentView === 'menu' && (
          <>
            {this.renderMenu()}
            {this.renderActivityLog()}
          </>
        )}
        
        {currentView === 'generate' && this.renderGenerateView()}
        {currentView === 'catalog' && this.renderCatalogView()}
        {currentView === 'ai' && this.renderAIView()}
        {currentView === 'settings' && this.renderSettingsView()}
        {currentView === 'analytics' && this.renderAnalyticsView()}
        
        {this.renderStatusBar()}
      </>
    );
  }
}

// Main entry point
function main() {
  // Create blessed screen
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Revolutionary UI Terminal',
    fullUnicode: true,
    dockBorders: true,
    warnings: false
  });

  // Render the app
  const component = render(<App screen={screen} />, screen);

  // Focus the screen
  screen.focus();
}

// Run if called directly
if (require.main === module) {
  main();
}

export { App, main };