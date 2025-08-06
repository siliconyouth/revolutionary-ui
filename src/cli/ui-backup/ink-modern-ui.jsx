#!/usr/bin/env node

/**
 * Modern Terminal UI using Ink (React for CLI)
 * Features modern React patterns and components
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, Newline, useInput, useApp, Static } from 'ink';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import ProgressBar from 'ink-progress-bar';
import Table from 'ink-table';
import Link from 'ink-link';
import Image from 'ink-image';
import Divider from 'ink-divider';
import { UncontrolledTextInput } from 'ink-text-input';
import figures from 'figures';
import chalk from 'chalk';

// Custom hook for animations
const useAnimation = (frames, interval = 80) => {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(prev => (prev + 1) % frames.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [frames, interval]);
  
  return frames[frame];
};

// Custom animated component
const AnimatedBox = ({ children }) => {
  const colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
  const [colorIndex, setColorIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setColorIndex(prev => (prev + 1) % colors.length);
    }, 500);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <Box borderStyle="round" borderColor={colors[colorIndex]} padding={1}>
      {children}
    </Box>
  );
};

// Main App Component
const ModernTerminalUI = () => {
  const { exit } = useApp();
  const [view, setView] = useState('home');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [componentName, setComponentName] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  // Animated emoji
  const animatedEmoji = useAnimation(['🚀', '✨', '🎯', '🔥', '⚡'], 200);
  
  // Menu items
  const menuItems = [
    { label: '🏠 Home', value: 'home' },
    { label: '🏭 Generate Component', value: 'generate' },
    { label: '📚 Browse Catalog', value: 'catalog' },
    { label: '📊 Analytics', value: 'analytics' },
    { label: '⚙️ Settings', value: 'settings' },
    { label: '🚪 Exit', value: 'exit' }
  ];
  
  // Sample data
  const catalogData = [
    { name: 'DataTable', framework: 'React', stars: '⭐⭐⭐⭐⭐', downloads: '15.4k' },
    { name: 'FormBuilder', framework: 'Vue', stars: '⭐⭐⭐⭐', downloads: '8.9k' },
    { name: 'Dashboard', framework: 'React', stars: '⭐⭐⭐⭐⭐', downloads: '12.6k' },
    { name: 'Calendar', framework: 'Angular', stars: '⭐⭐⭐⭐', downloads: '6.7k' }
  ];
  
  // Handle input
  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
    }
    
    if (key.escape) {
      setView('home');
    }
    
    // Quick navigation
    if (input === 'g') setView('generate');
    if (input === 'c') setView('catalog');
    if (input === 'a') setView('analytics');
    if (input === 's') setView('settings');
  });
  
  // Simulate progress
  useEffect(() => {
    if (loading && progress < 1) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 0.1, 1));
      }, 200);
      
      return () => clearTimeout(timer);
    } else if (progress >= 1) {
      setLoading(false);
      setProgress(0);
      addNotification('✅ Component generated successfully!');
    }
  }, [loading, progress]);
  
  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  const handleMenuSelect = (item) => {
    if (item.value === 'exit') {
      exit();
    } else {
      setView(item.value);
    }
  };
  
  const generateComponent = () => {
    if (componentName) {
      setLoading(true);
      addNotification(`🏗️ Generating ${componentName}...`);
    }
  };
  
  // Render different views
  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <Box flexDirection="column" alignItems="center">
            <Gradient name="rainbow">
              <BigText text="REVOLUTIONARY" font="chrome" />
            </Gradient>
            <Text color="cyan">AI-Powered Component Generation System</Text>
            <Newline />
            <AnimatedBox>
              <Text>{animatedEmoji} Welcome to the future of UI development!</Text>
            </AnimatedBox>
            <Newline />
            <Box flexDirection="column">
              <Text color="yellow">Quick Stats:</Text>
              <Text>• Components Generated: 1,247</Text>
              <Text>• Lines of Code Saved: 48,392</Text>
              <Text>• Active Users: 892</Text>
              <Text>• Efficiency Rate: 87.5%</Text>
            </Box>
          </Box>
        );
        
      case 'generate':
        return (
          <Box flexDirection="column">
            <Text color="green" bold>🏭 Component Generator</Text>
            <Divider />
            <Newline />
            
            <Box flexDirection="column" marginBottom={1}>
              <Text>Component Name:</Text>
              <Box borderStyle="single" borderColor="cyan" padding={0}>
                <TextInput
                  value={componentName}
                  onChange={setComponentName}
                  placeholder="Enter component name..."
                />
              </Box>
            </Box>
            
            {loading && (
              <Box flexDirection="column">
                <Text>
                  <Spinner type="dots" /> Generating component...
                </Text>
                <Box width={40}>
                  <ProgressBar percent={progress} />
                </Box>
              </Box>
            )}
            
            {!loading && (
              <Box marginTop={1}>
                <Text color="cyan">
                  Press ENTER to generate | ESC to go back
                </Text>
              </Box>
            )}
          </Box>
        );
        
      case 'catalog':
        return (
          <Box flexDirection="column">
            <Text color="blue" bold>📚 Component Catalog</Text>
            <Divider />
            <Newline />
            
            <Table data={catalogData} />
            
            <Newline />
            <Text dimColor>
              {figures.info} Use arrow keys to browse, ENTER to install
            </Text>
          </Box>
        );
        
      case 'analytics':
        return (
          <Box flexDirection="column">
            <Text color="yellow" bold>📊 Analytics Dashboard</Text>
            <Divider />
            <Newline />
            
            <Box flexDirection="row" gap={2}>
              <Box flexDirection="column" borderStyle="single" padding={1}>
                <Text bold>Daily Stats</Text>
                <Text>Components: +23</Text>
                <Text>Users: +5</Text>
                <Text>Efficiency: 92%</Text>
              </Box>
              
              <Box flexDirection="column" borderStyle="single" padding={1}>
                <Text bold>Weekly Trend</Text>
                <Text color="green">▲ 15% growth</Text>
                <Text>Top Framework: React</Text>
                <Text>Avg. Time Saved: 2.5h</Text>
              </Box>
            </Box>
            
            <Newline />
            <Box width={60} flexDirection="column">
              <Text>Code Reduction Rate:</Text>
              <ProgressBar percent={0.875} />
              <Text dimColor>87.5% average across all components</Text>
            </Box>
          </Box>
        );
        
      case 'settings':
        return (
          <Box flexDirection="column">
            <Text color="magenta" bold>⚙️ Settings</Text>
            <Divider />
            <Newline />
            
            <Text>🎨 Theme: Cyberpunk</Text>
            <Text>🌐 Default Framework: React</Text>
            <Text>🤖 AI Provider: GPT-4</Text>
            <Text>📦 Package Manager: npm</Text>
            <Newline />
            <Text dimColor>
              {figures.info} Settings will be saved automatically
            </Text>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box
        borderStyle="double"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
        marginBottom={1}
        justifyContent="space-between"
      >
        <Text bold>
          Revolutionary UI Terminal v3.4.1
        </Text>
        <Text dimColor>
          {new Date().toLocaleString()}
        </Text>
      </Box>
      
      {/* Main Content Area */}
      <Box flexDirection="row" minHeight={20}>
        {/* Sidebar Menu */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor="gray"
          marginRight={1}
          paddingX={1}
          width={25}
        >
          <Text bold underline color="yellow">
            Menu
          </Text>
          <Newline />
          <SelectInput
            items={menuItems}
            onSelect={handleMenuSelect}
            indicatorComponent={({ isSelected }) => (
              <Text color="cyan">{isSelected ? '▶' : ' '}</Text>
            )}
          />
        </Box>
        
        {/* Content Area */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor="gray"
          paddingX={2}
          paddingY={1}
          flexGrow={1}
        >
          {renderView()}
        </Box>
      </Box>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Static items={notifications}>
            {notification => (
              <Box key={notification.id}>
                <Text color="green">{notification.message}</Text>
              </Box>
            )}
          </Static>
        </Box>
      )}
      
      {/* Footer */}
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        marginTop={1}
        justifyContent="space-between"
      >
        <Text dimColor>
          {figures.keyboard} q: quit | g: generate | c: catalog | ESC: home
        </Text>
        <Link url="https://revolutionary-ui.com">
          <Text color="cyan">revolutionary-ui.com</Text>
        </Link>
      </Box>
    </Box>
  );
};

// Error boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Box flexDirection="column" padding={2}>
          <Text color="red" bold>
            {figures.cross} An error occurred:
          </Text>
          <Text>{this.state.error?.message}</Text>
          <Text dimColor>Please restart the application</Text>
        </Box>
      );
    }
    
    return this.props.children;
  }
}

// Main entry point
if (process.argv[1] === new URL(import.meta.url).pathname) {
  render(
    <ErrorBoundary>
      <ModernTerminalUI />
    </ErrorBoundary>
  );
}