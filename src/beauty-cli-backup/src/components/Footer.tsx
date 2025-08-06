import React from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';

interface FooterProps {
  showHelp?: boolean;
}

export const Footer = React.memo<FooterProps>(({ showHelp = true }) => {
  return (
    <Box 
      marginTop={1}
      paddingY={1}
    >
      <Text color="gray" dimColor>
        {figures.info} Use sidebar navigation • ESC focuses sidebar
      </Text>
    </Box>
  );
});