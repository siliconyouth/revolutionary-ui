import React from 'react';
import { Box, Text } from 'ink';

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}

export const SparkLine: React.FC<SparkLineProps> = ({
  data,
  width = 20,
  height = 5,
  color = 'cyan',
  label
}) => {
  if (data.length === 0) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // Normalize data to height
  const normalized = data.map(value => {
    return Math.round(((value - min) / range) * (height - 1));
  });
  
  // Sample data to fit width
  const step = Math.max(1, Math.floor(data.length / width));
  const sampled = [];
  for (let i = 0; i < data.length; i += step) {
    sampled.push(normalized[i]);
  }
  
  // Create sparkline using block characters
  const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const sparkline = sampled.map(value => {
    const index = Math.min(blocks.length - 1, Math.floor((value / height) * blocks.length));
    return blocks[index];
  }).join('');
  
  return (
    <Box flexDirection="row" gap={1}>
      {label && <Text color="gray">{label}:</Text>}
      <Text color={color}>{sparkline}</Text>
      <Text color="gray" dimColor>
        {data[data.length - 1].toFixed(0)}
      </Text>
    </Box>
  );
};