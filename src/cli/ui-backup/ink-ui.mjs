#!/usr/bin/env node

/**
 * Ink Beautiful Terminal UI for Revolutionary UI
 * ESM version for Ink v6
 */

import React from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';

const { createElement: h, useState } = React;

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
  
  return h(Box, { flexDirection: 'column' }, [
    // Header
    h(Box, { key: 'header', marginBottom: 1, justifyContent: 'space-between' }, [
      h(Gradient, { key: 'gradient', name: 'rainbow' },
        h(BigText, { text: 'REVOLUTIONARY UI', font: 'tiny' })
      ),
      h(Box, { key: 'info', flexDirection: 'column', alignItems: 'flex-end' }, [
        h(Text, { key: 'version', color: theme.muted }, 'v3.4.1 Ink Edition'),
        h(Text, { key: 'theme', color: theme.muted }, `Theme: ${currentTheme} [t]`)
      ])
    ]),
    
    h(Box, { key: 'main' }, [
      // Sidebar
      h(Box, {
        key: 'sidebar',
        flexDirection: 'column',
        marginRight: 2,
        paddingRight: 2,
        borderStyle: 'single',
        borderColor: theme.muted,
        width: 20,
        minHeight: 20
      }, [
        h(Text, { key: 'title', color: theme.primary, bold: true }, '▶ Menu'),
        h(Box, { key: 'spacer1', height: 1 }),
        ...menuItems.map((item, index) => 
          h(Box, { key: item.value, marginBottom: 1 },
            h(Text, { color: view === item.value ? theme.accent : 'white' },
              `${selectedIndex === index ? '▶' : ' '} ${item.label}`
            )
          )
        ),
        h(Box, { key: 'flexgrow', flexGrow: 1 }),
        h(Text, { key: 'divider', color: theme.muted }, '───────────────'),
        h(Text, { key: 'help', color: theme.muted }, '◆ [?] Help'),
        h(Text, { key: 'quit', color: theme.muted }, '✕ [q] Quit')
      ]),
      
      // Main Content
      h(Box, { key: 'content', flexDirection: 'column', flexGrow: 1 }, [
        view === 'dashboard' && h(Box, { key: 'dashboard', flexDirection: 'column' }, [
          h(Text, { key: 'title', color: theme.primary, bold: true }, '⌂ Dashboard'),
          h(Box, { key: 'spacer', height: 1 }),
          
          // Stats Row
          h(Box, { key: 'stats', marginBottom: 2 }, [
            h(Box, {
              key: 'stat1',
              borderStyle: 'round',
              borderColor: theme.success,
              paddingX: 2,
              paddingY: 1,
              marginRight: 1,
              width: 20,
              flexDirection: 'column',
              alignItems: 'center'
            }, [
              h(Text, { key: 'icon', color: theme.success }, '◆'),
              h(Text, { key: 'value', color: 'white', bold: true }, stats.components.toString()),
              h(Text, { key: 'label', dimColor: true }, 'Components'),
              h(Text, { key: 'spark', color: theme.success, dimColor: true }, generateSparkline())
            ]),
            
            h(Box, {
              key: 'stat2',
              borderStyle: 'round',
              borderColor: theme.primary,
              paddingX: 2,
              paddingY: 1,
              marginRight: 1,
              width: 20,
              flexDirection: 'column',
              alignItems: 'center'
            }, [
              h(Text, { key: 'icon', color: theme.primary }, '◉'),
              h(Text, { key: 'value', color: 'white', bold: true }, stats.linesaved),
              h(Text, { key: 'label', dimColor: true }, 'Lines Saved'),
              h(Text, { key: 'spark', color: theme.primary, dimColor: true }, generateSparkline())
            ]),
            
            h(Box, {
              key: 'stat3',
              borderStyle: 'round',
              borderColor: theme.warning,
              paddingX: 2,
              paddingY: 1,
              marginRight: 1,
              width: 20,
              flexDirection: 'column',
              alignItems: 'center'
            }, [
              h(Text, { key: 'icon', color: theme.warning }, '▣'),
              h(Text, { key: 'value', color: 'white', bold: true }, stats.projects.toString()),
              h(Text, { key: 'label', dimColor: true }, 'Projects'),
              h(Text, { key: 'spark', color: theme.warning, dimColor: true }, generateSparkline())
            ]),
            
            h(Box, {
              key: 'stat4',
              borderStyle: 'round',
              borderColor: theme.secondary,
              paddingX: 2,
              paddingY: 1,
              width: 20,
              flexDirection: 'column',
              alignItems: 'center'
            }, [
              h(Text, { key: 'icon', color: theme.secondary }, '◈'),
              h(Text, { key: 'value', color: 'white', bold: true }, stats.team.toString()),
              h(Text, { key: 'label', dimColor: true }, 'Team'),
              h(Text, { key: 'spark', color: theme.secondary, dimColor: true }, generateSparkline())
            ])
          ]),
          
          // Activity Feed
          h(Box, { key: 'activity', flexDirection: 'column' }, [
            h(Text, { key: 'title', color: theme.primary, bold: true, marginBottom: 1 }, '● Recent Activity'),
            h(Box, { key: 'items', flexDirection: 'column' }, [
              h(Box, { key: 'item1', marginBottom: 1 }, [
                h(Text, { key: 'time', color: theme.muted }, '2m ago '),
                h(Text, { key: 'icon', color: theme.success }, '✓ '),
                h(Text, { key: 'user', bold: true }, 'You'),
                h(Text, { key: 'action' }, ': Generated DataTable component')
              ]),
              h(Box, { key: 'item2', marginBottom: 1 }, [
                h(Text, { key: 'time', color: theme.muted }, '15m ago '),
                h(Text, { key: 'icon', color: theme.secondary }, '◆ '),
                h(Text, { key: 'user', bold: true }, 'Alice'),
                h(Text, { key: 'action' }, ': Updated FormBuilder template')
              ]),
              h(Box, { key: 'item3', marginBottom: 1 }, [
                h(Text, { key: 'time', color: theme.muted }, '1h ago '),
                h(Text, { key: 'icon', color: theme.warning }, '⚠ '),
                h(Text, { key: 'user', bold: true }, 'System'),
                h(Text, { key: 'action' }, ': AI model updated to GPT-4')
              ])
            ])
          ])
        ]),
        
        view === 'generate' && h(Box, { key: 'generate', flexDirection: 'column' }, [
          h(Text, { key: 'title', color: theme.primary, bold: true }, '▶ Component Generator'),
          h(Box, { key: 'spacer', height: 1 }),
          
          h(Box, { key: 'input', marginBottom: 1 }, [
            h(Text, { key: 'label' }, 'Component Name: '),
            h(TextInput, {
              key: 'textinput',
              value: componentName,
              onChange: setComponentName,
              placeholder: 'Enter component name...'
            })
          ]),
          
          isGenerating ? 
            h(Box, { key: 'generating' },
              h(Text, { color: theme.secondary }, [
                h(Spinner, { key: 'spinner', type: 'dots' }),
                ' Generating component...'
              ])
            ) :
            h(Box, { key: 'help', marginTop: 1 },
              h(Text, { color: theme.muted }, 'Press Enter to generate component')
            )
        ]),
        
        view === 'catalog' && h(Text, { key: 'catalog', color: theme.primary }, '◉ Component Catalog coming soon...'),
        view === 'analytics' && h(Text, { key: 'analytics', color: theme.primary }, '◈ Analytics coming soon...'),
        view === 'settings' && h(Text, { key: 'settings', color: theme.primary }, '⚙ Settings coming soon...')
      ])
    ]),
    
    // Footer
    h(Box, { key: 'footer', marginTop: 1 },
      h(Text, { color: theme.muted },
        `${new Date().toLocaleTimeString()} • CPU: ${generateSparkline()} • Mem: 42%`
      )
    )
  ]);
};

// Run the app
render(h(App));