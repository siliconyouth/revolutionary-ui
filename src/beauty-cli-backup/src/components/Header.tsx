import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import figures from 'figures';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = React.memo<HeaderProps>(({ title, subtitle }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color="cyan" bold>{title}</Text>
      </Box>
      {subtitle && (
        <Box>
          <Text color="gray" dimColor>{subtitle}</Text>
        </Box>
      )}
    </Box>
  );
});