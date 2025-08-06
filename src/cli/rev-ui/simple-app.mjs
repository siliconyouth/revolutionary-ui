#!/usr/bin/env node

import React from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';

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
    return (
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height={process.stdout.rows}
      >
        <Box marginBottom={2}>
          <Gradient name="rainbow">
            <BigText text="REV UI" font="chrome" />
          </Gradient>
        </Box>
        <Text color="cyan" bold>
          Revolutionary UI v3.4.1 - AI-Powered Component Generation
        </Text>
        <Box marginTop={2}>
          {loading ? (
            <Text color="yellow">
              <Spinner type="dots" /> Initializing...
            </Text>
          ) : (
            <Text color="green">✓ Ready!</Text>
          )}
        </Box>
      </Box>
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

  return (
    <Box flexDirection="column" height={process.stdout.rows}>
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        marginBottom={1}
      >
        <Gradient name="rainbow">
          <Text bold>Revolutionary UI</Text>
        </Gradient>
      </Box>
      
      <Box
        borderStyle="single"
        borderColor="yellow"
        paddingX={1}
        marginBottom={1}
      >
        <Text color="yellow">🤖 </Text>
        <Text>
          Welcome! I'm here to help you generate components with 60-95% less code. Select an option below.
        </Text>
      </Box>
      
      <Box flexGrow={1} paddingX={2}>
        <Text bold marginBottom={1}>
          What would you like to do?
        </Text>
        <SelectInput
          items={menuItems}
          onSelect={(item) => {
            if (item.value === 'exit') {
              exit();
            } else {
              // In a full implementation, navigate to different screens
              console.log(`Selected: ${item.value}`);
            }
          }}
        />
      </Box>
      
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        justifyContent="center"
      >
        <Text dimColor>
          ESC: Exit • ↑↓: Navigate • Enter: Select
        </Text>
      </Box>
    </Box>
  );
};

render(<RevUI />);