import React from 'react';
import { Box, Text } from 'ink';

interface StaticProgressBarProps {
  value: number;
  width?: number;
  showPercentage?: boolean;
}

export const StaticProgressBar = React.memo<StaticProgressBarProps>(({ 
  value, 
  width = 20,
  showPercentage = false 
}) => {
  const percentage = Math.round(value * 100);
  const filled = Math.round(width * value);
  const empty = width - filled;
  
  const getColor = () => {
    if (value < 0.5) return 'green';
    if (value < 0.8) return 'yellow';
    return 'red';
  };
  
  return (
    <Box>
      <Text color={getColor()}>
        {'█'.repeat(filled)}
      </Text>
      <Text color="gray">
        {'░'.repeat(empty)}
      </Text>
      {showPercentage && (
        <Text color={getColor()}> {percentage}%</Text>
      )}
    </Box>
  );
});