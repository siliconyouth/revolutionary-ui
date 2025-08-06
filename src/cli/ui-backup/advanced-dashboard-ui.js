#!/usr/bin/env node

/**
 * Advanced Dashboard Terminal UI for Revolutionary UI
 * Using react-blessed-contrib for rich widgets
 */

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const React = require('react');
const { render } = require('react-blessed');

// Mock data generator
function generateMockData() {
  return {
    // Line chart data - Performance over time
    performanceData: {
      title: 'Performance Metrics',
      style: { line: 'yellow' },
      x: Array.from({length: 60}, (_, i) => i.toString()),
      y: Array.from({length: 60}, () => Math.floor(Math.random() * 100))
    },
    
    // Multi-line chart - Framework comparison
    frameworkComparison: [
      {
        title: 'React',
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        y: [65, 70, 75, 80, 85, 88],
        style: { line: 'cyan' }
      },
      {
        title: 'Vue',
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        y: [55, 58, 62, 65, 68, 72],
        style: { line: 'green' }
      },
      {
        title: 'Angular',
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        y: [45, 48, 50, 52, 54, 58],
        style: { line: 'red' }
      }
    ],
    
    // Map data - Global usage
    mapData: {
      'USA': { percent: 0.8 },
      'China': { percent: 0.6 },
      'Germany': { percent: 0.7 },
      'Japan': { percent: 0.5 },
      'UK': { percent: 0.65 },
      'France': { percent: 0.55 },
      'India': { percent: 0.4 },
      'Brazil': { percent: 0.35 }
    },
    
    // Donut data - Component types
    donutData: [
      { percent: 35, label: 'Forms', color: 'cyan' },
      { percent: 25, label: 'Tables', color: 'green' },
      { percent: 20, label: 'Charts', color: 'yellow' },
      { percent: 15, label: 'Layouts', color: 'red' },
      { percent: 5, label: 'Other', color: 'magenta' }
    ],
    
    // LCD data - Key metrics
    lcdMetrics: {
      components: 1247,
      users: 8943,
      efficiency: 87.5,
      uptime: 99.9
    }
  };
}

