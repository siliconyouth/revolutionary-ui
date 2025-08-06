/**
 * Terminal UI Application
 * Main entry point for the Terminal UI mode
 */

import React, { useState, useEffect } from 'react';
import blessed from 'blessed';
import { render } from 'react-blessed';
import { AIService } from '../../ai/services/ai-service.js';
import { DatabaseResourceService } from '../../services/database-resource-service.js';
import { EnhancedResourceService } from '../../services/enhanced-resource-service.js';
import { CatalogView } from './views/catalog-view.js';
import { SettingsView } from './views/settings-view.js';
import { AnalyticsView } from './views/analytics-view.js';
import { SearchView } from './views/search-view.js';

// Type declarations for react-blessed
declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: any;
      list: any;
      log: any;
      progressbar: any;
      form: any;
      textbox: any;
      textarea: any;
      checkbox: any;
      button: any;
      table: any;
    }
  }
}

interface AppState {
  currentView: 'main' | 'generate' | 'catalog' | 'settings' | 'analytics' | 'search';
  logs: string[];
  selectedIndex: number;
  componentConfig?: {
    name: string;
    type: string;
    framework: string;
    uiLibrary: string;
  };
  generationStep: number;
  progress: number;
}

interface Props {
  screen: blessed.Widgets.Screen;
  aiService?: AIService;
}

