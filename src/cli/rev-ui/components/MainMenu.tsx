import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Gradient from 'ink-gradient';

interface MainMenuProps {
  onSelect: (value: string) => void;
  dbReady: boolean;
  aiReady: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelect, dbReady, aiReady }) => {
  const items = [
    {
      label: '🚀 Setup New Project',
      value: 'setup',
      description: 'Configure a new Revolutionary UI project with AI guidance'
    },
    {
      label: '🎨 Generate Component',
      value: 'generate',
      description: 'Create UI components using AI and factory patterns'
    },
    {
      label: '📚 Browse Catalog',
      value: 'browse',
      description: `Explore ${dbReady ? '10,000+' : 'cached'} components with semantic search`
    },
    {
      label: '⚙️  Settings',
      value: 'settings',
      description: 'Configure preferences, AI providers, and project settings'
    },
    {
      label: '📊 Analytics',
      value: 'analytics',
      description: 'View usage statistics and code reduction metrics'
    }
  ];

  const renderItem = (item: any) => (
    <Box paddingY={1}>
      <Box flexDirection="column">
        <Text bold color={item.isSelected ? 'cyan' : 'white'}>
          {item.isSelected ? '▶ ' : '  '}{item.label}
        </Text>
        <Box marginLeft={4}>
          <Text dimColor wrap="wrap">
            {item.description}
          </Text>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box marginBottom={2} justifyContent="center">
        <Gradient name="morning">
          <Text bold>What would you like to do?</Text>
        </Gradient>
      </Box>

      <Box marginBottom={2} flexDirection="row" justifyContent="center">
        <Box marginRight={2}>
          <Text color={dbReady ? 'green' : 'yellow'}>
            {dbReady ? '✓' : '○'} Database
          </Text>
        </Box>
        <Box marginRight={2}>
          <Text color={aiReady ? 'green' : 'yellow'}>
            {aiReady ? '✓' : '○'} AI
          </Text>
        </Box>
        <Text dimColor>
          {dbReady && aiReady ? 'All systems operational' : 'Limited mode'}
        </Text>
      </Box>

      <SelectInput
        items={items}
        onSelect={(item) => onSelect(item.value)}
        itemComponent={renderItem}
      />
    </Box>
  );
};