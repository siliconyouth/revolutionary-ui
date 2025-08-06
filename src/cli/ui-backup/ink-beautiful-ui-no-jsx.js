#!/usr/bin/env node

/**
 * Ink Beautiful Terminal UI for Revolutionary UI
 * Modern React-based CLI with beautiful layouts (No JSX version)
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import figures from 'figures';
import chalk from 'chalk';

// Modern color palettes
const themes = {
  cyberpunk: {
    primary: chalk.hex('#00ff41'),
    secondary: chalk.hex('#39ff14'),
    accent: chalk.hex('#ff006e'),
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
    text: chalk.hex('#f8f8f2'),
    muted: chalk.hex('#6272a4'),
    error: chalk.hex('#ff5555'),
    warning: chalk.hex('#ffb86c'),
    success: chalk.hex('#50fa7b'),
    info: chalk.hex('#8be9fd')
  }
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
    { label: 'Analytics', value: 'analytics', icon: figures.lineChart || figures.line },
    { label: 'Settings', value: 'settings', icon: figures.gear }
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
  
  // Create React elements without JSX
  const createElement = React.createElement;
  
  // Render header
  const renderHeader = () => (
    createElement(Box, { marginBottom: 1 }, [
      createElement(Gradient, { name: 'rainbow', key: 'gradient' },
        createElement(BigText, { text: 'REVOLUTIONARY UI', font: 'tiny' })
      ),
      createElement(Box, { flexDirection: 'column', alignItems: 'flex-end', key: 'info' }, [
        createElement(Text, { color: theme.muted, key: 'version' }, 'v3.4.1 Modern Beautiful Edition'),
        createElement(Text, { color: theme.muted, key: 'theme' }, `Theme: ${themeName} [t]`)
      ])
    ])
  );
  
  // Render sidebar
  const renderSidebar = () => (
    createElement(Box, {
      flexDirection: 'column',
      marginRight: 2,
      paddingRight: 2,
      borderStyle: 'single',
      borderColor: theme.muted.hex ? theme.muted.hex() : 'gray',
      width: 20
    }, [
      createElement(Text, { color: theme.primary, bold: true, key: 'title' },
        `${figures.play} Menu`
      ),
      createElement(Box, { height: 1, key: 'spacer1' }),
      ...menuItems.map((item, index) => 
        createElement(Box, { key: item.value, marginBottom: 1 },
          createElement(Text, { color: view === item.value ? theme.accent : theme.text },
            `${selectedMenuIndex === index ? figures.pointer : ' '} ${item.icon} ${item.label}`
          )
        )
      ),
      createElement(Box, { height: 2, key: 'spacer2' }),
      createElement(Text, { color: theme.muted, key: 'divider' }, '───────────────'),
      createElement(Box, { height: 1, key: 'spacer3' }),
      createElement(Text, { color: theme.muted, key: 'help' }, `${figures.info} [?] Help`),
      createElement(Text, { color: theme.muted, key: 'quit' }, `${figures.cross} [q] Quit`)
    ])
  );
  
  // Render dashboard
  const renderDashboard = () => (
    createElement(Box, { flexDirection: 'column', width: '100%' }, [
      createElement(Text, { color: theme.primary, bold: true, key: 'title' },
        `${figures.home} Dashboard`
      ),
      createElement(Box, { height: 1, key: 'spacer' }),
      
      // Stats
      createElement(Box, { marginBottom: 2, key: 'stats' }, [
        renderStatBox('Components', stats.components, figures.package || figures.square, theme.success),
        createElement(Box, { width: 1, key: 'spacer1' }),
        renderStatBox('Lines Saved', stats.linesaved, figures.radioOn || figures.circle, theme.primary),
        createElement(Box, { width: 1, key: 'spacer2' }),
        renderStatBox('Projects', stats.projects, figures.folder || figures.square, theme.warning),
        createElement(Box, { width: 1, key: 'spacer3' }),
        renderStatBox('Team', stats.team, figures.user || figures.circle, theme.info)
      ]),
      
      // Activity Feed
      createElement(Box, { flexDirection: 'column', key: 'activities' }, [
        createElement(Text, { color: theme.primary, bold: true, marginBottom: 1, key: 'title' },
          `${figures.circleFilled || figures.circle} Recent Activity`
        ),
        ...activities.map((activity, index) => renderActivityItem(activity, index))
      ])
    ])
  );
  
  // Render stat box
  const renderStatBox = (label, value, icon, color) => (
    createElement(Box, {
      borderStyle: 'round',
      borderColor: color.hex ? color.hex() : 'white',
      paddingX: 2,
      paddingY: 1,
      width: 20,
      flexDirection: 'column',
      alignItems: 'center',
      key: label
    }, [
      createElement(Text, { color: color, key: 'icon' }, icon),
      createElement(Text, { color: 'white', bold: true, key: 'value' }, value.toString()),
      createElement(Text, { dimColor: true, key: 'label' }, label),
      createElement(Text, { color: color, dimColor: true, key: 'sparkline' },
        generateSparkline()
      )
    ])
  );
  
  // Render activity item
  const renderActivityItem = (activity, index) => {
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
    
    return createElement(Box, { marginBottom: 1, key: `activity-${index}` }, [
      createElement(Text, { color: theme.muted, key: 'time' }, activity.time),
      createElement(Text, { key: 'space1' }, ' '),
      createElement(Text, { color: colors[activity.type], key: 'icon' }, icons[activity.type]),
      createElement(Text, { key: 'space2' }, ' '),
      createElement(Text, { bold: true, key: 'user' }, activity.user),
      createElement(Text, { key: 'action' }, `: ${activity.action}`)
    ]);
  };
  
  // Render generate view
  const renderGenerate = () => (
    createElement(Box, { flexDirection: 'column', width: '100%' }, [
      createElement(Text, { color: theme.primary, bold: true, key: 'title' },
        `${figures.play} Component Generator`
      ),
      createElement(Box, { height: 1, key: 'spacer' }),
      
      createElement(Box, { marginBottom: 1, key: 'input' }, [
        createElement(Text, { key: 'label' }, 'Component Name: '),
        createElement(TextInput, {
          value: componentName,
          onChange: setComponentName,
          placeholder: 'Enter component name...',
          key: 'textinput'
        })
      ]),
      
      isGenerating ? 
        createElement(Box, { key: 'generating' },
          createElement(Text, { color: theme.info }, [
            createElement(Spinner, { type: 'dots', key: 'spinner' }),
            ' Generating component...'
          ])
        ) :
        createElement(Box, { marginTop: 1, key: 'help' },
          createElement(Text, { color: theme.muted },
            'Press Enter to generate component'
          )
        )
    ])
  );
  
  // Render current view
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return renderDashboard();
      case 'generate':
        return renderGenerate();
      case 'catalog':
        return createElement(Text, { color: theme.primary },
          `${figures.hamburger} Component Catalog coming soon...`
        );
      case 'analytics':
        return createElement(Text, { color: theme.primary },
          `${figures.lineChart || figures.line} Analytics coming soon...`
        );
      case 'settings':
        return createElement(Text, { color: theme.primary },
          `${figures.gear} Settings coming soon...`
        );
      default:
        return renderDashboard();
    }
  };
  
  // Render help modal
  const renderHelp = () => (
    createElement(Box, {
      borderStyle: 'double',
      borderColor: theme.accent.hex ? theme.accent.hex() : 'magenta',
      paddingX: 2,
      paddingY: 1,
      flexDirection: 'column'
    }, [
      createElement(Text, { color: theme.primary, bold: true, key: 'title' },
        'Keyboard Shortcuts'
      ),
      createElement(Box, { height: 1, key: 'spacer1' }),
      createElement(Text, { key: 'nav-title' }, 'Navigation:'),
      createElement(Text, { color: theme.muted, key: 'nav1' }, '  ↑/k  Move up'),
      createElement(Text, { color: theme.muted, key: 'nav2' }, '  ↓/j  Move down'),
      createElement(Text, { color: theme.muted, key: 'nav3' }, '  Enter Select'),
      createElement(Box, { height: 1, key: 'spacer2' }),
      createElement(Text, { key: 'quick-title' }, 'Quick Access:'),
      createElement(Text, { color: theme.muted, key: 'quick1' }, '  d  Dashboard'),
      createElement(Text, { color: theme.muted, key: 'quick2' }, '  g  Generate'),
      createElement(Text, { color: theme.muted, key: 'quick3' }, '  c  Catalog'),
      createElement(Text, { color: theme.muted, key: 'quick4' }, '  a  Analytics'),
      createElement(Text, { color: theme.muted, key: 'quick5' }, '  s  Settings'),
      createElement(Box, { height: 1, key: 'spacer3' }),
      createElement(Text, { key: 'other-title' }, 'Other:'),
      createElement(Text, { color: theme.muted, key: 'other1' }, '  t  Change theme'),
      createElement(Text, { color: theme.muted, key: 'other2' }, '  ?  Toggle help'),
      createElement(Text, { color: theme.muted, key: 'other3' }, '  q  Quit')
    ])
  );
  
  return createElement(Box, { flexDirection: 'column', paddingX: 1 }, [
    renderHeader(),
    createElement(Box, { key: 'main' }, [
      renderSidebar(),
      showHelp ? renderHelp() : renderContent()
    ]),
    createElement(Box, { marginTop: 1, key: 'footer' },
      createElement(Text, { color: theme.muted },
        `${new Date().toLocaleTimeString()} • CPU: ${generateSparkline()} • Mem: 42%`
      )
    )
  ]);
};

// Main entry point
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  render(React.createElement(App));
}