const TerminalUIApp: React.FC<Props> = ({ screen, aiService }) => {
  const [state, setState] = useState<AppState>({
    currentView: 'main',
    logs: [
      'Terminal UI initialized',
      `AI Service: ${aiService ? 'Connected' : 'Not configured'}`
    ],
    selectedIndex: 0,
    generationStep: 0,
    progress: 0
  });

  // Initialize services
  const [dbService] = useState(() => DatabaseResourceService.getInstance());
  const [resourceService] = useState(() => EnhancedResourceService.getInstance());

  const menuItems = [
    '🚀 Generate Component',
    '📊 Browse Catalog',
    '⚙️  Configure Settings',
    '📈 View Analytics',
    '🔍 Search Components',
    '💾 Manage Projects',
    '🤝 Team Collaboration',
    '☁️  Cloud Sync',
    '📦 Marketplace',
    '❌ Exit'
  ];

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, `[${timestamp}] ${message}`].slice(-50)
    }));
    // Force screen render after log update
    if (screen) {
      process.nextTick(() => {
        screen.render();
      });
    }
  };

  const handleSelect = (item: any, index: number) => {
    addLog(`Selected: ${menuItems[index]}`);
    
    if (index === menuItems.length - 1) {
      // Exit
      process.exit(0);
    }
    
    // Handle other menu items
    switch (index) {
      case 0:
        setState(prev => ({ ...prev, currentView: 'generate' }));
        break;
      case 1:
        setState(prev => ({ ...prev, currentView: 'catalog' }));
        break;
      case 2:
        setState(prev => ({ ...prev, currentView: 'settings' }));
        break;
      case 3:
        setState(prev => ({ ...prev, currentView: 'analytics' }));
        break;
      case 4:
        setState(prev => ({ ...prev, currentView: 'search' }));
        break;
      default:
        addLog('Feature coming soon!');
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!screen) return;

    const handleKey = (ch: string, key: any) => {
      if (!key) return;
      
      if (state.currentView === 'main') {
        if (key.name === 'up') {
          setState(prev => ({
            ...prev,
            selectedIndex: Math.max(0, prev.selectedIndex - 1)
          }));
        } else if (key.name === 'down') {
          setState(prev => ({
            ...prev,
            selectedIndex: Math.min(menuItems.length - 1, prev.selectedIndex + 1)
          }));
        } else if (key.name === 'return' || key.name === 'enter') {
          handleSelect(null, state.selectedIndex);
        }
      } else if (state.currentView === 'generate') {
        if (key.name === 'escape') {
          setState(prev => ({ ...prev, currentView: 'main', generationStep: 0, progress: 0 }));
          addLog('Returned to main menu');
        } else if (key.name === 'return' || key.name === 'enter') {
          if (state.generationStep < 5) {
            setState(prev => ({ ...prev, generationStep: prev.generationStep + 1 }));
            addLog(`Completed step ${state.generationStep + 1}`);
          } else {
            // Start generation
            startGeneration();
          }
        } else if (key.name === 'backspace' && state.generationStep > 0) {
          setState(prev => ({ ...prev, generationStep: prev.generationStep - 1 }));
        }
      } else {
        if (key.name === 'escape') {
          setState(prev => ({ ...prev, currentView: 'main' }));
          addLog('Returned to main menu');
        }
      }
      
      // Force re-render
      screen.render();
    };

    // Bind key handlers after a short delay to ensure screen is ready
    const timer = setTimeout(() => {
      screen.key(['up', 'down', 'enter', 'return', 'escape', 'backspace'], handleKey);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      screen.unkey(['up', 'down', 'enter', 'return', 'escape', 'backspace'], handleKey);
    };
  }, [state.selectedIndex, state.currentView, state.generationStep, screen]);

  const startGeneration = async () => {
    addLog('Starting component generation...');
    setState(prev => ({ ...prev, progress: 0 }));
    
    // Simulate generation progress
    for (let i = 0; i <= 100; i += 10) {
      setState(prev => ({ ...prev, progress: i }));
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (i === 30) addLog('Analyzing requirements...');
      if (i === 50) addLog('Generating component structure...');
      if (i === 70) addLog('Applying AI optimizations...');
      if (i === 90) addLog('Finalizing component...');
    }
    
    addLog('✅ Component generated successfully!');
    setTimeout(() => {
      setState(prev => ({ ...prev, currentView: 'main', generationStep: 0, progress: 0 }));
    }, 2000);
  };

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
          label: { fg: 'magenta' }
        }}
        label=" Revolutionary UI v3.4.1 "
        content="{center}AI-Powered Component Generation{/center}\n{center}60-95% Code Reduction{/center}"
        tags={true}
      />

      {/* Main Content */}
      {state.currentView === 'main' ? (
        <>
          {/* Menu */}
          <list
            ref={(ref: any) => {
              // Auto-focus the list when on main view
              if (ref && state.currentView === 'main') {
                process.nextTick(() => {
                  try {
                    ref.focus();
                  } catch (e) {
                    // Ignore focus errors
                  }
                });
              }
            }}
            top={4}
            left={0}
            width="50%"
            height="70%"
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' },
              selected: { bg: 'blue', fg: 'white' },
              item: { fg: 'white' },
              focus: {
                border: { fg: 'green' }
              }
            }}
            label=" Main Menu "
            items={menuItems}
            selected={state.selectedIndex}
            interactive={true}  // Enable interactive mode
            keys={true}         // Enable keyboard navigation
            mouse={true}
            vi={true}           // Enable vi-style navigation
            focusable={true}
            clickable={true}
            onSelect={handleSelect}
          />

          {/* Activity Log */}
          <log
            ref={(ref: any) => {
              // Ensure log widget is properly initialized
              if (ref && ref.setScrollPerc) {
                // Defer scrolling to prevent parent access error
                process.nextTick(() => {
                  try {
                    ref.setScrollPerc(100);
                  } catch (e) {
                    // Ignore initial scroll errors
                  }
                });
              }
            }}
            top={4}
            left="50%"
            width="50%"
            height="70%"
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Activity Log "
            content={state.logs.join('\n')}
            scrollable={true}
            alwaysScroll={false}  // Disable auto-scroll to prevent error
            mouse={true}
            keys={true}
            vi={true}
          />
        </>
      ) : state.currentView === 'generate' ? (
        <>
          {/* Generation Steps */}
          <box
            top={4}
            left={0}
            width="30%"
            height="70%"
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Generation Steps "
            content={[
              `${state.generationStep > 0 ? '{green-fg}✓{/}' : state.generationStep === 0 ? '{yellow-fg}▶{/}' : '○'} Component Name`,
              `${state.generationStep > 1 ? '{green-fg}✓{/}' : state.generationStep === 1 ? '{yellow-fg}▶{/}' : '○'} Component Type`,
              `${state.generationStep > 2 ? '{green-fg}✓{/}' : state.generationStep === 2 ? '{yellow-fg}▶{/}' : '○'} Select Framework`,
              `${state.generationStep > 3 ? '{green-fg}✓{/}' : state.generationStep === 3 ? '{yellow-fg}▶{/}' : '○'} Choose UI Library`,
              `${state.generationStep > 4 ? '{green-fg}✓{/}' : state.generationStep === 4 ? '{yellow-fg}▶{/}' : '○'} Configure Features`,
              `${state.generationStep > 5 ? '{green-fg}✓{/}' : state.generationStep === 5 ? '{yellow-fg}▶{/}' : '○'} Generate with AI`
            ].join('\n')}
            tags={true}
          />

          {/* Configuration Form */}
          <box
            top={4}
            left="30%"
            width="40%"
            height="70%"
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Configuration "
            content={`{center}Step ${state.generationStep + 1} of 6{/center}\n\n${
              state.generationStep === 0 ? 'Enter component name:\n\n(Type a name and press Enter)' :
              state.generationStep === 1 ? 'Select component type:\n\n1. Form\n2. Table\n3. Dashboard\n4. Chart\n5. Modal' :
              state.generationStep === 2 ? 'Select framework:\n\n1. React\n2. Vue\n3. Angular\n4. Svelte\n5. Next.js' :
              state.generationStep === 3 ? 'Choose UI library:\n\n1. Material UI\n2. Ant Design\n3. Chakra UI\n4. Tailwind UI\n5. Bootstrap' :
              state.generationStep === 4 ? 'Configure features:\n\n[ ] TypeScript\n[ ] Tests\n[ ] Storybook\n[ ] Documentation\n[ ] Accessibility' :
              'Ready to generate!\n\nPress Enter to start generation'
            }`}
            tags={true}
          />

          {/* Generation Log */}
          <log
            ref={(ref: any) => {
              if (ref && ref.setScrollPerc) {
                process.nextTick(() => {
                  try {
                    ref.setScrollPerc(100);
                  } catch (e) {
                    // Ignore initial scroll errors
                  }
                });
              }
            }}
            top={4}
            left="70%"
            width="30%"
            height="70%"
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Generation Log "
            content={state.logs.slice(-20).join('\n')}
            scrollable={true}
            alwaysScroll={false}
            keys={true}
            vi={true}
          />

          {/* Progress Bar */}
          {state.progress > 0 && (
            <progressbar
              bottom={3}
              left={0}
              width="100%"
              height={3}
              border={{ type: 'line' }}
              style={{
                bar: { bg: 'green' },
                border: { fg: 'cyan' },
                label: { fg: 'magenta' }
              }}
              label=" Progress "
              filled={state.progress}
              ch="█"
            />
          )}
        </>
      ) : state.currentView === 'catalog' ? (
        <CatalogView
          dbService={dbService}
          resourceService={resourceService}
          onBack={() => setState(prev => ({ ...prev, currentView: 'main' }))}
          addLog={addLog}
        />
      ) : state.currentView === 'settings' ? (
        <SettingsView
          dbService={dbService}
          onBack={() => setState(prev => ({ ...prev, currentView: 'main' }))}
          addLog={addLog}
        />
      ) : state.currentView === 'analytics' ? (
        <AnalyticsView
          onBack={() => setState(prev => ({ ...prev, currentView: 'main' }))}
          addLog={addLog}
        />
      ) : state.currentView === 'search' ? (
        <SearchView
          resourceService={resourceService}
          onBack={() => setState(prev => ({ ...prev, currentView: 'main' }))}
          addLog={addLog}
        />
      ) : (
        <box
          top={4}
          left={0}
          width="100%"
          height="70%"
          border={{ type: 'line' }}
          style={{
            border: { fg: 'cyan' },
            label: { fg: 'magenta' }
          }}
          label={` ${state.currentView.charAt(0).toUpperCase() + state.currentView.slice(1)} View `}
          content={`{center}${state.currentView} view coming soon!{/center}\n\n{center}Press ESC to go back{/center}`}
          tags={true}
        />
      )}

      {/* Status Bar */}
      <box
        bottom={0}
        left={0}
        width="100%"
        height={3}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' }
        }}
        content="{center}↑↓: Navigate | Enter: Select | ESC: Exit | Tab: Switch Focus{/center}"
        tags={true}
      />
    </>
  );
};

