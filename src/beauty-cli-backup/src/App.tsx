import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { FullScreen } from './components/FullScreen.js';
import { CursorHider } from './components/CursorHider.js';
import { MultiWindowLayout } from './components/MultiWindowLayout.js';
import { Sidebar } from './components/Sidebar.js';
import { WelcomeScreen } from './screens/WelcomeScreen.js';
// MainMenu not needed with sidebar navigation
import { DashboardScreen } from './screens/DashboardScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';
import { AboutScreen } from './screens/AboutScreen.js';
import { GenerateScreen } from './screens/GenerateScreen.js';
import { AnalyzeScreen } from './screens/AnalyzeScreen.js';
import { SearchScreen } from './screens/SearchScreen.js';
import { ChatScreen } from './screens/ChatScreen.js';
import { SyncScreen } from './screens/SyncScreen.js';
import { TemplatesScreen } from './screens/TemplatesScreen.js';
import { DocsScreen } from './screens/DocsScreen.js';
import { FactoryScreen } from './screens/FactoryScreen.js';
import figures from 'figures';

type Screen = 'welcome' | 'dashboard' | 'settings' | 'about' | 
              'generate' | 'analyze' | 'search' | 'chat' | 'sync' | 
              'templates' | 'docs' | 'factory';

interface AppProps {
  command?: string;
  args?: string[];
  flags?: Record<string, any>;
}

const menuOptions = [
  { id: 'generate', label: 'Generate', icon: figures.play, badge: 'AI', badgeColor: 'cyan' },
  { id: 'analyze', label: 'Analyze', icon: figures.lozenge, badge: 'SMART', badgeColor: 'green' },
  { id: 'search', label: 'Search', icon: figures.star, badge: '10K+', badgeColor: 'yellow' },
  { id: 'factory', label: 'Factories', icon: figures.squareSmall, badge: 'HOT', badgeColor: 'red' },
  { id: 'dashboard', label: 'Dashboard', icon: figures.squareSmallFilled },
  { id: 'chat', label: 'AI Chat', icon: figures.heart, badge: 'GPT-4', badgeColor: 'magenta' },
  { id: 'sync', label: 'Sync', icon: figures.arrowUp },
  { id: 'templates', label: 'Templates', icon: figures.hamburger },
  { id: 'docs', label: 'Docs', icon: figures.nodejs },
  { id: 'settings', label: 'Settings', icon: figures.hamburger },
  { id: 'about', label: 'About', icon: figures.info }
];

export const App: React.FC<AppProps> = ({ command, args = [], flags = {} }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
    
    // Global navigation with arrow keys when not in welcome screen
    if (currentScreen !== 'welcome' && !showWelcome) {
      if (key.upArrow) {
        setSelectedMenuIndex((prev) => (prev - 1 + menuOptions.length) % menuOptions.length);
      } else if (key.downArrow) {
        setSelectedMenuIndex((prev) => (prev + 1) % menuOptions.length);
      } else if (key.return) {
        const selected = menuOptions[selectedMenuIndex];
        setCurrentScreen(selected.id as Screen);
      }
    }
  });

  React.useEffect(() => {
    // If a command is provided, skip welcome and go directly to that screen
    if (command) {
      setShowWelcome(false);
      const commandScreenMap: Record<string, Screen> = {
        generate: 'generate',
        analyze: 'analyze',
        search: 'search',
        chat: 'chat',
        sync: 'sync',
        settings: 'settings',
        templates: 'templates',
        docs: 'docs',
        factory: 'factory'
      };
      setCurrentScreen(commandScreenMap[command] || 'generate');
    } else if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setCurrentScreen('generate'); // Go directly to first option
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [command, showWelcome]);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    // Update selected index to match new screen
    const index = menuOptions.findIndex(opt => opt.id === screen);
    if (index !== -1) setSelectedMenuIndex(index);
  };

  const handleBack = () => {
    // Don't exit, just show a message or do nothing when at root
    // Navigation is handled by the sidebar
  };

  // Update selected menu based on current screen
  React.useEffect(() => {
    const index = menuOptions.findIndex(opt => opt.id === currentScreen);
    if (index !== -1) setSelectedMenuIndex(index);
  }, [currentScreen]);

  if (currentScreen === 'welcome' && showWelcome) {
    return (
      <FullScreen>
        <CursorHider />
        <WelcomeScreen />
      </FullScreen>
    );
  }

  const renderMainContent = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onBack={handleBack} />;
      case 'settings':
        return <SettingsScreen onBack={handleBack} />;
      case 'about':
        return <AboutScreen onBack={handleBack} />;
      case 'generate':
        return <GenerateScreen onBack={handleBack} args={args} />;
      case 'analyze':
        return <AnalyzeScreen onBack={handleBack} flags={flags} />;
      case 'search':
        return <SearchScreen onBack={handleBack} query={args[0]} />;
      case 'chat':
        return <ChatScreen onBack={handleBack} />;
      case 'sync':
        return <SyncScreen onBack={handleBack} />;
      case 'templates':
        return <TemplatesScreen onBack={handleBack} />;
      case 'docs':
        return <DocsScreen onBack={handleBack} />;
      case 'factory':
        return <FactoryScreen onBack={handleBack} />;
      default:
        return <GenerateScreen onBack={handleBack} args={args} />;
    }
  };

  return (
    <FullScreen>
      <CursorHider />
      <MultiWindowLayout
        sidebar={
          <Sidebar 
            currentScreen={currentScreen}
            selectedIndex={selectedMenuIndex}
            menuOptions={menuOptions}
          />
        }
        main={renderMainContent()}
      />
    </FullScreen>
  );
};