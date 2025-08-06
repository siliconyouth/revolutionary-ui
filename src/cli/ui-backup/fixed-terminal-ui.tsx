/**
 * Fixed Terminal UI Application
 * Properly handles widget initialization to avoid parent access errors
 */

import React, { useState, useEffect, useRef } from 'react';
import blessed from 'blessed';
import { render } from 'react-blessed';
import { AIService } from '../../ai/services/ai-service';
import { DatabaseResourceService } from '../../services/database-resource-service';
import { EnhancedResourceService } from '../../services/enhanced-resource-service';

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
      text: any;
    }
  }
}

interface AppState {
  currentView: 'main' | 'generate' | 'catalog' | 'settings' | 'analytics' | 'search';
  logs: string[];
  selectedIndex: number;
  mounted: boolean;
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
      `AI Service: ${aiService ? 'Connected' : 'Not configured'}`,
      'Use arrow keys to navigate, Enter to select'
    ],
    selectedIndex: 0,
    mounted: false
  });

  // Services
  const dbService = useRef<DatabaseResourceService>();
  const resourceService = useRef<EnhancedResourceService>();

  // Widget refs
  const listRef = useRef<any>(null);
  const logRef = useRef<any>(null);

  const menuItems = [
    '🚀 Generate Component',
    '📊 Browse Catalog',
    '⚙️  Configure Settings',
    '📈 View Analytics',
    '🔍 Search Components',
    '❌ Exit'
  ];

  // Initialize services
  useEffect(() => {
    dbService.current = DatabaseResourceService.getInstance();
    resourceService.current = EnhancedResourceService.getInstance();
    
    // Mark as mounted after a delay
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, mounted: true }));
      
      // Focus the list widget
      if (listRef.current) {
        listRef.current.focus();
        screen.render();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, `[${timestamp}] ${message}`].slice(-30)
    }));
  };

  const handleSelect = (item: any, index: number) => {
    addLog(`Selected: ${menuItems[index]}`);
    
    if (index === menuItems.length - 1) {
      process.exit(0);
    }
    
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
    }
  };

  // Keyboard handling
  useEffect(() => {
    if (!state.mounted) return;

    const handleKeypress = (ch: string, key: any) => {
      if (!key) return;

      if (state.currentView === 'main') {
        if (key.name === 'up' || key.name === 'k') {
          setState(prev => ({
            ...prev,
            selectedIndex: Math.max(0, prev.selectedIndex - 1)
          }));
        } else if (key.name === 'down' || key.name === 'j') {
          setState(prev => ({
            ...prev,
            selectedIndex: Math.min(menuItems.length - 1, prev.selectedIndex + 1)
          }));
        } else if (key.name === 'return' || key.name === 'enter') {
          handleSelect(null, state.selectedIndex);
        }
      } else {
        if (key.name === 'escape' || key.name === 'q') {
          setState(prev => ({ ...prev, currentView: 'main' }));
          addLog('Returned to main menu');
        }
      }
      
      // Force render
      screen.render();
    };

    screen.on('keypress', handleKeypress);
    return () => {
      screen.off('keypress', handleKeypress);
    };
  }, [state.mounted, state.currentView, state.selectedIndex]);

  // Don't render widgets until mounted
  if (!state.mounted) {
    return (
      <box
        top="center"
        left="center"
        width="50%"
        height={3}
        border={{ type: 'line' }}
        style={{ border: { fg: 'cyan' } }}
        content="{center}Loading Terminal UI...{/center}"
        tags={true}
      />
    );
  }

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
            ref={listRef}
            top={4}
            left={0}
            width="50%"
            height="70%"
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' },
              selected: { bg: 'blue', fg: 'white' }
            }}
            label=" Main Menu "
            items={menuItems}
            selected={state.selectedIndex}
            interactive={true}
            keys={true}
            mouse={true}
            focusable={true}
            onSelect={handleSelect}
          />

          {/* Activity Log - Using box instead of log to avoid errors */}
          <box
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
            scrollable={true}
            mouse={true}
            content={state.logs.join('\n')}
          />
        </>
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
          content={`{center}${state.currentView} view is ready!{/center}\n\n{center}Press ESC or Q to go back{/center}`}
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
        content="{center}↑↓/jk: Navigate | Enter: Select | ESC/q: Back | Ctrl-C: Exit{/center}"
        tags={true}
      />
    </>
  );
};

export function createFixedTerminalUI(aiService?: AIService): blessed.Widgets.Screen {
  // Set terminal environment
  process.env.TERM = 'xterm';
  process.env.NCURSES_NO_UTF8_ACS = '1';
  
  // Create screen
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Revolutionary UI - Terminal Mode',
    fullUnicode: false,
    autoPadding: true,
    warnings: false,
    terminal: 'xterm'
  });

  // Handle exit keys
  screen.key(['C-c'], () => {
    process.exit(0);
  });

  // Render the app
  render(<TerminalUIApp screen={screen} aiService={aiService} />, screen);

  // Initial render
  screen.render();

  return screen;
}

export default TerminalUIApp;