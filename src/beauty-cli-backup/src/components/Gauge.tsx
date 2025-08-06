import React from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';

interface GaugeProps {
  value: number;
  maxValue?: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  maxValue = 100,
  label,
  size = 'medium',
  color = 'cyan',
  warningThreshold = 70,
  dangerThreshold = 90
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Determine color based on thresholds
  let gaugeColor = color;
  if (percentage >= dangerThreshold) {
    gaugeColor = 'red';
  } else if (percentage >= warningThreshold) {
    gaugeColor = 'yellow';
  }
  
  // ASCII gauge visualization
  const sizeConfig = {
    small: { width: 10, height: 3 },
    medium: { width: 20, height: 5 },
    large: { width: 30, height: 7 }
  };
  
  const { width } = sizeConfig[size];
  const filled = Math.round((percentage / 100) * width);
  
  // Create arc-like gauge
  const gaugeTop = '╭' + '─'.repeat(width - 2) + '╮';
  const gaugeMiddle = '│' + figures.square.repeat(filled) + ' '.repeat(width - filled - 2) + '│';
  const gaugeBottom = '╰' + '─'.repeat(width - 2) + '╯';
  
  return (
    <Box flexDirection="column" alignItems="center">
      {label && (
        <Text color={gaugeColor} bold>{label}</Text>
      )}
      <Box flexDirection="column" marginTop={1}>
        <Text color={gaugeColor}>{gaugeTop}</Text>
        <Text color={gaugeColor}>{gaugeMiddle}</Text>
        <Text color={gaugeColor}>{gaugeBottom}</Text>
      </Box>
      <Text color={gaugeColor} bold>{percentage.toFixed(0)}%</Text>
    </Box>
  );
};