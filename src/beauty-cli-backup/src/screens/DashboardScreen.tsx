import React, { useState, useEffect } from 'react';
import { Box, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { DashboardGrid } from '../components/DashboardGrid.js';
import { AsciiChart } from '../components/AsciiChart.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Gauge } from '../components/Gauge.js';
import { DataTable } from '../components/DataTable.js';
import { SparkLine } from '../components/SparkLine.js';
import { LiveLog } from '../components/LiveLog.js';
import { Panel } from '../components/Panel.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

interface DashboardScreenProps {
  onBack: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onBack }) => {
  const { columns, rows } = useTerminalSize();
  
  // Generate sample data
  const [chartData, setChartData] = useState<number[]>([]);
  const [sparkData] = useState(() => 
    Array.from({ length: 20 }, () => Math.random() * 100)
  );
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(72);
  const [efficiency, setEfficiency] = useState(71);
  
  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });
  
  useEffect(() => {
    // Initialize chart data
    const data = Array.from({ length: 30 }, (_, i) => 
      50 + Math.sin(i * 0.2) * 30 + Math.random() * 10
    );
    setChartData(data);
    
    // Update metrics
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(30, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(50, Math.min(95, prev + (Math.random() - 0.5) * 5)));
      setEfficiency(prev => Math.max(60, Math.min(85, prev + (Math.random() - 0.5) * 3)));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const tableData = [
    { component: 'FormFactory', usage: 234, reduction: '82%', status: 'Active' },
    { component: 'TableFactory', usage: 189, reduction: '75%', status: 'Active' },
    { component: 'DashboardFactory', usage: 156, reduction: '68%', status: 'Active' },
    { component: 'ChartFactory', usage: 142, reduction: '71%', status: 'Beta' },
    { component: 'ModalFactory', usage: 98, reduction: '65%', status: 'Active' }
  ];
  
  const cells = [
    {
      row: 0,
      col: 0,
      colSpan: 2,
      content: (
        <AsciiChart 
          data={chartData} 
          title="Code Reduction Over Time" 
          height={8}
          color="green"
        />
      )
    },
    {
      row: 0,
      col: 2,
      content: (
        <Panel title="System Metrics" color="cyan">
          <Gauge 
            value={efficiency} 
            label="Efficiency" 
            size="small"
            color="green"
          />
          <Box marginTop={1}>
            <ProgressBar 
              value={memoryUsage} 
              label="Memory" 
              width={20}
              color="blue"
            />
          </Box>
          <Box marginTop={1}>
            <ProgressBar 
              value={cpuUsage} 
              label="CPU" 
              width={20}
              color="green"
            />
          </Box>
        </Panel>
      )
    },
    {
      row: 1,
      col: 0,
      colSpan: 2,
      content: (
        <DataTable 
          data={tableData}
          title="Factory Performance"
          borderColor="yellow"
          maxRows={5}
        />
      )
    },
    {
      row: 1,
      col: 2,
      content: (
        <Panel title="Quick Stats" color="magenta">
          <SparkLine 
            data={sparkData.slice(0, 10)} 
            label="Requests"
            color="cyan"
          />
          <Box marginTop={1}>
            <SparkLine 
              data={sparkData.slice(10, 20)} 
              label="Response"
              color="green"
            />
          </Box>
        </Panel>
      )
    },
    {
      row: 2,
      col: 0,
      colSpan: 3,
      content: <LiveLog title="System Activity" height={8} />
    }
  ];
  
  return (
    <Box flexDirection="column" width={columns} height={rows - 1}>
      <Header 
        title="Revolutionary UI Dashboard" 
        subtitle="Real-time Factory Performance Monitoring"
      />
      
      <Box flexGrow={1} marginTop={1}>
        <DashboardGrid 
          rows={3} 
          cols={3} 
          cells={cells}
        />
      </Box>
      
      <Footer showHelp={true} />
    </Box>
  );
};