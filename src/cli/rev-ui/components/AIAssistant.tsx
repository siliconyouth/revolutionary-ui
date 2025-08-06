import React from 'react';
import { Box, Text } from 'ink';

interface AIAssistantProps {
  message: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Box
      borderStyle="single"
      borderColor="yellow"
      paddingX={1}
      marginBottom={1}
      minHeight={3}
    >
      <Box marginRight={1}>
        <Text color="yellow">🤖</Text>
      </Box>
      <Text wrap="wrap">{message}</Text>
    </Box>
  );
};