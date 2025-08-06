#!/usr/bin/env node

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';

// Clear console
console.clear();

function RevUI() {
  const { exit } = useApp();
  const [screen, setScreen] = useState('welcome');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setLoading(false);
      const timer2 = setTimeout(() => setScreen('main'), 1500);
      return () => clearTimeout(timer2);
    }, 2000);
    return () => clearTimeout(timer1);
  }, []);

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'c')) {
      exit();
    }
  });

  if (screen === 'welcome') {
    return React.createElement(Box, {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: process.stdout.rows
    }, 
      React.createElement(Box, { marginBottom: 2 },
        React.createElement(Gradient, { name: 'rainbow' },
          React.createElement(BigText, { text: 'REV UI', font: 'chrome' })
        )
      ),
      React.createElement(Text, { color: 'cyan', bold: true },
        'Revolutionary UI v3.4.1 - AI-Powered Component Generation'
      ),
      React.createElement(Box, { marginTop: 2 },
        loading 
          ? React.createElement(Text, { color: 'yellow' }, [
              React.createElement(Spinner, { type: 'dots' }),
              ' Initializing...'
            ])
          : React.createElement(Text, { color: 'green' }, '✓ Ready!')
      )
    );
  }

  const menuItems = [
    { label: '🚀 Setup New Project', value: 'setup' },
    { label: '🎨 Generate Component', value: 'generate' },
    { label: '📚 Browse Catalog (10,000+ components)', value: 'browse' },
    { label: '⚙️  Settings', value: 'settings' },
    { label: '📊 Analytics', value: 'analytics' },
    { label: '❌ Exit', value: 'exit' }
  ];

  return React.createElement(Box, {
    flexDirection: 'column',
    height: process.stdout.rows
  },
    React.createElement(Box, {
      borderStyle: 'round',
      borderColor: 'cyan',
      paddingX: 2,
      marginBottom: 1
    },
      React.createElement(Gradient, { name: 'rainbow' },
        React.createElement(Text, { bold: true }, 'Revolutionary UI')
      )
    ),
    
    React.createElement(Box, {
      borderStyle: 'single',
      borderColor: 'yellow',
      paddingX: 1,
      marginBottom: 1
    },
      React.createElement(Text, { color: 'yellow' }, '🤖 '),
      React.createElement(Text, {},
        'Welcome! I\'m here to help you generate components with 60-95% less code. Select an option below.'
      )
    ),
    
    React.createElement(Box, { flexGrow: 1, paddingX: 2 },
      React.createElement(Text, { bold: true, marginBottom: 1 },
        'What would you like to do?'
      ),
      React.createElement(SelectInput, {
        items: menuItems,
        onSelect: (item) => {
          if (item.value === 'exit') {
            exit();
          } else {
            console.log(`Selected: ${item.value}`);
          }
        }
      })
    ),
    
    React.createElement(Box, {
      borderStyle: 'single',
      borderColor: 'gray',
      paddingX: 1,
      justifyContent: 'center'
    },
      React.createElement(Text, { dimColor: true },
        'ESC: Exit • ↑↓: Navigate • Enter: Select'
      )
    )
  );
}

render(React.createElement(RevUI));