// Advanced Dashboard Component
class AdvancedDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: generateMockData(),
      selectedWidget: 0,
      logs: [],
      transactionLog: []
    };
    
    this.updateInterval = null;
    this.grid = null;
  }

  componentDidMount() {
    const { screen } = this.props;
    this.setupKeyHandlers(screen);
    this.startRealtimeUpdates();
    this.log('Advanced Dashboard initialized');
    this.log('Press TAB to cycle widgets, ? for help');
  }

  componentWillUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  setupKeyHandlers(screen) {
    screen.key(['tab'], () => {
      this.setState(prev => ({
        selectedWidget: (prev.selectedWidget + 1) % 10
      }));
      this.log(`Selected widget: ${this.getWidgetName(this.state.selectedWidget)}`);
    });

    screen.key(['?', 'h'], () => {
      this.showHelp();
    });

    screen.key(['r'], () => {
      this.setState({ data: generateMockData() });
      this.log('Data refreshed');
    });

    screen.key(['q', 'C-c'], () => {
      this.log('Shutting down...');
      setTimeout(() => process.exit(0), 500);
    });

    // Number keys for direct widget selection
    for (let i = 1; i <= 9; i++) {
      screen.key([i.toString()], () => {
        this.setState({ selectedWidget: i - 1 });
        this.log(`Selected: ${this.getWidgetName(i - 1)}`);
      });
    }
  }

  getWidgetName(index) {
    const widgets = [
      'Performance Chart', 'Framework Comparison', 'World Map',
      'Component Types', 'Metrics Display', 'Activity Monitor',
      'Transaction Log', 'Sparklines', 'Progress Bars', 'System Status'
    ];
    return widgets[index] || 'Unknown';
  }

  showHelp() {
    this.log('=== Dashboard Controls ===');
    this.log('TAB - Cycle through widgets');
    this.log('1-9 - Select widget directly');
    this.log('r - Refresh data');
    this.log('? - Show this help');
    this.log('q - Quit');
  }

  startRealtimeUpdates() {
    this.updateInterval = setInterval(() => {
      const { data } = this.state;
      
      // Update performance data
      const newY = [...data.performanceData.y.slice(1), Math.floor(Math.random() * 100)];
      
      // Update sparkline data
      const newSparkline = Array.from({length: 20}, () => Math.floor(Math.random() * 10));
      
      // Add transaction
      const transactions = ['CREATE', 'UPDATE', 'DELETE', 'QUERY'];
      const transaction = {
        time: new Date().toLocaleTimeString(),
        action: transactions[Math.floor(Math.random() * transactions.length)],
        component: `Component_${Math.floor(Math.random() * 1000)}`,
        status: Math.random() > 0.1 ? 'SUCCESS' : 'FAILED'
      };
      
      const newTransactionLog = [...this.state.transactionLog, transaction].slice(-10);
      
      this.setState({
        data: {
          ...data,
          performanceData: {
            ...data.performanceData,
            y: newY
          },
          sparklineData: newSparkline
        },
        transactionLog: newTransactionLog
      });
    }, 1000);
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.setState(prev => ({
      logs: [...prev.logs, `[${timestamp}] ${message}`].slice(-20)
    }));
  }

  createGrid() {
    if (!this.grid) {
      this.grid = new contrib.grid({ rows: 12, cols: 12, screen: this.props.screen });
    }
    return this.grid;
  }

  render() {
    const grid = this.createGrid();
    const { data } = this.state;

    return React.createElement(React.Fragment, null, [
      // Line Chart - Performance (Top Left)
      React.createElement(contrib.line, {
        key: 'performance',
        grid: grid,
        row: 0,
        col: 0,
        rowSpan: 4,
        colSpan: 6,
        style: {
          line: 'yellow',
          text: 'green',
          baseline: 'black'
        },
        label: ' Performance Monitor ',
        showLegend: false,
        data: data.performanceData
      }),

      // Multi-Line Chart - Framework Comparison (Top Right)
      React.createElement(contrib.line, {
        key: 'frameworks',
        grid: grid,
        row: 0,
        col: 6,
        rowSpan: 4,
        colSpan: 6,
        style: {
          text: 'white',
          baseline: 'black'
        },
        label: ' Framework Efficiency Comparison ',
        showLegend: true,
        legend: { width: 10 },
        data: data.frameworkComparison
      }),

      // World Map (Middle Left)
      React.createElement(contrib.map, {
        key: 'map',
        grid: grid,
        row: 4,
        col: 0,
        rowSpan: 4,
        colSpan: 6,
        label: ' Global Usage Heatmap ',
        startLon: -180,
        endLon: 180,
        startLat: -90,
        endLat: 90,
        markers: Object.entries(data.mapData).map(([country, info]) => ({
          lon: Math.random() * 360 - 180,
          lat: Math.random() * 180 - 90,
          color: info.percent > 0.6 ? 'red' : info.percent > 0.4 ? 'yellow' : 'green',
          char: 'X'
        }))
      }),

      // Donut Chart (Middle Right)
      React.createElement(contrib.donut, {
        key: 'donut',
        grid: grid,
        row: 4,
        col: 6,
        rowSpan: 4,
        colSpan: 3,
        label: ' Component Types ',
        radius: 8,
        arcWidth: 3,
        yPadding: 2,
        data: data.donutData
      }),

      // LCD Display (Middle Right)
      React.createElement(contrib.lcd, {
        key: 'lcd',
        grid: grid,
        row: 4,
        col: 9,
        rowSpan: 2,
        colSpan: 3,
        label: ' Metrics ',
        elements: 4,
        display: data.lcdMetrics.components,
        elementPadding: 4,
        color: 'green'
      }),

      // Gauge - Efficiency (Middle Right Bottom)
      React.createElement(contrib.gauge, {
        key: 'gauge',
        grid: grid,
        row: 6,
        col: 9,
        rowSpan: 2,
        colSpan: 3,
        label: ' Efficiency ',
        percent: data.lcdMetrics.efficiency / 100,
        stroke: 'cyan',
        fill: 'white'
      }),

      // Transaction Log Table (Bottom Left)
      React.createElement(contrib.table, {
        key: 'transactions',
        grid: grid,
        row: 8,
        col: 0,
        rowSpan: 4,
        colSpan: 6,
        label: ' Transaction Log ',
        columnWidth: [10, 8, 15, 8],
        columnSpacing: 2,
        keys: true,
        vi: true,
        style: {
          header: { fg: 'blue', bold: true },
          cell: { fg: 'white' }
        },
        data: {
          headers: ['Time', 'Action', 'Component', 'Status'],
          data: this.state.transactionLog.map(t => [
            t.time, t.action, t.component, t.status
          ])
        }
      }),

      // Activity Log (Bottom Right)
      React.createElement(contrib.log, {
        key: 'log',
        grid: grid,
        row: 8,
        col: 6,
        rowSpan: 4,
        colSpan: 6,
        label: ' System Log ',
        tags: true,
        style: {
          fg: 'green'
        },
        content: this.state.logs.join('\n')
      })
    ]);
  }
}

// Main function
function main() {
  try {
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Revolutionary UI - Advanced Dashboard',
      fullUnicode: true,
      warnings: false
    });

    // Set up a nice gradient background
    screen.fillRegion(0, 0, screen.width, screen.height, ' ');
    
    render(React.createElement(AdvancedDashboard, { screen }), screen);
    
  } catch (error) {
    console.error('Failed to start Advanced Dashboard:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AdvancedDashboard, main };