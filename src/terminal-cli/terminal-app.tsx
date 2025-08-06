/**
 * Terminal App - Main Terminal UI Application
 * Clean implementation using react-blessed
 */

import React, { useState, useEffect } from 'react';
import blessed from 'blessed';
import { render } from 'react-blessed';
import { MainMenu } from './views/main-menu';
import { GenerateView } from './views/generate-view';
import { CatalogView } from './views/catalog-view';
import { AIService } from './services/ai-service';

// JSX declarations for blessed elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: any;
      list: any;
      log: any;
      text: any;
      progressbar: any;
      table: any;
      form: any;
      textbox: any;
      textarea: any;
      button: any;
      checkbox: any;
    }
  }
}

// Terminal UI Context
export interface AppContext {
  screen: blessed.Widgets.Screen;
  aiService: AIService;
  navigate: (view: ViewType) => void;
  addLog: (message: string) => void;
  logs: string[];
}

export type ViewType = 'main' | 'generate' | 'catalog' | 'settings' | 'exit';

interface AppState {
  currentView: ViewType;
  logs: string[];
  isReady: boolean;
}

// Main App Component
const TerminalApp: React.FC<{ screen: blessed.Widgets.Screen; aiService: AIService }> = ({ screen, aiService }) => {
  const [state, setState] = useState<AppState>({
    currentView: 'main',
    logs: ['Welcome to Revolutionary UI', 'Terminal UI initialized'],
    isReady: false
  });

  // Initialize app
  useEffect(() => {
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, isReady: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const navigate = (view: ViewType) => {
    if (view === 'exit') {
      process.exit(0);
    }
    setState(prev => ({ ...prev, currentView: view }));
    addLog(`Navigated to ${view}`);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, `[${timestamp}] ${message}`].slice(-50)
    }));
  };

  const context: AppContext = {
    screen,
    aiService,
    navigate,
    addLog,
    logs: state.logs
  };

  // Loading screen
  if (!state.isReady) {
    return React.createElement('box', {
      top: 'center',
      left: 'center',
      width: '50%',
      height: 5,
      border: { type: 'line' },
      style: { border: { fg: 'cyan' } },
      content: '{center}Initializing Revolutionary UI...{/center}',
      tags: true
    });
  }

  // Render current view
  return (
    <>
      {/* Header */}
      <box
        top={0}
        left={0}
        width="100%"
        height={4}
        border={{ type: 'line' }}
        style={{ 
          border: { fg: 'cyan' },
          fg: 'white'
        }}
        label=" Revolutionary UI v3.4.1 "
      >
        {'{center}AI-Powered Component Generation{/center}\n{center}60-95% Code Reduction{/center}'}
      </box>

      {/* Main Content */}
      {state.currentView === 'main' && <MainMenu context={context} />}
      {state.currentView === 'generate' && <GenerateView context={context} />}
      {state.currentView === 'catalog' && <CatalogView context={context} />}
      
      {/* Status Bar */}
      <box
        bottom={0}
        left={0}
        width="100%"
        height={3}
        border={{ type: 'line' }}
        style={{ border: { fg: 'cyan' } }}
      >
        {state.currentView === 'main' 
          ? '{center}↑↓: Navigate | Enter: Select | q: Quit{/center}'
          : '{center}ESC: Back | ↑↓: Navigate | Enter: Select{/center}'}
      </box>
    </>
  );
};

// Create and export the terminal app
export async function createTerminalApp() {
  // Create blessed screen
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Revolutionary UI',
    warnings: false,
    fullUnicode: true,
    terminal: process.env.TERM || 'xterm',
    cursor: {
      artificial: true,
      shape: 'block',
      blink: false,
      color: null
    } as any
  });

  // Initialize AI service
  const aiService = new AIService();
  await aiService.initialize();

  // Global key handlers
  screen.key(['q', 'C-c'], () => {
    process.exit(0);
  });

  // Render React app
  render(<TerminalApp screen={screen} aiService={aiService} />, screen);

  // Initial render
  screen.render();

  return screen;
}