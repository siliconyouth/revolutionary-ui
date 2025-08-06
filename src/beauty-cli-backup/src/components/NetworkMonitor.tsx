import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { Panel } from './Panel.js';
import { SparkLine } from './SparkLine.js';
import figures from 'figures';

interface NetworkMonitorProps {
  title?: string;
  borderColor?: string;
}

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({
  title = 'Network Activity',
  borderColor = 'cyan'
}) => {
  const [requests, setRequests] = useState<number[]>(Array(10).fill(0));
  const [latency, setLatency] = useState<number[]>(Array(10).fill(0));
  const [throughput, setThroughput] = useState(0);
  const [activeConnections, setActiveConnections] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate network data
      setRequests(prev => [...prev.slice(1), Math.random() * 100]);
      setLatency(prev => [...prev.slice(1), 50 + Math.random() * 150]);
      setThroughput(Math.random() * 10);
      setActiveConnections(Math.floor(Math.random() * 20));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getStatusColor = (value: number, threshold: number) => {
    return value > threshold ? 'red' : value > threshold / 2 ? 'yellow' : 'green';
  };
  
  return (
    <Panel title={title} color={borderColor}>
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text>Active Connections:</Text>
          <Text color={getStatusColor(activeConnections, 15)} bold>
            {activeConnections}
          </Text>
        </Box>
        
        <Box flexDirection="row" justifyContent="space-between">
          <Text>Throughput:</Text>
          <Text color="cyan" bold>
            {throughput.toFixed(1)} MB/s
          </Text>
        </Box>
        
        <Box marginTop={1}>
          <SparkLine 
            data={requests} 
            label="Requests/s" 
            color="green"
            width={25}
          />
        </Box>
        
        <Box>
          <SparkLine 
            data={latency} 
            label="Latency ms" 
            color="yellow"
            width={25}
          />
        </Box>
        
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>Endpoints:</Text>
          <Text color="green">{figures.circleFilled} /api/generate - 200 OK</Text>
          <Text color="green">{figures.circleFilled} /api/analyze - 200 OK</Text>
          <Text color="yellow">{figures.circleFilled} /api/sync - 202 Pending</Text>
        </Box>
      </Box>
    </Panel>
  );
};