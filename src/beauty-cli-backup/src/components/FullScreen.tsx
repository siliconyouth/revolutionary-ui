import React from 'react';
import { Box } from 'ink';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

interface FullScreenProps {
  children: React.ReactNode;
}

export const FullScreen: React.FC<FullScreenProps> = ({ children }) => {
  const { columns, rows } = useTerminalSize();

  return (
    <Box
      width={columns}
      height={rows}
      flexDirection="column"
    >
      {children}
    </Box>
  );
};