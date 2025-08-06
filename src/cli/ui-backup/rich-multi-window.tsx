#!/usr/bin/env node
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';
import Spinner from 'ink-spinner';
import { Select } from '@inkjs/ui';
import figures from 'figures';

// Terminal size hook
const useTerminalSize = () => {
  const [size, setSize] = useState({
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24
      });
    };

    process.stdout.on('resize', handleResize);
    return () => process.stdout.off('resize', handleResize);
  }, []);

  return size;
};

// Multi-window layout component
interface MultiWindowLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  footer?: React.ReactNode;
  sidebarWidth?: number;
}

const MultiWindowLayout: React.FC<MultiWindowLayoutProps> = ({ 
  sidebar, 
  main, 
  footer,
  sidebarWidth = 30 
}) => {
  const { columns, rows } = useTerminalSize();
  const mainWidth = columns - sidebarWidth - 1;
  const contentHeight = footer ? rows - 4 : rows - 2;

  return (
    <Box flexDirection="column" width={columns} height={rows}>
      <Box flexDirection="row" height={contentHeight}>
        <Box 
          width={sidebarWidth} 
          borderStyle="single" 
          borderColor="cyan"
          flexDirection="column"
        >
          {sidebar}
        </Box>
        <Box 
          width={mainWidth} 
          borderStyle="single" 
          borderColor="green"
          paddingX={1}
        >
          {main}
        </Box>
      </Box>
      {footer && (
        <Box 
          height={2} 
          borderStyle="single" 
          borderColor="gray"
          paddingX={1}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
};

// Sidebar component
interface SidebarProps {
  items: Array<{ id: string; label: string; icon: string; badge?: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, selectedId, onSelect }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (key.downArrow) {
      setFocusedIndex((prev) => (prev + 1) % items.length);
    } else if (key.return) {
      onSelect(items[focusedIndex].id);
    }
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginBottom={1}>
        <Gradient name="rainbow">
          <Text bold>REVOLUTIONARY UI</Text>
        </Gradient>
      </Box>
      <Text dimColor>━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
      <Box flexDirection="column" marginTop={1}>
        {items.map((item, index) => {
          const isSelected = item.id === selectedId;
          const isFocused = index === focusedIndex;
          
          return (
            <Box key={item.id} marginBottom={1}>
              <Text color={isSelected ? 'cyan' : isFocused ? 'yellow' : 'white'}>
                {isFocused ? '▶ ' : '  '}
                {item.icon} {item.label}
                {item.badge && (
                  <Text color="yellow"> [{item.badge}]</Text>
                )}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// Dashboard with charts
const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    efficiency: 71,
    memory: 42,
    cpu: 18,
    requests: 1247
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        efficiency: Math.max(60, Math.min(95, prev.efficiency + (Math.random() - 0.5) * 5)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 10)),
        cpu: Math.max(10, Math.min(80, prev.cpu + (Math.random() - 0.5) * 8)),
        requests: prev.requests + Math.floor(Math.random() * 10)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simple bar chart
  const renderBar = (value: number, max: number, width: number, color: string) => {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;
    
    return (
      <Text>
        <Text color={color}>{'█'.repeat(filled)}</Text>
        <Text color="gray">{'░'.repeat(empty)}</Text>
        <Text> {value}%</Text>
      </Text>
    );
  };

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">📊 System Dashboard</Text>
      <Box marginTop={1} flexDirection="column">
        {/* Metrics Grid */}
        <Box marginBottom={1}>
          <Text color="green">⚡ Efficiency: </Text>
          {renderBar(metrics.efficiency, 100, 20, 'green')}
        </Box>
        
        <Box marginBottom={1}>
          <Text color="blue">💾 Memory: </Text>
          {renderBar(metrics.memory, 100, 20, 'blue')}
        </Box>
        
        <Box marginBottom={1}>
          <Text color="yellow">🖥️  CPU: </Text>
          {renderBar(metrics.cpu, 100, 20, 'yellow')}
        </Box>

        {/* Stats */}
        <Box marginTop={1} borderStyle="round" borderColor="cyan" padding={1}>
          <Box flexDirection="column">
            <Text>Total Requests: <Text color="cyan" bold>{metrics.requests.toLocaleString()}</Text></Text>
            <Text>Components: <Text color="green" bold>156</Text></Text>
            <Text>Time Saved: <Text color="yellow" bold>248h</Text></Text>
          </Box>
        </Box>

        {/* Activity Log */}
        <Box marginTop={1} borderStyle="round" borderColor="green" padding={1}>
          <Text color="green" bold>Recent Activity</Text>
          <Box flexDirection="column" marginTop={1}>
            <Text dimColor>• Component generated</Text>
            <Text dimColor>• Analysis complete</Text>
            <Text dimColor>• Cloud sync active</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Generate screen
const GenerateScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const componentTypes = [
    { value: 'form', label: '📝 Form Factory' },
    { value: 'table', label: '📊 Table Factory' },
    { value: 'dashboard', label: '📈 Dashboard Factory' },
    { value: 'chart', label: '📉 Chart Factory' }
  ];

  useInput((input, key) => {
    if (key.return && step === 0) {
      setStep(1);
      setIsGenerating(true);
      setTimeout(() => setIsGenerating(false), 2000);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">🤖 AI Component Generator</Text>
      
      {step === 0 && (
        <Box marginTop={2}>
          <Select
            options={componentTypes}
            onChange={() => {}}
          />
        </Box>
      )}
      
      {step === 1 && (
        <Box marginTop={2}>
          {isGenerating ? (
            <Box>
              <Spinner type="dots" />
              <Text> Generating component...</Text>
            </Box>
          ) : (
            <Box flexDirection="column">
              <Text color="green">✓ Component generated successfully!</Text>
              <Box marginTop={1} borderStyle="round" borderColor="gray" padding={1}>
                <Text>FormFactory created at:</Text>
                <Text color="cyan">src/components/FormFactory.tsx</Text>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

// Main App
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: 'LIVE' },
    { id: 'generate', label: 'Generate', icon: '🤖', badge: 'AI' },
    { id: 'analyze', label: 'Analyze', icon: '🔍' },
    { id: 'search', label: 'Search', icon: '🔎' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'generate':
        return <GenerateScreen />;
      default:
        return (
          <Box flexDirection="column">
            <Text bold color="yellow">{currentView.toUpperCase()}</Text>
            <Text dimColor marginTop={1}>Feature coming soon...</Text>
          </Box>
        );
    }
  };

  return (
    <MultiWindowLayout
      sidebar={
        <Sidebar 
          items={menuItems}
          selectedId={currentView}
          onSelect={setCurrentView}
        />
      }
      main={renderMainContent()}
      footer={
        <Text dimColor>
          ↑↓ Navigate • Enter Select • Ctrl+C Exit • v3.4.1
        </Text>
      }
    />
  );
};

// Clear screen and render
console.clear();
render(<App />);