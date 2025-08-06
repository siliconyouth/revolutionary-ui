import React from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';

interface ProgressBarProps {
  value: number;
  maxValue?: number;
  label?: string;
  width?: number;
  showValue?: boolean;
  color?: string;
  backgroundColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  maxValue = 100,
  label,
  width = 30,
  showValue = true,
  color = 'cyan',
  backgroundColor = 'gray'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  
  const filledBar = figures.square.repeat(filled);
  const emptyBar = '░'.repeat(empty);
  
  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={1}>
          <Text color={color} bold>{label}</Text>
        </Box>
      )}
      <Box>
        <Text color={color}>{filledBar}</Text>
        <Text color={backgroundColor}>{emptyBar}</Text>
        {showValue && (
          <Text color="white"> {percentage.toFixed(0)}%</Text>
        )}
      </Box>
    </Box>
  );
};