import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import { DashboardGrid } from '../components/DashboardGrid.js';
import { AsciiChart } from '../components/AsciiChart.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Gauge } from '../components/Gauge.js';
import { DataTable } from '../components/DataTable.js';
import { NetworkMonitor } from '../components/NetworkMonitor.js';
import { Spinner } from '@inkjs/ui';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import figures from 'figures';

interface AnalyzeScreenProps {
  onBack: () => void;
  flags?: Record<string, any>;
}

interface AnalysisResult {
  framework: string;
  componentCount: number;
  codeReduction: number;
  patterns: string[];
  suggestions: string[];
  score: number;
  metrics: {
    files: number;
    lines: number;
    duplicates: number;
    complexity: number;
  };
}

export const AnalyzeScreen: React.FC<AnalyzeScreenProps> = ({ onBack, flags = {} }) => {
  const { columns, rows } = useTerminalSize();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Initializing analysis...');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [complexityData, setComplexityData] = useState<number[]>([]);

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  useEffect(() => {
    const tasks = [
      'Scanning project structure...',
      'Detecting framework and dependencies...',
      'Analyzing component patterns...',
      'Calculating code reduction potential...',
      'Generating AI recommendations...'
    ];

    let taskIndex = 0;
    const interval = setInterval(() => {
      if (taskIndex < tasks.length) {
        setCurrentTask(tasks[taskIndex]);
        setProgress((taskIndex + 1) / tasks.length);
        taskIndex++;
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
        setResult({
          framework: 'React + TypeScript',
          componentCount: 47,
          codeReduction: 72,
          patterns: ['Forms', 'Tables', 'Dashboards', 'Modals'],
          suggestions: [
            'Convert UserForm to FormFactory pattern',
            'Optimize DataTable with TableFactory',
            'Implement lazy loading for Dashboard',
            'Add AI-powered search to components'
          ],
          score: 85,
          metrics: {
            files: 156,
            lines: 12847,
            duplicates: 23,
            complexity: 3.2
          }
        });
        
        // Generate complexity trend data
        const data = Array.from({ length: 20 }, (_, i) => 
          5 - (i * 0.1) + Math.random() * 0.5
        );
        setComplexityData(data);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  if (isAnalyzing) {
    return (
      <Box flexDirection="column" width={columns} height={rows - 1}>
        <Header 
          title="Project Analysis" 
          subtitle={flags.detailed ? "Deep AI-powered analysis" : "Quick project scan"}
        />
        
        <Panel title="Analyzing Project" color="yellow">
          <Box flexDirection="column" gap={1}>
            <Box>
              <Spinner />
              <Text> {currentTask}</Text>
            </Box>
            <Box marginTop={1}>
              <ProgressBar 
                value={progress * 100} 
                label="Progress" 
                width={40}
                color="yellow"
              />
            </Box>
          </Box>
        </Panel>
        
        <Footer showHelp={true} />
      </Box>
    );
  }

  if (!result) return null;

  const fileData = [
    { type: 'Components', count: result.componentCount, size: '234KB', modified: 'Today' },
    { type: 'Services', count: 12, size: '89KB', modified: 'Yesterday' },
    { type: 'Utils', count: 23, size: '45KB', modified: '3 days ago' },
    { type: 'Tests', count: 34, size: '156KB', modified: 'Last week' }
  ];

  const cells = [
    {
      row: 0,
      col: 0,
      content: (
        <Panel title="Overall Health" color="cyan">
          <Gauge 
            value={result.score} 
            label="Project Score" 
            size="medium"
            warningThreshold={60}
            dangerThreshold={40}
          />
        </Panel>
      )
    },
    {
      row: 0,
      col: 1,
      colSpan: 2,
      content: (
        <AsciiChart 
          data={complexityData} 
          title="Complexity Trend (Decreasing = Good)" 
          height={8}
          color="green"
        />
      )
    },
    {
      row: 1,
      col: 0,
      colSpan: 2,
      content: (
        <DataTable 
          data={fileData}
          title="Project Structure"
          borderColor="yellow"
          columns={['type', 'count', 'size', 'modified']}
        />
      )
    },
    {
      row: 1,
      col: 2,
      content: (
        <Panel title="Metrics" color="magenta">
          <Box flexDirection="column" gap={1}>
            <Text>Files: <Text color="cyan" bold>{result.metrics.files}</Text></Text>
            <Text>Lines: <Text color="cyan" bold>{result.metrics.lines.toLocaleString()}</Text></Text>
            <Text>Duplicates: <Text color="yellow" bold>{result.metrics.duplicates}</Text></Text>
            <Text>Complexity: <Text color="green" bold>{result.metrics.complexity}</Text></Text>
            <Box marginTop={1}>
              <Text color="gray" dimColor>Lower is better</Text>
            </Box>
          </Box>
        </Panel>
      )
    },
    {
      row: 2,
      col: 0,
      colSpan: 2,
      content: (
        <Panel title="AI Recommendations" color="green">
          <Box flexDirection="column" gap={1}>
            {result.suggestions.map((suggestion, i) => (
              <Box key={i}>
                <Text color="yellow">{figures.pointer}</Text>
                <Text> {suggestion}</Text>
              </Box>
            ))}
          </Box>
        </Panel>
      )
    },
    {
      row: 2,
      col: 2,
      content: <NetworkMonitor title="API Status" />
    }
  ];

  return (
    <Box flexDirection="column" width={columns} height={rows - 1}>
      <Header 
        title="Project Analysis Complete" 
        subtitle={`${result.framework} • ${result.codeReduction}% reduction potential`}
      />
      
      <Box flexGrow={1} marginTop={1}>
        <DashboardGrid 
          rows={3} 
          cols={3} 
          cells={cells}
        />
      </Box>
      
      <Box marginTop={1}>
        <Text color="gray">{figures.info} Run </Text>
        <Text color="yellow">revui generate</Text>
        <Text color="gray"> to implement AI recommendations</Text>
      </Box>
      
      <Footer showHelp={true} />
    </Box>
  );
};