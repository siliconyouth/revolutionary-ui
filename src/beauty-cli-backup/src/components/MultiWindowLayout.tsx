import React from 'react';
import { Box, Text } from 'ink';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

interface MultiWindowLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  sidebarWidth?: number;
}

export const MultiWindowLayout: React.FC<MultiWindowLayoutProps> = ({ 
  sidebar, 
  main, 
  sidebarWidth = 30 
}) => {
  const { columns, rows } = useTerminalSize();
  const mainWidth = columns - sidebarWidth - 1; // -1 for border

  return (
    <Box width={columns} height={rows} flexDirection="row">
      {/* Sidebar */}
      <Box 
        width={sidebarWidth} 
        height={rows}
        borderStyle="single"
        borderColor="gray"
        borderRight={true}
        borderTop={false}
        borderBottom={false}
        borderLeft={false}
        flexDirection="column"
      >
        {sidebar}
      </Box>

      {/* Main Content */}
      <Box 
        width={mainWidth} 
        height={rows}
        flexDirection="column"
        paddingLeft={1}
      >
        {main}
      </Box>
    </Box>
  );
};