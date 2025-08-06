/**
 * Terminal UI Integration for AI Interactive Mode
 * Bridges the gap between blessed terminal UI and the CLI commands
 */

import React from 'react';
import { render } from 'react-blessed';
import blessed from 'blessed';
import { TerminalUI } from './terminal-ui.js';
import {
  AIInteractiveLayout,
  ComponentGenerationView,
  AnalyticsDashboard
} from './react-terminal-ui.js';
import { AIService } from '../../ai/services/ai-service.js';
import { EnhancedResourceService } from '../../services/enhanced-resource-service.js';
import chalk from 'chalk';

export interface TerminalUIState {
  view: 'main' | 'generate' | 'analytics' | 'catalog' | 'settings';
  menuStack: string[];
  logs: string[];
  progress: number;
  selectedFramework?: string;
  selectedLibrary?: string;
  generatedCode?: string;
}

export class TerminalUIIntegration {
  private terminalUI: TerminalUI;
  private screen: blessed.Widgets.Screen;
  private state: TerminalUIState;
  private aiService: AIService | null = null;
  private resourceService: EnhancedResourceService;
  private currentElement: any = null;

  constructor() {
    // Create blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Revolutionary UI - AI Interactive Mode',
      fullUnicode: true,
      autoPadding: true,
      warnings: true,
      dockBorders: true
    });

    // Don't create TerminalUI instance as we'll use React components
    this.terminalUI = new TerminalUI();

    this.state = {
      view: 'main',
      menuStack: ['main'],
      logs: [],
      progress: 0
    };

    this.resourceService = new EnhancedResourceService();
    this.setupKeyBindings();
  }

  private setupKeyBindings() {
    this.screen.key(['escape', 'q', 'C-c'], () => {
      if (this.state.menuStack.length > 0) {
        this.navigateBack();
      } else {
        this.destroy();
      }
    });
  }

  async initialize(aiService?: any) {
    this.aiService = aiService || null;
    await this.resourceService.initialize();
    this.addLog('Terminal UI initialized successfully');
    this.addLog(`AI Service: ${this.aiService ? 'Connected' : 'Not configured'}`);
  }

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.state.logs.push(`[${timestamp}] ${message}`);
    if (this.state.logs.length > 100) {
      this.state.logs = this.state.logs.slice(-100);
    }
  }

  private setProgress(percent: number) {
    this.state.progress = Math.min(100, Math.max(0, percent));
  }

  async showMainMenu() {
    this.state.view = 'main';
    const menuItems = [
      '🚀 Generate Component',
      '📊 Browse Catalog', 
      '⚙️  Configure Settings',
      '📈 View Analytics',
      '🔍 Search Components',
      '💾 Manage Projects',
      '🤝 Team Collaboration',
      '☁️  Cloud Sync',
      '📦 Marketplace',
      '❌ Exit'
    ];

    const guidance = this.aiService 
      ? 'AI-powered interactive mode with intelligent recommendations'
      : 'Interactive mode - Configure AI in settings for enhanced features';

    // Clear screen first
    if (this.currentElement) {
      this.currentElement.destroy();
    }

    // Use React component for main menu
    const element = React.createElement(AIInteractiveLayout, {
      title: 'Revolutionary UI v3.4.1',
      guidance,
      menuItems,
      selectedIndex: 0,
      logs: this.state.logs,
      progress: this.state.progress,
      onMenuSelect: (index) => {
        this.handleMainMenuSelect(index);
      },
      onEscape: () => this.destroy()
    });

    this.currentElement = render(element, this.screen);
    this.screen.render();
  }

  private async handleMainMenuSelect(index: number) {
    const actions = [
      () => this.showGenerateComponent(),
      () => this.showCatalogBrowser(),
      () => this.showSettings(),
      () => this.showAnalytics(),
      () => this.showSearch(),
      () => this.showProjectManagement(),
      () => this.showTeamCollaboration(),
      () => this.showCloudSync(),
      () => this.showMarketplace(),
      () => this.destroy()
    ];

    if (actions[index]) {
      await actions[index]();
    }
  }

  async showGenerateComponent() {
    this.state.view = 'generate';
    this.state.menuStack.push('main');
    
    const steps = [
      { name: 'Select Framework', status: 'pending' as const },
      { name: 'Choose UI Library', status: 'pending' as const },
      { name: 'Configure Component', status: 'pending' as const },
      { name: 'Generate with AI', status: 'pending' as const },
      { name: 'Optimize Code', status: 'pending' as const },
      { name: 'Save Component', status: 'pending' as const }
    ];

    const logs: string[] = [];
    let currentStep = 0;

    // Simulate component generation process
    const generateComponent = async () => {
      for (let i = 0; i < steps.length; i++) {
        currentStep = i;
        steps[i].status = 'running';
        logs.push(`[${new Date().toLocaleTimeString()}] ${steps[i].name}...`);
        
        const element = React.createElement(ComponentGenerationView, {
          componentName: 'CustomForm',
          framework: 'React',
          steps,
          currentStep: i,
          logs,
          code: i >= 3 ? this.generateSampleCode() : undefined,
          onBack: () => this.navigateBack()
        });

        render(element, this.screen);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        steps[i].status = 'done';
        logs.push(`[${new Date().toLocaleTimeString()}] ✓ ${steps[i].name} completed`);
      }

      // Show completion message
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.showSuccess('Success', 'Component generated successfully!');
    };

    await generateComponent();
  }

  private generateSampleCode(): string {
    return `import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, TextField, Box } from '@mui/material';

export const CustomForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('name', { required: true })}
        label="Name"
        error={!!errors.name}
        helperText={errors.name ? 'Name is required' : ''}
      />
      <TextField
        {...register('email', { required: true, pattern: /^\\S+@\\S+$/i })}
        label="Email"
        error={!!errors.email}
        helperText={errors.email ? 'Valid email is required' : ''}
      />
      <Button type="submit" variant="contained">
        Submit
      </Button>
    </Box>
  );
};`;
  }

  async showAnalytics() {
    this.state.view = 'analytics';
    this.state.menuStack.push('main');

    const stats = {
      componentsGenerated: 1247,
      codeReduction: 73,
      frameworksUsed: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js'],
      topPatterns: [
        { name: 'Form Factory', count: 342 },
        { name: 'Table Factory', count: 289 },
        { name: 'Dashboard Factory', count: 198 },
        { name: 'Chart Factory', count: 156 },
        { name: 'Auth Factory', count: 134 }
      ]
    };

    const element = React.createElement(AnalyticsDashboard, {
      stats,
      onBack: () => this.navigateBack()
    });

    render(element, this.screen);
  }

  async showCatalogBrowser() {
    this.addLog('Opening component catalog browser...');
    const catalogUI = this.terminalUI.createBox({
      label: 'Component Catalog',
      row: 0,
      col: 0,
      rowSpan: 12,
      colSpan: 12,
      content: 'Loading catalog...'
    });

    // Create category list
    const categoryList = this.terminalUI.createList({
      label: 'Categories',
      row: 1,
      col: 0,
      rowSpan: 10,
      colSpan: 4,
      items: [
        'Forms & Inputs',
        'Tables & Data',
        'Navigation',
        'Layout',
        'Charts & Viz',
        'Modals & Overlays',
        'Media & Content',
        'E-commerce',
        'Dashboard',
        'Authentication'
      ]
    });

    // Create component list
    const componentList = this.terminalUI.createList({
      label: 'Components',
      row: 1,
      col: 4,
      rowSpan: 10,
      colSpan: 4,
      items: []
    });

    // Create preview pane
    const previewPane = this.terminalUI.createBox({
      label: 'Preview',
      row: 1,
      col: 8,
      rowSpan: 10,
      colSpan: 4,
      content: 'Select a component to preview'
    });

    this.terminalUI.render();
  }

  async showSettings() {
    this.addLog('Opening settings...');
    // Implementation would follow similar pattern
    this.terminalUI.showMessage('Settings', 'Settings view coming soon!', 'info');
  }

  async showSearch() {
    this.addLog('Opening semantic search...');
    // Implementation would integrate with vector search
    this.terminalUI.showMessage('Search', 'Semantic search view coming soon!', 'info');
  }

  async showProjectManagement() {
    this.addLog('Opening project management...');
    this.terminalUI.showMessage('Projects', 'Project management view coming soon!', 'info');
  }

  async showTeamCollaboration() {
    this.addLog('Opening team collaboration...');
    this.terminalUI.showMessage('Teams', 'Team collaboration view coming soon!', 'info');
  }

  async showCloudSync() {
    this.addLog('Opening cloud sync...');
    this.terminalUI.showMessage('Cloud', 'Cloud sync view coming soon!', 'info');
  }

  async showMarketplace() {
    this.addLog('Opening marketplace...');
    this.terminalUI.showMessage('Marketplace', 'Marketplace view coming soon!', 'info');
  }

  private navigateBack() {
    if (this.state.menuStack.length > 0) {
      const previousView = this.state.menuStack.pop();
      if (previousView === 'main') {
        this.showMainMenu();
      }
    }
  }

  destroy() {
    if (this.currentElement) {
      this.currentElement.destroy();
    }
    this.screen.destroy();
    process.exit(0);
  }

  // Progress tracking for long operations
  trackProgress(operation: string, current: number, total: number) {
    const percent = (current / total) * 100;
    this.setProgress(percent);
    this.addLog(`${operation}: ${current}/${total} (${Math.round(percent)}%)`);
    this.terminalUI.render();
  }

  // Show loading screen
  showLoading(message: string) {
    const loading = this.terminalUI.showLoading(message);
    return () => {
      loading.stop();
      loading.destroy();
      this.terminalUI.render();
    };
  }

  // Show error message
  showError(title: string, message: string) {
    this.terminalUI.showMessage(title, message, 'error');
  }

  // Show success message
  showSuccess(title: string, message: string) {
    this.terminalUI.showMessage(title, message, 'success');
  }
}