#!/usr/bin/env node

/**
 * Ink Beautiful Terminal UI for Revolutionary UI
 * Modern React-based CLI with beautiful layouts
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp, Newline, Spacer } from 'ink';
import Spinner from 'ink-spinner';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Table from 'ink-table';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import Link from 'ink-link';
import figures from 'figures';
import chalk from 'chalk';

// Beautiful gradients
const gradients = {
  revolutionary: ['#00ff41', '#ff006e'],
  cyberpunk: ['#ff006e', '#00ff41'],
  ocean: ['#2193b0', '#6dd5ed'],
  sunset: ['#ee9ca7', '#ffdde1'],
  purple: ['#cc2b5e', '#753a88'],
  fire: ['#f12711', '#f5af19']
};

// Modern color palettes
const themes = {
  cyberpunk: {
    primary: chalk.hex('#00ff41'),
    secondary: chalk.hex('#39ff14'),
    accent: chalk.hex('#ff006e'),
    bg: chalk.bgHex('#0a0a0a'),
    surface: chalk.bgHex('#1a1a1a'),
    text: chalk.hex('#e0e0e0'),
    muted: chalk.hex('#666666'),
    error: chalk.hex('#ff0040'),
    warning: chalk.hex('#ffaa00'),
    success: chalk.hex('#00ff88'),
    info: chalk.hex('#00ddff')
  },
  nord: {
    primary: chalk.hex('#88c0d0'),
    secondary: chalk.hex('#81a1c1'),
    accent: chalk.hex('#5e81ac'),
    bg: chalk.bgHex('#2e3440'),
    surface: chalk.bgHex('#3b4252'),
    text: chalk.hex('#eceff4'),
    muted: chalk.hex('#4c566a'),
    error: chalk.hex('#bf616a'),
    warning: chalk.hex('#d08770'),
    success: chalk.hex('#a3be8c'),
    info: chalk.hex('#5e81ac')
  },
  dracula: {
    primary: chalk.hex('#bd93f9'),
    secondary: chalk.hex('#ff79c6'),
    accent: chalk.hex('#50fa7b'),
    bg: chalk.bgHex('#282a36'),
    surface: chalk.bgHex('#44475a'),
    text: chalk.hex('#f8f8f2'),
    muted: chalk.hex('#6272a4'),
    error: chalk.hex('#ff5555'),
    warning: chalk.hex('#ffb86c'),
    success: chalk.hex('#50fa7b'),
    info: chalk.hex('#8be9fd')
  }
};

// Component Card
const ComponentCard = ({ title, description, downloads, rating, theme, isSelected }) => {
  const stars = figures.star.repeat(Math.round(rating));
  const emptyStars = figures.star.repeat(5 - Math.round(rating));
  
  return (
    <Box
      borderStyle="round"
      borderColor={isSelected ? theme.accent : theme.muted}
      paddingX={1}
      marginBottom={1}
      width={60}
    >
      <Box flexDirection="column">
        <Text color={theme.primary}>{title}</Text>
        <Text color={theme.muted}>{description}</Text>
        <Box marginTop={1}>
          <Text color={theme.warning}>{stars}</Text>
          <Text color={theme.muted}>{emptyStars}</Text>
          <Text color={theme.muted}> • </Text>
          <Text color={theme.info}>{downloads.toLocaleString()} downloads</Text>
        </Box>
      </Box>
    </Box>
  );
};

// Stat Box
const StatBox = ({ label, value, icon, color, sparkline }) => {
  return (
    <Box
      borderStyle="round"
      borderColor={color}
      paddingX={2}
      paddingY={1}
      width={20}
      flexDirection="column"
      alignItems="center"
    >
      <Text color={color}>{icon}</Text>
      <Text color="white" bold>{value}</Text>
      <Text dimColor>{label}</Text>
      {sparkline && (
        <Text color={color} dimColor>
          {sparkline}
        </Text>
      )}
    </Box>
  );
};

// Activity Item
const ActivityItem = ({ activity, theme }) => {
  const icons = {
    success: figures.tick,
    error: figures.cross,
    warning: figures.warning,
    info: figures.info
  };
  
  const colors = {
    success: theme.success,
    error: theme.error,
    warning: theme.warning,
    info: theme.info
  };
  
  return (
    <Box marginBottom={1}>
      <Text color={theme.muted}>{activity.time}</Text>
      <Text> </Text>
      <Text color={colors[activity.type]}>{icons[activity.type]}</Text>
      <Text> </Text>
      <Text bold>{activity.user}</Text>
      <Text>: {activity.action}</Text>
    </Box>
  );
};

// Main App Component
const App = () => {
  const { exit } = useApp();
  const [theme, setTheme] = useState(themes.cyberpunk);
  const [themeName, setThemeName] = useState('cyberpunk');
  const [view, setView] = useState('dashboard');
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [componentName, setComponentName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Sample data
  const stats = {
    components: 156,
    linesaved: '45.2k',
    projects: 12,
    team: 8
  };
  
  const activities = [
    { time: '2m ago', user: 'You', action: 'Generated DataTable component', type: 'success' },
    { time: '15m ago', user: 'Alice', action: 'Updated FormBuilder template', type: 'info' },
    { time: '1h ago', user: 'System', action: 'AI model updated to GPT-4', type: 'warning' },
    { time: '2h ago', user: 'Bob', action: 'Published Calendar component', type: 'success' }
  ];
  
  const menuItems = [
    { label: 'Dashboard', value: 'dashboard', icon: figures.home },
    { label: 'Generate', value: 'generate', icon: figures.play },
    { label: 'Catalog', value: 'catalog', icon: figures.hamburger },
    { label: 'Analytics', value: 'analytics', icon: figures.lineChart },
    { label: 'Settings', value: 'settings', icon: figures.gear }
  ];
  
  const catalogComponents = [
    { id: 1, name: 'DataTable', description: 'Advanced data table with sorting', downloads: 15420, rating: 4.8 },
    { id: 2, name: 'FormBuilder', description: 'Dynamic form generator', downloads: 8932, rating: 4.6 },
    { id: 3, name: 'Dashboard', description: 'Analytics dashboard template', downloads: 12653, rating: 4.9 }
  ];
  
  // Keyboard input handling
  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
    }
    
    if (input === '?') {
      setShowHelp(!showHelp);
    }
    
    if (input === 't') {
      const themeNames = Object.keys(themes);
      const currentIndex = themeNames.indexOf(themeName);
      const nextIndex = (currentIndex + 1) % themeNames.length;
      setThemeName(themeNames[nextIndex]);
      setTheme(themes[themeNames[nextIndex]]);
    }
    
    if (key.upArrow || input === 'k') {
      setSelectedMenuIndex(Math.max(0, selectedMenuIndex - 1));
    }
    
    if (key.downArrow || input === 'j') {
      setSelectedMenuIndex(Math.min(menuItems.length - 1, selectedMenuIndex + 1));
    }
    
    if (key.return) {
      setView(menuItems[selectedMenuIndex].value);
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
  
  // Render header
  const renderHeader = () => (
    <Box marginBottom={1}>
      <Gradient name="rainbow">
        <BigText text="REVOLUTIONARY UI" font="tiny" />
      </Gradient>
      <Spacer />
      <Box flexDirection="column" alignItems="flex-end">
        <Text color={theme.muted}>v3.4.1 Modern Beautiful Edition</Text>
        <Text color={theme.muted}>Theme: {themeName} [t]</Text>
      </Box>
    </Box>
  );
  
  // Render sidebar
  const renderSidebar = () => (
    <Box
      flexDirection="column"
      marginRight={2}
      paddingRight={2}
      borderStyle="single"
      borderColor={theme.muted}
      width={20}
    >
      <Text color={theme.primary} bold>
        {figures.play} Menu
      </Text>
      <Box height={1} />
      {menuItems.map((item, index) => (
        <Box key={item.value} marginBottom={1}>
          <Text color={view === item.value ? theme.accent : theme.text}>
            {selectedMenuIndex === index ? figures.pointer : ' '}
            {' ' + item.icon + ' ' + item.label}
          </Text>
        </Box>
      ))}
      <Box height={2} />
      <Text color={theme.muted}>───────────────</Text>
      <Box height={1} />
      <Text color={theme.muted}>{figures.info} [?] Help</Text>
      <Text color={theme.muted}>{figures.cross} [q] Quit</Text>
    </Box>
  );
  
  // Render dashboard
  const renderDashboard = () => (
    <Box flexDirection="column" width="100%">
      <Text color={theme.primary} bold>
        {figures.home} Dashboard
      </Text>
      <Box height={1} />
      
      {/* Stats */}
      <Box marginBottom={2}>
        <StatBox
          label="Components"
          value={stats.components}
          icon={figures.package}
          color={theme.success}
          sparkline={generateSparkline()}
        />
        <Box width={1} />
        <StatBox
          label="Lines Saved"
          value={stats.linesaved}
          icon={figures.zap}
          color={theme.primary}
          sparkline={generateSparkline()}
        />
        <Box width={1} />
        <StatBox
          label="Projects"
          value={stats.projects}
          icon={figures.folder}
          color={theme.warning}
          sparkline={generateSparkline()}
        />
        <Box width={1} />
        <StatBox
          label="Team"
          value={stats.team}
          icon={figures.user}
          color={theme.info}
          sparkline={generateSparkline()}
        />
      </Box>
      
      {/* Activity Feed */}
      <Box flexDirection="column">
        <Text color={theme.primary} bold marginBottom={1}>
          {figures.timeline} Recent Activity
        </Text>
        {activities.map((activity, index) => (
          <ActivityItem key={index} activity={activity} theme={theme} />
        ))}
      </Box>
    </Box>
  );
  
  // Render generate view
  const renderGenerate = () => (
    <Box flexDirection="column" width="100%">
      <Text color={theme.primary} bold>
        {figures.play} Component Generator
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
          <Text color={theme.info}>
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
  );
  
  // Render catalog
  const renderCatalog = () => (
    <Box flexDirection="column" width="100%">
      <Text color={theme.primary} bold>
        {figures.hamburger} Component Catalog
      </Text>
      <Box height={1} />
      
      {catalogComponents.map((component, index) => (
        <ComponentCard
          key={component.id}
          title={component.name}
          description={component.description}
          downloads={component.downloads}
          rating={component.rating}
          theme={theme}
          isSelected={false}
        />
      ))}
    </Box>
  );
  
  // Render current view
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return renderDashboard();
      case 'generate':
        return renderGenerate();
      case 'catalog':
        return renderCatalog();
      case 'analytics':
        return (
          <Text color={theme.primary}>
            {figures.lineChart} Analytics coming soon...
          </Text>
        );
      case 'settings':
        return (
          <Text color={theme.primary}>
            {figures.gear} Settings coming soon...
          </Text>
        );
      default:
        return renderDashboard();
    }
  };
  
  // Render help modal
  const renderHelp = () => (
    <Box
      borderStyle="double"
      borderColor={theme.accent}
      paddingX={2}
      paddingY={1}
      flexDirection="column"
    >
      <Text color={theme.primary} bold>
        Keyboard Shortcuts
      </Text>
      <Box height={1} />
      <Text>Navigation:</Text>
      <Text color={theme.muted}>  ↑/k  Move up</Text>
      <Text color={theme.muted}>  ↓/j  Move down</Text>
      <Text color={theme.muted}>  Enter Select</Text>
      <Box height={1} />
      <Text>Quick Access:</Text>
      <Text color={theme.muted}>  d  Dashboard</Text>
      <Text color={theme.muted}>  g  Generate</Text>
      <Text color={theme.muted}>  c  Catalog</Text>
      <Text color={theme.muted}>  a  Analytics</Text>
      <Text color={theme.muted}>  s  Settings</Text>
      <Box height={1} />
      <Text>Other:</Text>
      <Text color={theme.muted}>  t  Change theme</Text>
      <Text color={theme.muted}>  ?  Toggle help</Text>
      <Text color={theme.muted}>  q  Quit</Text>
    </Box>
  );
  
  return (
    <Box flexDirection="column" paddingX={1}>
      {renderHeader()}
      <Box>
        {renderSidebar()}
        {showHelp ? renderHelp() : renderContent()}
      </Box>
      <Box marginTop={1}>
        <Text color={theme.muted}>
          {new Date().toLocaleTimeString()} • CPU: {generateSparkline()} • Mem: 42%
        </Text>
      </Box>
    </Box>
  );
};

// Main entry point
if (process.argv[1] === new URL(import.meta.url).pathname) {
  render(<App />);
}