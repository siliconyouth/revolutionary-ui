import React from 'react';
import { Box, Text } from 'ink';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  color?: string;
  width?: number | string;
}

export const Panel = React.memo<PanelProps>(({ 
  title, 
  children, 
  color = 'cyan',
  width 
}) => {
  return (
    <Box 
      flexDirection="column" 
      borderStyle="round" 
      borderColor={color}
      width={width}
      marginRight={1}
      marginBottom={1}
    >
      <Box paddingX={1} borderBottom borderStyle="single" borderColor={color}>
        <Text color={color} bold>{title}</Text>
      </Box>
      <Box paddingX={1} paddingY={1}>
        {children}
      </Box>
    </Box>
  );
});