export function createTerminalUI(aiService?: AIService): blessed.Widgets.Screen {
  // Suppress terminal capability warnings
  process.env.NCURSES_NO_UTF8_ACS = '1';
  process.env.NODE_NO_WARNINGS = '1';
  
  // Force a compatible terminal type if needed
  if (process.env.TERM === 'xterm-256color') {
    process.env.TERM = 'xterm';
  }
  
  // Create screen with safer options
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Revolutionary UI - Terminal Mode',
    fullUnicode: false,  // Disable Unicode to avoid issues
    autoPadding: true,
    warnings: false,
    dockBorders: false,
    ignoreDockContrast: true,
    forceUnicode: false,
    terminal: process.env.TERM || 'xterm',
    cursor: {
      artificial: true,
      shape: 'block',
      blink: false,
      color: null
    }
  });

  // Clear screen first
  screen.fillRegion(0, 0, screen.width, screen.height, ' ');

  // Handle escape key
  screen.key(['escape', 'q', 'C-c'], () => {
    process.exit(0);
  });

  // Handle tab key
  screen.key(['tab'], () => {
    screen.focusNext();
  });

  // Set up screen to handle input properly
  screen.enableInput();
  screen.enableMouse();
  
  // Render the app
  const component = render(
    <TerminalUIApp screen={screen} aiService={aiService} />,
    screen
  );

  // Initial render after a short delay to ensure everything is mounted
  process.nextTick(() => {
    screen.render();
  });

  return screen;
}

export default TerminalUIApp;