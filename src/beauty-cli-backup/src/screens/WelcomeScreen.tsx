import React from 'react';
import { Box, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import Spinner from 'ink-spinner';
import { Badge } from '@inkjs/ui';

export const WelcomeScreen: React.FC = () => {
  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
      <Box marginBottom={1}>
        <Gradient name="rainbow">
          <BigText text="REVUI" font="chrome" />
        </Gradient>
      </Box>
      
      <Box marginBottom={2}>
        <Text color="cyan" bold>🚀 Revolutionary UI Factory System 🚀</Text>
      </Box>
      
      <Box marginBottom={2}>
        <Text color="gray">AI-Powered Component Generation</Text>
      </Box>
      
      <Box>
        <Text color="green">
          <Spinner type="dots" /> Loading revolutionary features...
        </Text>
      </Box>
      
      <Box marginTop={1}>
        <Badge color="blue">v3.4.1</Badge>
        <Text color="gray"> • </Text>
        <Badge color="green">150+ Components</Badge>
        <Text color="gray"> • </Text>
        <Badge color="yellow">60-95% Code Reduction</Badge>
      </Box>
    </Box>
  );
};