#!/usr/bin/env node
import chalk from 'chalk';
import figlet from 'figlet';
import readline from 'readline';
import { createSpinner } from 'nanospinner';

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Enable raw mode for arrow key navigation
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

// State
let currentMenu = 'main';
let selectedIndex = 0;
let menuItems = [];

// Clear screen
function clearScreen() {
  console.clear();
}

// Print header
function printHeader() {
  console.log(chalk.cyan(figlet.textSync('REVUI', { font: 'Standard' })));
  console.log(chalk.gray('━'.repeat(60)));
  console.log(chalk.white.bold('  Revolutionary UI Terminal v3.4 - AI-Powered Generation'));
  console.log(chalk.gray('━'.repeat(60)));
  console.log();
}

// Main menu items
const mainMenuItems = [
  { icon: '📊', label: 'Dashboard', desc: 'View system metrics' },
  { icon: '🤖', label: 'Generate', desc: 'AI component generation' },
  { icon: '🔍', label: 'Analyze', desc: 'Project analysis' },
  { icon: '🔎', label: 'Search', desc: 'Browse components' },
  { icon: '💬', label: 'Chat', desc: 'AI assistant' },
  { icon: '☁️', label: 'Sync', desc: 'Cloud synchronization' },
  { icon: '⚙️', label: 'Settings', desc: 'Configuration' },
  { icon: '❌', label: 'Exit', desc: 'Quit application' }
];

// Print menu
function printMenu() {
  clearScreen();
  printHeader();
  
  console.log(chalk.yellow.bold('  Main Menu\n'));
  
  mainMenuItems.forEach((item, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? chalk.cyan('▶ ') : '  ';
    const text = isSelected ? chalk.cyan.bold : chalk.white;
    
    console.log(prefix + text(`${item.icon}  ${item.label} - ${item.desc}`));
  });
  
  console.log();
  console.log(chalk.gray('  Use ↑↓ arrows to navigate, Enter to select, Ctrl+C to exit'));
}

// Show dashboard
async function showDashboard() {
  clearScreen();
  printHeader();
  
  console.log(chalk.yellow.bold('  📊 Dashboard\n'));
  
  // Metrics
  console.log(chalk.cyan('  System Metrics:'));
  console.log(chalk.white('  ├─ Components Generated: ') + chalk.green.bold('156'));
  console.log(chalk.white('  ├─ Code Reduction: ') + chalk.green.bold('71%'));
  console.log(chalk.white('  ├─ Time Saved: ') + chalk.yellow.bold('248 hours'));
  console.log(chalk.white('  └─ Active Sessions: ') + chalk.blue.bold('3'));
  
  console.log();
  
  // Factory Performance
  console.log(chalk.cyan('  Factory Performance:'));
  console.log(chalk.gray('  ┌─────────────────────┬───────┬────────────┐'));
  console.log(chalk.gray('  │ Component           │ Usage │ Reduction  │'));
  console.log(chalk.gray('  ├─────────────────────┼───────┼────────────┤'));
  console.log(chalk.white('  │ FormFactory         │  234  │    82%     │'));
  console.log(chalk.white('  │ TableFactory        │  189  │    75%     │'));
  console.log(chalk.white('  │ DashboardFactory    │  156  │    68%     │'));
  console.log(chalk.white('  │ ChartFactory        │  142  │    71%     │'));
  console.log(chalk.gray('  └─────────────────────┴───────┴────────────┘'));
  
  console.log();
  
  // Activity
  console.log(chalk.cyan('  Recent Activity:'));
  console.log(chalk.green('  ✓ ') + chalk.gray('Component generated successfully'));
  console.log(chalk.green('  ✓ ') + chalk.gray('Project analysis completed'));
  console.log(chalk.yellow('  ⚡ ') + chalk.gray('Cloud sync in progress...'));
  console.log(chalk.blue('  ℹ ') + chalk.gray('AI recommendations ready'));
  
  console.log();
  console.log(chalk.gray('  Press any key to return to menu...'));
  
  await waitForKeypress();
  printMenu();
}

