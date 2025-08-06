/**
 * Terminal UI Demo
 * Showcases the rich terminal interface capabilities
 */

import { TerminalUI } from '../src/cli/ui/terminal-ui';
import chalk from 'chalk';

async function runDemo() {
  console.log(chalk.cyan.bold('\n🎨 Revolutionary UI - Terminal Interface Demo\n'));
  console.log(chalk.gray('This demo showcases various terminal UI widgets...\n'));

  const ui = new TerminalUI();

  // Create main layout
  const header = ui.createBox({
    label: 'Revolutionary UI v3.4',
    row: 0,
    col: 0,
    rowSpan: 2,
    colSpan: 12,
    content: '{center}Welcome to Revolutionary UI Terminal Interface{/center}\n{center}60-95% Code Reduction Through Intelligent Factories{/center}'
  });

  // Component catalog
  const catalog = ui.createList({
    label: 'Component Catalog',
    row: 2,
    col: 0,
    rowSpan: 5,
    colSpan: 4,
    items: [
      '📝 Form Factory',
      '📊 Table Factory',
      '📈 Dashboard Factory',
      '📉 Chart Factory',
      '🎮 Game UI Factory',
      '🔐 Auth Factory',
      '🛍️ E-commerce Factory',
      '📱 Mobile Factory'
    ]
  });

  // Activity log
  const activityLog = ui.createLog({
    label: 'Activity Log',
    row: 2,
    col: 4,
    rowSpan: 5,
    colSpan: 4
  });

  // Stats table
  const statsTable = ui.createTable({
    label: 'Framework Statistics',
    row: 2,
    col: 8,
    rowSpan: 5,
    colSpan: 4,
    headers: ['Framework', 'Components', 'Usage'],
    data: [
      ['React', '3,245', '45%'],
      ['Vue', '2,134', '28%'],
      ['Angular', '1,567', '17%'],
      ['Svelte', '892', '10%']
    ]
  });

  // Progress bars
  const progressBar1 = ui.createProgressBar({
    label: 'Code Reduction',
    row: 7,
    col: 0,
    rowSpan: 1,
    colSpan: 6
  });

  const progressBar2 = ui.createProgressBar({
    label: 'AI Generation',
    row: 7,
    col: 6,
    rowSpan: 1,
    colSpan: 6
  });

  // Chart
  const chart = ui.createLineChart({
    label: 'Component Generation Trends',
    row: 8,
    col: 0,
    rowSpan: 3,
    colSpan: 12
  });

  // Status bar
  const statusBar = ui.createBox({
    label: 'Status',
    row: 11,
    col: 0,
    rowSpan: 1,
    colSpan: 12,
    content: '{center}Press Q to quit | Tab to navigate | Enter to select{/center}'
  });

  // Render initial UI
  ui.render();

  // Simulate activity
  let logIndex = 0;
  const activities = [
    'Initializing AI engine...',
    'Loading component catalog...',
    'Analyzing project structure...',
    'Detecting frameworks...',
    'Preparing factories...',
    'Ready for component generation!'
  ];

  const activityInterval = setInterval(() => {
    if (logIndex < activities.length) {
      // For log widgets, we need to use the log method
      const logWidget = ui.getWidget('Activity Log');
      if (logWidget && logWidget.log) {
        logWidget.log(activities[logIndex]);
      }
      logIndex++;
    } else {
      clearInterval(activityInterval);
    }
  }, 1000);

  // Animate progress bars
  let progress1 = 0;
  let progress2 = 0;
  
  const progressInterval = setInterval(() => {
    if (progress1 < 73) {
      progress1 += Math.random() * 10;
      ui.updateWidget('Code Reduction', Math.min(73, progress1));
    }
    
    if (progress2 < 95) {
      progress2 += Math.random() * 8;
      ui.updateWidget('AI Generation', Math.min(95, progress2));
    }
    
    if (progress1 >= 73 && progress2 >= 95) {
      clearInterval(progressInterval);
    }
  }, 500);

  // Update chart data
  const chartData = {
    title: 'Components Generated',
    x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    y: [120, 156, 203, 178, 245],
    style: {
      line: 'cyan',
      text: 'white',
      baseline: 'gray'
    }
  };
  
  setTimeout(() => {
    const chartWidget = ui.getWidget('Component Generation Trends');
    if (chartWidget && chartWidget.setData) {
      chartWidget.setData([chartData]);
      ui.render();
    }
  }, 2000);

  // Handle list selection
  catalog.on('select', (item: any, index: number) => {
    ui.showMessage(
      'Component Selected',
      `You selected: ${catalog.items[index]}`,
      'info'
    );
  });

  // Focus on the catalog
  ui.focus('Component Catalog');

  // Show loading example
  setTimeout(() => {
    const loading = ui.showLoading('Generating component with AI...');
    setTimeout(() => {
      loading.stop();
      ui.showMessage('Success', 'Component generated successfully!', 'success');
    }, 3000);
  }, 5000);
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };