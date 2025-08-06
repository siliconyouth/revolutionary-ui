#!/usr/bin/env node

const React = require('react');
const { render, Box, Text, useApp, useInput } = require('ink');
const BigText = require('ink-big-text').default;
const Gradient = require('ink-gradient').default;
const SelectInput = require('ink-select-input').default;
const Spinner = require('ink-spinner').default;
const TextInput = require('ink-text-input').default;

// Clear console and run the app
console.clear();

const RevUI = () => {
  const { exit } = useApp();
  const [screen, setScreen] = React.useState('welcome');
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setScreen('main'), 1500);
    }, 2000);
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
    }, [
      React.createElement(Box, { key: 'title', marginBottom: 2 },
        React.createElement(Gradient, { name: 'rainbow' },
          React.createElement(BigText, { text: 'REV UI', font: 'chrome' })
        )
      ),
      React.createElement(Text, { key: 'subtitle', color: 'cyan', bold: true },
        'Revolutionary UI v3.4.1 - AI-Powered Component Generation'
      ),
      React.createElement(Box, { key: 'status', marginTop: 2 },
        loading 
          ? React.createElement(Text, { color: 'yellow' }, [
              React.createElement(Spinner, { key: 'spinner', type: 'dots' }),
              ' Initializing...'
            ])
          : React.createElement(Text, { color: 'green' }, '✓ Ready!')
      )
    ]);
  }

  const menuItems = [
    { label: '🚀 Setup New Project', value: 'setup' },
    { label: '🎨 Generate Component', value: 'generate' },
    { label: '📚 Browse Catalog', value: 'browse' },
    { label: '⚙️  Settings', value: 'settings' },
    { label: '📊 Analytics', value: 'analytics' },
    { label: '❌ Exit', value: 'exit' }
  ];

  return React.createElement(Box, {
    flexDirection: 'column',
    height: process.stdout.rows
  }, [
    React.createElement(Box, {
      key: 'header',
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
      key: 'ai-bar',
      borderStyle: 'single',
      borderColor: 'yellow',
      paddingX: 1,
      marginBottom: 1
    }, [
      React.createElement(Text, { key: 'robot', color: 'yellow' }, '🤖 '),
      React.createElement(Text, { key: 'message' }, 
        'Welcome! I\'m here to help you generate components with 60-95% less code. Select an option below.'
      )
    ]),
    React.createElement(Box, { key: 'menu', flexGrow: 1, paddingX: 2 }, [
      React.createElement(Text, { key: 'title', bold: true, marginBottom: 1 }, 
        'What would you like to do?'
      ),
      React.createElement(SelectInput, {
        key: 'select',
        items: menuItems,
        onSelect: (item) => {
          if (item.value === 'exit') {
            exit();
          } else {
            // In a full implementation, navigate to different screens
            console.log(`Selected: ${item.value}`);
          }
        }
      })
    ]),
    React.createElement(Box, {
      key: 'footer',
      borderStyle: 'single',
      borderColor: 'gray',
      paddingX: 1,
      justifyContent: 'center'
    },
      React.createElement(Text, { dimColor: true },
        'ESC: Exit • ↑↓: Navigate • Enter: Select'
      )
    )
  ]);
};

render(React.createElement(RevUI));