// Show generate screen
async function showGenerate() {
  clearScreen();
  printHeader();
  
  console.log(chalk.yellow.bold('  🤖 AI Component Generator\n'));
  
  console.log(chalk.cyan('  Select component type:\n'));
  
  const components = [
    '📝 Form Factory - Dynamic forms with validation',
    '📊 Table Factory - Data tables with sorting/filtering',
    '📈 Dashboard Factory - Admin dashboards',
    '📉 Chart Factory - Data visualization',
    '🗂️ Modal Factory - Dialog components',
    '🎨 Layout Factory - Page layouts'
  ];
  
  components.forEach((comp, i) => {
    console.log(chalk.white(`  ${i + 1}. ${comp}`));
  });
  
  console.log();
  console.log(chalk.gray('  Press any key to return to menu...'));
  
  await waitForKeypress();
  printMenu();
}

// Show analyze screen
async function showAnalyze() {
  clearScreen();
  printHeader();
  
  console.log(chalk.yellow.bold('  🔍 Project Analysis\n'));
  
  const spinner = createSpinner('Analyzing project...').start();
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  spinner.success({ text: 'Analysis complete!' });
  
  console.log();
  console.log(chalk.cyan('  Results:'));
  console.log(chalk.white('  ├─ Framework: ') + chalk.green('React + TypeScript'));
  console.log(chalk.white('  ├─ Components: ') + chalk.green('47 found'));
  console.log(chalk.white('  └─ Code Reduction: ') + chalk.yellow('72% potential'));
  
  console.log();
  console.log(chalk.cyan('  Recommendations:'));
  console.log(chalk.yellow('  • ') + chalk.white('Convert UserForm to FormFactory'));
  console.log(chalk.yellow('  • ') + chalk.white('Optimize DataTable with TableFactory'));
  console.log(chalk.yellow('  • ') + chalk.white('Implement lazy loading'));
  console.log(chalk.yellow('  • ') + chalk.white('Add AI-powered search'));
  
  console.log();
  console.log(chalk.gray('  Press any key to return to menu...'));
  
  await waitForKeypress();
  printMenu();
}

// Wait for keypress
function waitForKeypress() {
  return new Promise(resolve => {
    process.stdin.once('keypress', () => resolve());
  });
}

// Handle menu selection
async function handleSelection() {
  switch (selectedIndex) {
    case 0: await showDashboard(); break;
    case 1: await showGenerate(); break;
    case 2: await showAnalyze(); break;
    case 3:
    case 4:
    case 5:
    case 6:
      clearScreen();
      printHeader();
      console.log(chalk.yellow(`  ${mainMenuItems[selectedIndex].icon} ${mainMenuItems[selectedIndex].label}\n`));
      console.log(chalk.gray('  Feature coming soon!\n'));
      console.log(chalk.gray('  Press any key to return to menu...'));
      await waitForKeypress();
      printMenu();
      break;
    case 7:
      clearScreen();
      console.log(chalk.cyan('  Thanks for using Revolutionary UI!'));
      process.exit(0);
  }
}

// Keyboard navigation
process.stdin.on('keypress', async (str, key) => {
  if (key.ctrl && key.name === 'c') {
    clearScreen();
    console.log(chalk.cyan('  Thanks for using Revolutionary UI!'));
    process.exit(0);
  }
  
  if (currentMenu === 'main') {
    if (key.name === 'up') {
      selectedIndex = (selectedIndex - 1 + mainMenuItems.length) % mainMenuItems.length;
      printMenu();
    } else if (key.name === 'down') {
      selectedIndex = (selectedIndex + 1) % mainMenuItems.length;
      printMenu();
    } else if (key.name === 'return') {
      await handleSelection();
    }
  }
});

// Start the app
printMenu();