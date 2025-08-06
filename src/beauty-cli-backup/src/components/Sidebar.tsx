import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import figures from 'figures';

interface SidebarProps {
  currentScreen: string;
  selectedIndex?: number;
  menuOptions: Array<{
    id: string;
    label: string;
    icon: string;
    badge?: string;
    badgeColor?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, selectedIndex = 0, menuOptions }) => {
  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      {/* Logo */}
      <Box marginBottom={1} alignItems="center">
        <Gradient name="passion">
          <Text bold>REVUI</Text>
        </Gradient>
      </Box>
      
      <Box marginBottom={1}>
        <Text color="gray" dimColor>─────────────────────────</Text>
      </Box>

      {/* Menu Items */}
      <Box flexDirection="column">
        <Text color="gray" dimColor>MENU</Text>
        <Box marginTop={1} flexDirection="column">
          {menuOptions.map((option, index) => {
            const isActive = currentScreen === option.id;
            const isSelected = index === selectedIndex;
            return (
              <Box key={option.id} marginBottom={1}>
                <Box>
                  <Text color={isSelected ? 'yellow' : (isActive ? 'cyan' : 'white')} bold={isSelected || isActive}>
                    {isSelected ? figures.pointer : ' '} {option.icon} {option.label}
                  </Text>
                  {option.badge && (
                    <Text color={option.badgeColor || 'green'}> [{option.badge}]</Text>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Help */}
      <Box marginTop={2} marginBottom={1} flexDirection="column">
        <Text color="gray" dimColor>─────────────────────────</Text>
        <Box marginTop={1}>
          <Text color="gray" dimColor>SHORTCUTS</Text>
        </Box>
        <Box marginTop={1} flexDirection="column">
          <Text color="gray">
            <Text color="yellow">↑↓</Text> Navigate
          </Text>
          <Text color="gray">
            <Text color="yellow">Enter</Text> Select
          </Text>
          <Text color="gray">
            <Text color="yellow">ESC</Text> Back
          </Text>
          <Text color="gray">
            <Text color="red">Ctrl+C</Text> Exit
          </Text>
        </Box>
      </Box>
    </Box>
  );
};