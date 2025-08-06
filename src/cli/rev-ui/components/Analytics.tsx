import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { SessionManager } from '../services/SessionManager.js';

interface AnalyticsProps {
  onBack: () => void;
  sessionData: any;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onBack, sessionData }) => {
  const analytics = SessionManager.getAnalytics();
  
  // Mock data for demonstration
  const weeklyData = [
    { day: 'Mon', components: 12, reduction: 78 },
    { day: 'Tue', components: 8, reduction: 82 },
    { day: 'Wed', components: 15, reduction: 75 },
    { day: 'Thu', components: 10, reduction: 80 },
    { day: 'Fri', components: 18, reduction: 85 },
    { day: 'Sat', components: 5, reduction: 72 },
    { day: 'Sun', components: 7, reduction: 79 }
  ];

  const maxComponents = Math.max(...weeklyData.map(d => d.components));

  return (
    <Box flexDirection="column" padding={2}>
      <Text bold marginBottom={2}>Analytics Dashboard</Text>
      
      {/* Session Stats */}
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="cyan">Current Session</Text>
        <Box flexDirection="row" gap={4}>
          <Box flexDirection="column">
            <Text dimColor>Duration</Text>
            <Text bold>{analytics.sessionDuration} min</Text>
          </Box>
          <Box flexDirection="column">
            <Text dimColor>Components</Text>
            <Text bold color="green">{analytics.componentsGenerated}</Text>
          </Box>
          <Box flexDirection="column">
            <Text dimColor>Code Reduction</Text>
            <Text bold color="yellow">{analytics.averageCodeReduction}%</Text>
          </Box>
        </Box>
      </Box>

      {/* Weekly Chart */}
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="cyan">Weekly Activity</Text>
        <Box flexDirection="column" marginTop={1}>
          {weeklyData.map((day, i) => {
            const barLength = Math.round((day.components / maxComponents) * 20);
            const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
            
            return (
              <Box key={i} flexDirection="row" gap={1}>
                <Text width={4}>{day.day}</Text>
                <Text color="cyan">{bar}</Text>
                <Text dimColor>{day.components} ({day.reduction}%)</Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Summary Stats */}
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="cyan">All Time Stats</Text>
        <Box flexDirection="column" gap={1}>
          <Text>📊 Total Components Generated: <Text bold color="green">247</Text></Text>
          <Text>⚡ Average Code Reduction: <Text bold color="yellow">78%</Text></Text>
          <Text>⏱️ Time Saved: <Text bold color="cyan">~62 hours</Text></Text>
          <Text>🏆 Most Used: <Text bold>Data Tables (45)</Text></Text>
          <Text>🎯 Favorite Framework: <Text bold>React + TypeScript</Text></Text>
        </Box>
      </Box>

      {/* Top Components */}
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="cyan">Top Component Types</Text>
        <Box flexDirection="column">
          <Text>1. Data Tables - 45 generated (82% reduction)</Text>
          <Text>2. Forms - 38 generated (75% reduction)</Text>
          <Text>3. Dashboards - 32 generated (91% reduction)</Text>
          <Text>4. Charts - 28 generated (85% reduction)</Text>
          <Text>5. Modals - 24 generated (68% reduction)</Text>
        </Box>
      </Box>

      <SelectInput
        items={[
          { label: '📊 Export Analytics', value: 'export' },
          { label: '🔄 Refresh', value: 'refresh' },
          { label: '← Back', value: 'back' }
        ]}
        onSelect={(item) => {
          if (item.value === 'back') {
            onBack();
          } else if (item.value === 'export') {
            // Would export analytics data
          } else if (item.value === 'refresh') {
            // Would refresh data
          }
        }}
      />
    </Box>
  );
};