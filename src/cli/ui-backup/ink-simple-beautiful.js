#!/usr/bin/env node

/**
 * Ink Simple Beautiful Terminal UI for Revolutionary UI
 * Modern React-based CLI with beautiful layouts
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';

// Simple theme colors
const themes = {
  modern: {
    primary: 'cyan',
    secondary: 'blue', 
    accent: 'magenta',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    muted: 'gray'
  },
  nord: {
    primary: 'blue',
    secondary: 'cyan',
    accent: 'magenta',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    muted: 'gray'
  },
  dark: {
    primary: 'white',
    secondary: 'gray',
    accent: 'yellow',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    muted: 'gray'
  }
};

// Main App Component
const App = () => {
  const { exit } = useApp();
  const [currentTheme, setCurrentTheme] = useState('modern');
  const [view, setView] = useState('dashboard');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [componentName, setComponentName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const theme = themes[currentTheme];
  
  // Sample data
  const stats = {
    components: 156,
    linesaved: '45.2k',
    projects: 12,
    team: 8
  };
  
  const menuItems = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Generate', value: 'generate' },
    { label: 'Catalog', value: 'catalog' },
    { label: 'Analytics', value: 'analytics' },
    { label: 'Settings', value: 'settings' }
  ];
  
  // Keyboard handling
  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
    }
    
    if (input === 't') {
      const themeNames = Object.keys(themes);
      const currentIndex = themeNames.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themeNames.length;
      setCurrentTheme(themeNames[nextIndex]);
    }
    
    if (key.upArrow || input === 'k') {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    }
    
    if (key.downArrow || input === 'j') {
      setSelectedIndex(Math.min(menuItems.length - 1, selectedIndex + 1));
    }
    
    if (key.return) {
      setView(menuItems[selectedIndex].value);
    }
    
    // Quick navigation
    if (input === 'd') setView('dashboard');
    if (input === 'g') setView('generate');
    if (input === 'c') setView('catalog');
    if (input === 'a') setView('analytics');
    if (input === 's') setView('settings');
  });
  
  // Generate sparkline
  const generateSparkline = () => {
    const chars = '▁▂▃▄▅▆▇█';
    return Array.from({ length: 10 }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  };
  
  // Format number
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box marginBottom={1} justifyContent="space-between">
        <Gradient name="rainbow">
          <BigText text="REVOLUTIONARY UI" font="tiny" />
        </Gradient>
        <Box flexDirection="column" alignItems="flex-end">
          <Text color={theme.muted}>v3.4.1 Ink Edition</Text>
          <Text color={theme.muted}>Theme: {currentTheme} [t]</Text>
        </Box>
      </Box>
      
      <Box>
        {/* Sidebar */}
        <Box
          flexDirection="column"
          marginRight={2}
          paddingRight={2}
          borderStyle="single"
          borderColor={theme.muted}
          width={20}
          minHeight={20}
        >
          <Text color={theme.primary} bold>
            ▶ Menu
          </Text>
          <Box height={1} />
          {menuItems.map((item, index) => (
            <Box key={item.value} marginBottom={1}>
              <Text color={view === item.value ? theme.accent : 'white'}>
                {selectedIndex === index ? '▶' : ' '} {item.label}
              </Text>
            </Box>
          ))}
          <Box flexGrow={1} />
          <Text color={theme.muted}>───────────────</Text>
          <Text color={theme.muted}>◆ [?] Help</Text>
          <Text color={theme.muted}>✕ [q] Quit</Text>
        </Box>
        
        {/* Main Content */}
        <Box flexDirection="column" flexGrow={1}>
          {view === 'dashboard' && (
            <Box flexDirection="column">
              <Text color={theme.primary} bold>
                ⌂ Dashboard
              </Text>
              <Box height={1} />
              
              {/* Stats Row */}
              <Box marginBottom={2}>
                <Box
                  borderStyle="round"
                  borderColor={theme.success}
                  paddingX={2}
                  paddingY={1}
                  marginRight={1}
                  width={20}
                  flexDirection="column"
                  alignItems="center"
                >
                  <Text color={theme.success}>◆</Text>
                  <Text color="white" bold>{stats.components}</Text>
                  <Text dimColor>Components</Text>
                  <Text color={theme.success} dimColor>
                    {generateSparkline()}
                  </Text>
                </Box>
                
                <Box
                  borderStyle="round"
                  borderColor={theme.primary}
                  paddingX={2}
                  paddingY={1}
                  marginRight={1}
                  width={20}
                  flexDirection="column"
                  alignItems="center"
                >
                  <Text color={theme.primary}>◉</Text>
                  <Text color="white" bold>{stats.linesaved}</Text>
                  <Text dimColor>Lines Saved</Text>
                  <Text color={theme.primary} dimColor>
                    {generateSparkline()}
                  </Text>
                </Box>
                
                <Box
                  borderStyle="round"
                  borderColor={theme.warning}
                  paddingX={2}
                  paddingY={1}
                  marginRight={1}
                  width={20}
                  flexDirection="column"
                  alignItems="center"
                >
                  <Text color={theme.warning}>▣</Text>
                  <Text color="white" bold>{stats.projects}</Text>
                  <Text dimColor>Projects</Text>
                  <Text color={theme.warning} dimColor>
                    {generateSparkline()}
                  </Text>
                </Box>
                
                <Box
                  borderStyle="round"
                  borderColor={theme.secondary}
                  paddingX={2}
                  paddingY={1}
                  width={20}
                  flexDirection="column"
                  alignItems="center"
                >
                  <Text color={theme.secondary}>◈</Text>
                  <Text color="white" bold>{stats.team}</Text>
                  <Text dimColor>Team</Text>
                  <Text color={theme.secondary} dimColor>
                    {generateSparkline()}
                  </Text>
                </Box>
              </Box>
              
              {/* Activity Feed */}
              <Box flexDirection="column">
                <Text color={theme.primary} bold marginBottom={1}>
                  ● Recent Activity
                </Text>
                <Box flexDirection="column">
                  <Box marginBottom={1}>
                    <Text color={theme.muted}>2m ago </Text>
                    <Text color={theme.success}>✓ </Text>
                    <Text bold>You</Text>
                    <Text>: Generated DataTable component</Text>
                  </Box>
                  <Box marginBottom={1}>
                    <Text color={theme.muted}>15m ago </Text>
                    <Text color={theme.secondary}>◆ </Text>
                    <Text bold>Alice</Text>
                    <Text>: Updated FormBuilder template</Text>
                  </Box>
                  <Box marginBottom={1}>
                    <Text color={theme.muted}>1h ago </Text>
                    <Text color={theme.warning}>⚠ </Text>
                    <Text bold>System</Text>
                    <Text>: AI model updated to GPT-4</Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          
          {view === 'generate' && (
            <Box flexDirection="column">
              <Text color={theme.primary} bold>
                ▶ Component Generator
              </Text>
              <Box height={1} />
              
              <Box marginBottom={1}>
                <Text>Component Name: </Text>
                <TextInput
                  value={componentName}
                  onChange={setComponentName}
                  placeholder="Enter component name..."
                />
              </Box>
              
              {isGenerating ? (
                <Box>
                  <Text color={theme.secondary}>
                    <Spinner type="dots" /> Generating component...
                  </Text>
                </Box>
              ) : (
                <Box marginTop={1}>
                  <Text color={theme.muted}>
                    Press Enter to generate component
                  </Text>
                </Box>
              )}
            </Box>
          )}
          
          {view === 'catalog' && (
            <Text color={theme.primary}>
              ◉ Component Catalog coming soon...
            </Text>
          )}
          
          {view === 'analytics' && (
            <Text color={theme.primary}>
              ◈ Analytics coming soon...
            </Text>
          )}
          
          {view === 'settings' && (
            <Text color={theme.primary}>
              ⚙ Settings coming soon...
            </Text>
          )}
        </Box>
      </Box>
      
      {/* Footer */}
      <Box marginTop={1}>
        <Text color={theme.muted}>
          {new Date().toLocaleTimeString()} • CPU: {generateSparkline()} • Mem: 42%
        </Text>
      </Box>
    </Box>
  );
};

// Run the app
render(<App />);