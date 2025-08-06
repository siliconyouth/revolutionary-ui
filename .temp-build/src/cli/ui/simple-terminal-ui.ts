#!/usr/bin/env tsx

/**
 * Simple Terminal UI Implementation
 * Direct blessed implementation without React for now
 */

import blessed from 'blessed';
import { AIService } from '../../ai/services/ai-service.js';
import chalk from 'chalk';

export class SimpleTerminalUI {
  private screen: blessed.Widgets.Screen;
  private mainMenu: blessed.Widgets.List;
  private logBox: blessed.Widgets.Log;
  private statusBar: blessed.Widgets.Box;
  private headerBox: blessed.Widgets.Box;
  private currentView: 'main' | 'generate' | 'analytics' = 'main';
  private aiService: AIService | null = null;

  constructor() {
    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Revolutionary UI - Terminal Mode',
      fullUnicode: true,
      warnings: true
    });

    // Create header
    this.headerBox = blessed.box({
      parent: this.screen,
      label: ' Revolutionary UI v3.4.1 ',
      content: '{center}AI-Powered Component Generation{/center}\n{center}60-95% Code Reduction{/center}',
      tags: true,
      top: 0,
      left: 0,
      width: '100%',
      height: 4,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan'
        },
        label: {
          fg: 'magenta'
        }
      }
    });

    // Create main menu
    this.mainMenu = blessed.list({
      parent: this.screen,
      label: ' Main Menu ',
      items: [
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
      ],
      keys: true,
      mouse: true,
      vi: true,
      top: 4,
      left: 0,
      width: '50%',
      height: '70%',
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan'
        },
        label: {
          fg: 'magenta'
        },
        selected: {
          bg: 'blue',
          fg: 'white'
        }
      },
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '█',
        style: {
          inverse: true
        }
      }
    });

    // Create log box
    this.logBox = blessed.log({
      parent: this.screen,
      label: ' Activity Log ',
      top: 4,
      left: '50%',
      width: '50%',
      height: '70%',
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan'
        },
        label: {
          fg: 'magenta'
        }
      },
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '█',
        style: {
          inverse: true
        }
      },
      tags: true
    });

    // Create status bar
    this.statusBar = blessed.box({
      parent: this.screen,
      content: '{center}ESC: Exit | ↑↓: Navigate | Enter: Select | Tab: Switch Focus{/center}',
      tags: true,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan'
        }
      }
    });

    this.setupEventHandlers();
    this.addLog('Terminal UI initialized');
  }

  private setupEventHandlers() {
    // Global key handlers
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });

    this.screen.key(['tab'], () => {
      this.screen.focusNext();
    });

    // Menu selection handler
    this.mainMenu.on('select', (item, index) => {
      this.handleMenuSelect(index);
    });

    // Focus the menu initially
    this.mainMenu.focus();
  }

  private handleMenuSelect(index: number) {
    const actions = [
      () => this.showGenerateComponent(),
      () => this.showCatalog(),
      () => this.showSettings(),
      () => this.showAnalytics(),
      () => this.showSearch(),
      () => this.showProjects(),
      () => this.showTeams(),
      () => this.showCloud(),
      () => this.showMarketplace(),
      () => process.exit(0)
    ];

    if (actions[index]) {
      actions[index]();
    }
  }

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logBox.log(`{cyan-fg}[${timestamp}]{/cyan-fg} ${message}`);
  }

  private showGenerateComponent() {
    this.addLog('Opening component generator...');
    this.showNotImplemented('Component Generator');
  }

  private showCatalog() {
    this.addLog('Opening component catalog...');
    this.showNotImplemented('Component Catalog');
  }

  private showSettings() {
    this.addLog('Opening settings...');
    this.showNotImplemented('Settings');
  }

  private showAnalytics() {
    this.addLog('Opening analytics dashboard...');
    this.showNotImplemented('Analytics Dashboard');
  }

  private showSearch() {
    this.addLog('Opening semantic search...');
    this.showNotImplemented('Semantic Search');
  }

  private showProjects() {
    this.addLog('Opening project management...');
    this.showNotImplemented('Project Management');
  }

  private showTeams() {
    this.addLog('Opening team collaboration...');
    this.showNotImplemented('Team Collaboration');
  }

  private showCloud() {
    this.addLog('Opening cloud sync...');
    this.showNotImplemented('Cloud Sync');
  }

  private showMarketplace() {
    this.addLog('Opening marketplace...');
    this.showNotImplemented('Marketplace');
  }

  private showNotImplemented(feature: string) {
    const msg = blessed.message({
      parent: this.screen,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ` ${feature} `,
      tags: true,
      keys: true,
      hidden: true,
      vi: true,
      style: {
        border: {
          fg: 'yellow'
        },
        label: {
          fg: 'yellow'
        }
      }
    });

    msg.display(`{center}This feature is coming soon!{/center}\n\n{center}Press any key to continue{/center}`, 0, () => {
      msg.destroy();
      this.screen.render();
    });
  }

  async initialize(aiService?: AIService) {
    this.aiService = aiService || null;
    this.addLog(`AI Service: ${this.aiService ? '{green-fg}Connected{/green-fg}' : '{yellow-fg}Not configured{/yellow-fg}'}`);
  }

  render() {
    this.screen.render();
  }
}

// Test if running directly
if (require.main === module) {
  const ui = new SimpleTerminalUI();
  ui.render();
}