import React from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';

interface MenuItemProps {
  label: string;
  description?: string;
  icon?: string;
  isSelected?: boolean;
  badge?: string;
  badgeColor?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ 
  label, 
  description, 
  icon = figures.pointer,
  isSelected = false,
  badge,
  badgeColor = 'green'
}) => {
  return (
    <Box>
      <Box width={3}>
        <Text color={isSelected ? 'cyan' : 'gray'}>
          {isSelected ? icon : ' '}
        </Text>
      </Box>
      <Box flexDirection="column" flexGrow={1}>
        <Box>
          <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
            {label}
          </Text>
          {badge && (
            <Text color={badgeColor}> [{badge}]</Text>
          )}
        </Box>
        {description && (
          <Box marginLeft={2}>
            <Text color="gray" dimColor>{description}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};