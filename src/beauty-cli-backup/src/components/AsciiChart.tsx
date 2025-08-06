import React from 'react';
import { Box, Text } from 'ink';
import asciichart from 'asciichart';

interface AsciiChartProps {
  data: number[];
  height?: number;
  width?: number;
  title?: string;
  color?: string;
}

export const AsciiChart: React.FC<AsciiChartProps> = ({ 
  data, 
  height = 10, 
  width = 60,
  title,
  color = 'cyan'
}) => {
  const chart = asciichart.plot(data, {
    height,
    format: (x: number) => (' ' + x.toFixed(0)).slice(-5)
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={color} paddingX={1}>
      {title && (
        <Box marginBottom={1}>
          <Text color={color} bold>{title}</Text>
        </Box>
      )}
      <Text color={color}>{chart}</Text>
    </Box>
  );
};