import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import Table from 'cli-table3';
import { ComponentLibraryAPI } from '../api/ComponentLibraryAPI';
import { ComponentCategory, ComponentType, ComponentMetadata } from '../models/Component';

export class ComponentLibraryCLI {
  private api: ComponentLibraryAPI;
  
  constructor() {
    this.api = new ComponentLibraryAPI();
  }
  
  async run(): Promise<void> {
    console.log(chalk.cyan.bold('\n📚 Component Library Manager\n'));
    
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '🔍 Search components', value: 'search' },
            { name: '📂 Browse by category', value: 'browse' },
            { name: '🏷️ Filter by tags', value: 'tags' },
            { name: '🚀 View popular components', value: 'popular' },
            { name: '✨ View recent components', value: 'recent' },
            { name: '⭐ View featured components', value: 'featured' },
            { name: '📊 View library statistics', value: 'stats' },
            { name: '🔎 View component details', value: 'details' },
            { name: '📤 Export component', value: 'export' },
            { name: '📥 Import component', value: 'import' },
            { name: '🗑️ Delete component', value: 'delete' },
            { name: '❌ Exit', value: 'exit' }
          ]
        }
      ]);
      
      if (action === 'exit') break;
      
      try {
        await this.handleAction(action);
      } catch (error) {
        console.error(chalk.red('Error:'), error);
      }
      
      console.log('\n');
    }
  }
  
  private async handleAction(action: string): Promise<void> {
    switch (action) {
      case 'search':
        await this.searchComponents();
        break;
      case 'browse':
        await this.browseByCategory();
        break;
      case 'tags':
        await this.filterByTags();
        break;
      case 'popular':
        await this.viewPopularComponents();
        break;
      case 'recent':
        await this.viewRecentComponents();
        break;
      case 'featured':
        await this.viewFeaturedComponents();
        break;
      case 'stats':
        await this.viewStatistics();
        break;
      case 'details':
        await this.viewComponentDetails();
        break;
      case 'export':
        await this.exportComponent();
        break;
      case 'import':
        await this.importComponent();
        break;
      case 'delete':
        await this.deleteComponent();
        break;
    }
  }
  
  private async searchComponents(): Promise<void> {
    const { query, framework, minQuality } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: 'Search query:'
      },
      {
        type: 'list',
        name: 'framework',
        message: 'Framework filter (optional):',
        choices: [
          { name: 'All', value: null },
          { name: 'React', value: 'react' },
          { name: 'Vue', value: 'vue' },
          { name: 'Angular', value: 'angular' },
          { name: 'Vanilla JS', value: 'vanilla' }
        ]
      },
      {
        type: 'number',
        name: 'minQuality',
        message: 'Minimum quality score (0-100):',
        default: 0
      }
    ]);
    
    const spinner = ora('Searching components...').start();
    
    const results = await this.api.search({
      query: query || undefined,
      frameworks: framework ? [framework] : undefined,
      minQuality: minQuality || undefined,
      sortBy: 'quality'
    });
    
    spinner.stop();
    
    if (results.length === 0) {
      console.log(chalk.yellow('No components found.'));
      return;
    }
    
    this.displayComponentList(results);
  }
  
  private async browseByCategory(): Promise<void> {
    const categories = Object.values(ComponentCategory);
    
    const { category } = await inquirer.prompt([
      {
        type: 'list',
        name: 'category',
        message: 'Select category:',
        choices: categories.map(cat => ({
          name: this.formatCategoryName(cat),
          value: cat
        }))
      }
    ]);
    
    const components = await this.api.findByCategory(category);
    
    if (components.length === 0) {
      console.log(chalk.yellow(`No components found in ${category} category.`));
      return;
    }
    
    console.log(chalk.cyan(`\n📁 ${this.formatCategoryName(category)} Components:\n`));
    this.displayComponentList(components);
  }
  
  private async filterByTags(): Promise<void> {
    // Get all unique tags
    const allComponents = await this.api.search({});
    const allTags = new Set<string>();
    allComponents.forEach(comp => comp.tags.forEach(tag => allTags.add(tag)));
    
    const { tags } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'tags',
        message: 'Select tags:',
        choices: Array.from(allTags).sort()
      }
    ]);
    
    if (tags.length === 0) return;
    
    const components = await this.api.findByTags(tags);
    
    if (components.length === 0) {
      console.log(chalk.yellow('No components found with selected tags.'));
      return;
    }
    
    console.log(chalk.cyan(`\n🏷️ Components with tags: ${tags.join(', ')}\n`));
    this.displayComponentList(components);
  }
  
  private async viewPopularComponents(): Promise<void> {
    const spinner = ora('Loading popular components...').start();
    const components = await this.api.getPopularComponents(10);
    spinner.stop();
    
    console.log(chalk.cyan('\n🚀 Popular Components:\n'));
    this.displayComponentList(components, true);
  }
  
  private async viewRecentComponents(): Promise<void> {
    const spinner = ora('Loading recent components...').start();
    const components = await this.api.getRecentComponents(10);
    spinner.stop();
    
    console.log(chalk.cyan('\n✨ Recent Components:\n'));
    this.displayComponentList(components);
  }
  
  private async viewFeaturedComponents(): Promise<void> {
    const spinner = ora('Loading featured components...').start();
    const components = await this.api.getFeaturedComponents();
    spinner.stop();
    
    if (components.length === 0) {
      console.log(chalk.yellow('No featured components yet.'));
      return;
    }
    
    console.log(chalk.cyan('\n⭐ Featured Components:\n'));
    this.displayComponentList(components);
  }
  
  private async viewStatistics(): Promise<void> {
    const spinner = ora('Loading statistics...').start();
    const stats = await this.api.getStats();
    spinner.stop();
    
    console.log(chalk.cyan('\n📊 Component Library Statistics:\n'));
    
    const table = new Table({
      head: ['Metric', 'Value'],
      style: { head: ['cyan'] }
    });
    
    table.push(
      ['Total Components', stats.totalComponents.toString()],
      ['Average Quality', `${stats.averageQuality}/100`],
      ['Last Updated', stats.lastUpdated.toLocaleString()]
    );
    
    console.log(table.toString());
    
    // Category breakdown
    console.log(chalk.cyan('\n📂 By Category:\n'));
    const categoryTable = new Table({
      head: ['Category', 'Count'],
      style: { head: ['cyan'] }
    });
    
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      categoryTable.push([this.formatCategoryName(category), count.toString()]);
    });
    
    console.log(categoryTable.toString());
    
    // Framework breakdown
    console.log(chalk.cyan('\n🛠️ By Framework:\n'));
    const frameworkTable = new Table({
      head: ['Framework', 'Count'],
      style: { head: ['cyan'] }
    });
    
    Object.entries(stats.byFramework).forEach(([framework, count]) => {
      frameworkTable.push([framework, count.toString()]);
    });
    
    console.log(frameworkTable.toString());
  }
  
  private async viewComponentDetails(): Promise<void> {
    const { query } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: 'Enter component name or ID:'
      }
    ]);
    
    // Try to find by ID first, then by name
    let component = await this.api.findById(query);
    
    if (!component) {
      const results = await this.api.search({ query });
      if (results.length > 0) {
        component = results[0];
      }
    }
    
    if (!component) {
      console.log(chalk.yellow('Component not found.'));
      return;
    }
    
    this.displayComponentDetails(component);
    
    // Ask for actions
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📤 Export this component', value: 'export' },
          { name: '🔍 Find similar components', value: 'similar' },
          { name: '📊 Track usage', value: 'track' },
          { name: '⬅️ Back', value: 'back' }
        ]
      }
    ]);
    
    switch (action) {
      case 'export':
        await this.exportSpecificComponent(component.id);
        break;
      case 'similar':
        await this.findSimilarComponents(component.id);
        break;
      case 'track':
        await this.api.trackUsage(component.id);
        console.log(chalk.green('✓ Usage tracked'));
        break;
    }
  }
  
  private async exportComponent(): Promise<void> {
    const { query } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: 'Enter component name or ID to export:'
      }
    ]);
    
    await this.exportSpecificComponent(query);
  }
  
  private async exportSpecificComponent(idOrQuery: string): Promise<void> {
    const spinner = ora('Exporting component...').start();
    
    try {
      // Try by ID first
      let component = await this.api.findById(idOrQuery);
      
      if (!component) {
        const results = await this.api.search({ query: idOrQuery });
        if (results.length > 0) {
          component = results[0];
        }
      }
      
      if (!component) {
        spinner.fail('Component not found');
        return;
      }
      
      const exported = await this.api.exportComponent(component.id);
      
      // Save to file
      const filename = `${component.name}-export.json`;
      const fs = await import('fs/promises');
      await fs.writeFile(filename, JSON.stringify(exported, null, 2));
      
      spinner.succeed(`Component exported to ${filename}`);
    } catch (error) {
      spinner.fail('Export failed');
      throw error;
    }
  }
  
  private async importComponent(): Promise<void> {
    const { filepath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filepath',
        message: 'Enter path to component export file:'
      }
    ]);
    
    const spinner = ora('Importing component...').start();
    
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(filepath, 'utf-8');
      const componentPackage = JSON.parse(data);
      
      const imported = await this.api.importComponent(componentPackage);
      
      spinner.succeed(`Component imported: ${imported.displayName}`);
      this.displayComponentDetails(imported);
    } catch (error) {
      spinner.fail('Import failed');
      throw error;
    }
  }
  
  private async deleteComponent(): Promise<void> {
    const { query, confirm } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: 'Enter component name or ID to delete:'
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this component?',
        default: false
      }
    ]);
    
    if (!confirm) return;
    
    const spinner = ora('Deleting component...').start();
    
    try {
      // Try by ID first
      let deleted = await this.api.deleteComponent(query);
      
      if (!deleted) {
        const results = await this.api.search({ query });
        if (results.length > 0) {
          deleted = await this.api.deleteComponent(results[0].id);
        }
      }
      
      if (deleted) {
        spinner.succeed('Component deleted');
      } else {
        spinner.fail('Component not found');
      }
    } catch (error) {
      spinner.fail('Delete failed');
      throw error;
    }
  }
  
  private async findSimilarComponents(componentId: string): Promise<void> {
    const spinner = ora('Finding similar components...').start();
    const similar = await this.api.findSimilar(componentId);
    spinner.stop();
    
    if (similar.length === 0) {
      console.log(chalk.yellow('No similar components found.'));
      return;
    }
    
    console.log(chalk.cyan('\n🔗 Similar Components:\n'));
    this.displayComponentList(similar);
  }
  
  private displayComponentList(components: ComponentMetadata[], showUsage = false): void {
    const table = new Table({
      head: ['Name', 'Category', 'Type', 'Framework', 'Quality', ...(showUsage ? ['Usage'] : []), 'Tags'],
      style: { head: ['cyan'] },
      wordWrap: true,
      colWidths: [20, 15, 15, 10, 8, ...(showUsage ? [8] : []), 30]
    });
    
    components.forEach(comp => {
      table.push([
        comp.displayName,
        this.formatCategoryName(comp.category),
        this.formatTypeName(comp.type),
        comp.frameworks[0]?.name || 'N/A',
        `${comp.quality.score}/100`,
        ...(showUsage ? [comp.usageCount.toString()] : []),
        comp.tags.slice(0, 3).join(', ') + (comp.tags.length > 3 ? '...' : '')
      ]);
    });
    
    console.log(table.toString());
  }
  
  private displayComponentDetails(component: ComponentMetadata): void {
    console.log(chalk.cyan(`\n📋 Component Details:\n`));
    
    console.log(chalk.bold('Basic Information:'));
    console.log(`  Name: ${component.displayName}`);
    console.log(`  ID: ${component.id}`);
    console.log(`  Category: ${this.formatCategoryName(component.category)}`);
    console.log(`  Type: ${this.formatTypeName(component.type)}`);
    console.log(`  Version: ${component.version}`);
    console.log(`  Created: ${component.createdAt.toLocaleString()}`);
    console.log(`  Usage Count: ${component.usageCount}`);
    
    console.log(chalk.bold('\nDescription:'));
    console.log(`  ${component.description}`);
    
    console.log(chalk.bold('\nSource:'));
    console.log(`  Type: ${component.source.type}`);
    if (component.source.url) {
      console.log(`  URL: ${component.source.url}`);
    }
    
    console.log(chalk.bold('\nFramework Support:'));
    component.frameworks.forEach(fw => {
      console.log(`  - ${fw.name} ${fw.verified ? '✅' : ''}`);
    });
    
    console.log(chalk.bold('\nQuality Metrics:'));
    console.log(`  Overall: ${component.quality.score}/100`);
    console.log(`  Code Quality: ${component.quality.codeQuality}/100`);
    console.log(`  Documentation: ${component.quality.documentation}/100`);
    console.log(`  Testing: ${component.quality.testing}/100`);
    console.log(`  Accessibility: ${component.quality.accessibility}/100`);
    console.log(`  Performance: ${component.quality.performance}/100`);
    
    console.log(chalk.bold('\nTags:'));
    console.log(`  ${component.tags.join(', ')}`);
    
    if (component.useCases.length > 0) {
      console.log(chalk.bold('\nUse Cases:'));
      component.useCases.forEach(useCase => {
        console.log(`  - ${useCase}`);
      });
    }
  }
  
  private formatCategoryName(category: string): string {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  private formatTypeName(type: string): string {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new ComponentLibraryCLI();
  cli.run().catch(console.error);
}