import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

interface LiveLogProps {
  title?: string;
  maxEntries?: number;
  height?: number;
  borderColor?: string;
}

export const LiveLog: React.FC<LiveLogProps> = ({
  title = 'Live Log',
  maxEntries = 10,
  height = 12,
  borderColor = 'gray'
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Simulate log entries for demo
  useEffect(() => {
    const messages = [
      { level: 'info' as const, message: 'System initialized' },
      { level: 'success' as const, message: 'Component generated successfully' },
      { level: 'warning' as const, message: 'High memory usage detected' },
      { level: 'error' as const, message: 'Failed to connect to API' },
      { level: 'info' as const, message: 'Cache cleared' },
      { level: 'success' as const, message: 'Build completed' },
      { level: 'info' as const, message: 'Running analysis...' },
      { level: 'warning' as const, message: 'Deprecated API usage' }
    ];
    
    const interval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => {
        const newLog: LogEntry = {
          ...randomMessage,
          timestamp: new Date()
        };
        return [newLog, ...prev].slice(0, maxEntries);
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [maxEntries]);
  
  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return { icon: figures.info, color: 'blue' };
      case 'warning': return { icon: figures.warning, color: 'yellow' };
      case 'error': return { icon: figures.cross, color: 'red' };
      case 'success': return { icon: figures.tick, color: 'green' };
    }
  };
  
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={borderColor} height={height}>
      <Box paddingX={1} paddingBottom={1}>
        <Text color={borderColor} bold>{title}</Text>
      </Box>
      <Box flexDirection="column" paddingX={1}>
        {logs.map((log, index) => {
          const { icon, color } = getLevelIcon(log.level);
          return (
            <Box key={index} marginBottom={index < logs.length - 1 ? 1 : 0}>
              <Text color="gray" dimColor>
                {log.timestamp.toLocaleTimeString()} 
              </Text>
              <Text color={color}> {icon} </Text>
              <Text color="white">{log.message}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};