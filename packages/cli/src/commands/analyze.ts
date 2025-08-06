import { BaseCommand, type CLIContext, createLogger, withSpinner, workspaceDetector, pMap } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { glob } from 'glob';

interface AnalysisResult {
  projectType: string;
  framework: string;
  componentCount: number;
  lineCount: number;
  fileCount: number;
  potentialFactories: Array<{
    type: string;
    count: number;
    examples: string[];
  }>;
  codeReduction: {
    current: number;
    potential: number;
    percentage: number;
  };
  recommendations: string[];
}

export class AnalyzeCommand extends BaseCommand {
  name = 'analyze [path]';
  description = 'Analyze your project and identify optimization opportunities';
  alias = ['analyse'];
  
  options = [
    { flags: '-d, --deep', description: 'Perform deep analysis including dependencies' },
    { flags: '-o, --output <format>', description: 'Output format (json, markdown)', defaultValue: 'console' },
    { flags: '--no-cache', description: 'Skip cache and perform fresh analysis' },
  ];

  async action(path: string = '.', options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n🔍 Revolutionary UI Project Analysis\n'));
    
    const result = await withSpinner('Analyzing project...', async () => {
      return this.analyzeProject(path, options);
    });
    
    // Display results based on output format
    switch (options.output) {
      case 'json':
        console.log(JSON.stringify(result, null, 2));
        break;
        
      case 'markdown':
        this.outputMarkdown(result);
        break;
        
      default:
        this.displayResults(result);
    }
  }

  private async analyzeProject(projectPath: string, options: any): Promise<AnalysisResult> {
    // Detect workspace
    const workspace = await workspaceDetector.detect(projectPath);
    
    // Analyze project structure
    const projectType = await this.detectProjectType(projectPath);
    const framework = await this.detectFramework(projectPath);
    
    // Find all component files
    const componentFiles = await this.findComponentFiles(projectPath, framework);
    
    // Analyze components in parallel
    const analyses = await pMap(
      componentFiles,
      async (file) => this.analyzeFile(file),
      5 // Analyze 5 files in parallel
    );
    
    // Aggregate results
    const lineCount = analyses.reduce((sum, a) => sum + a.lines, 0);
    const potentialFactories = this.identifyFactoryOpportunities(analyses);
    const codeReduction = this.calculateCodeReduction(analyses, potentialFactories);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      framework,
      potentialFactories,
      codeReduction,
      workspace
    );
    
    return {
      projectType,
      framework,
      componentCount: componentFiles.length,
      lineCount,
      fileCount: componentFiles.length,
      potentialFactories,
      codeReduction,
      recommendations,
    };
  }

  private async detectProjectType(path: string): Promise<string> {
    const packageJsonPath = join(path, 'package.json');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      // Check for common project types
      if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
        return 'Next.js';
      }
      if (packageJson.dependencies?.['react-scripts']) {
        return 'Create React App';
      }
      if (packageJson.dependencies?.vite || packageJson.devDependencies?.vite) {
        return 'Vite';
      }
      if (packageJson.dependencies?.['@angular/core']) {
        return 'Angular';
      }
      if (packageJson.dependencies?.vue) {
        return 'Vue';
      }
      if (packageJson.dependencies?.svelte || packageJson.devDependencies?.svelte) {
        return 'Svelte';
      }
      
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private async detectFramework(path: string): Promise<string> {
    const packageJsonPath = join(path, 'package.json');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.react) return 'React';
      if (deps.vue) return 'Vue';
      if (deps['@angular/core']) return 'Angular';
      if (deps.svelte) return 'Svelte';
      if (deps['solid-js']) return 'Solid';
      if (deps.qwik) return 'Qwik';
      
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private async findComponentFiles(path: string, framework: string): Promise<string[]> {
    const patterns = this.getComponentPatterns(framework);
    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: path,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
      });
      files.push(...matches.map(f => join(path, f)));
    }
    
    return files;
  }

  private getComponentPatterns(framework: string): string[] {
    const patterns: Record<string, string[]> = {
      React: [
        'src/**/*.tsx',
        'src/**/*.jsx',
        'components/**/*.tsx',
        'components/**/*.jsx',
        'app/**/*.tsx',
        'app/**/*.jsx',
      ],
      Vue: [
        'src/**/*.vue',
        'components/**/*.vue',
      ],
      Angular: [
        'src/**/*.component.ts',
      ],
      Svelte: [
        'src/**/*.svelte',
      ],
      default: [
        'src/**/*.{tsx,jsx,vue,svelte}',
        'components/**/*.{tsx,jsx,vue,svelte}',
      ],
    };
    
    return patterns[framework] || patterns.default;
  }

  private async analyzeFile(filePath: string): Promise<any> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').length;
    
    // Detect patterns
    const hasForm = /form|input|select|textarea/i.test(content);
    const hasTable = /table|grid|datagrid|row|column/i.test(content);
    const hasChart = /chart|graph|plot|svg|canvas/i.test(content);
    const hasDashboard = /dashboard|panel|widget|layout/i.test(content);
    const hasModal = /modal|dialog|popup|overlay/i.test(content);
    const hasAuth = /login|signup|auth|password|email/i.test(content);
    
    // Count specific patterns
    const stateCount = (content.match(/useState|setState|state\s*=/g) || []).length;
    const effectCount = (content.match(/useEffect|mounted|watch/g) || []).length;
    const propCount = (content.match(/props\.|props\[/g) || []).length;
    
    return {
      path: filePath,
      lines,
      patterns: {
        form: hasForm,
        table: hasTable,
        chart: hasChart,
        dashboard: hasDashboard,
        modal: hasModal,
        auth: hasAuth,
      },
      complexity: {
        stateCount,
        effectCount,
        propCount,
      },
    };
  }

  private identifyFactoryOpportunities(analyses: any[]): any[] {
    const opportunities = [];
    const patternCounts: Record<string, { count: number; files: string[] }> = {};
    
    // Count pattern occurrences
    for (const analysis of analyses) {
      for (const [pattern, hasPattern] of Object.entries(analysis.patterns)) {
        if (hasPattern) {
          if (!patternCounts[pattern]) {
            patternCounts[pattern] = { count: 0, files: [] };
          }
          patternCounts[pattern].count++;
          patternCounts[pattern].files.push(analysis.path);
        }
      }
    }
    
    // Create opportunities for patterns with multiple occurrences
    for (const [pattern, data] of Object.entries(patternCounts)) {
      if (data.count >= 2) {
        opportunities.push({
          type: `${pattern}Factory`,
          count: data.count,
          examples: data.files.slice(0, 3).map(f => f.split('/').pop()),
        });
      }
    }
    
    return opportunities.sort((a, b) => b.count - a.count);
  }

  private calculateCodeReduction(analyses: any[], factories: any[]): any {
    const currentLines = analyses.reduce((sum, a) => sum + a.lines, 0);
    
    // Estimate reduction based on factory patterns
    let reducedLines = 0;
    for (const factory of factories) {
      // Estimate 60-80% reduction per factory type
      const avgReduction = 0.7;
      const avgLinesPerComponent = currentLines / analyses.length;
      reducedLines += factory.count * avgLinesPerComponent * avgReduction;
    }
    
    const potentialLines = Math.max(currentLines - reducedLines, currentLines * 0.3);
    const percentage = Math.round(((currentLines - potentialLines) / currentLines) * 100);
    
    return {
      current: currentLines,
      potential: Math.round(potentialLines),
      percentage,
    };
  }

  private generateRecommendations(
    framework: string,
    factories: any[],
    codeReduction: any,
    workspace: any
  ): string[] {
    const recommendations = [];
    
    // Factory recommendations
    if (factories.length > 0) {
      recommendations.push(
        `🏭 Implement ${factories.length} factory patterns for ${codeReduction.percentage}% code reduction`
      );
      
      // Top 3 factories
      factories.slice(0, 3).forEach(factory => {
        recommendations.push(
          `   • Create ${factory.type} for ${factory.count} components`
        );
      });
    }
    
    // Framework-specific recommendations
    if (framework === 'React' && codeReduction.percentage > 50) {
      recommendations.push('🎯 Consider using Revolutionary UI\'s React factories');
    }
    
    // Workspace recommendations
    if (workspace.type !== 'single') {
      recommendations.push('📦 Leverage monorepo structure for shared component libraries');
    }
    
    // General recommendations
    if (codeReduction.current > 10000) {
      recommendations.push('🔄 Start with high-impact components for gradual migration');
    }
    
    recommendations.push('🤖 Use AI-powered generation for new components');
    recommendations.push('☁️ Enable cloud sync for team collaboration');
    
    return recommendations;
  }

  private displayResults(result: AnalysisResult): void {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n📊 Analysis Results\n'));
    
    // Project info
    logger.info(`${chalk.gray('Project Type:')} ${result.projectType}`);
    logger.info(`${chalk.gray('Framework:')} ${result.framework}`);
    logger.info(`${chalk.gray('Components:')} ${result.componentCount}`);
    logger.info(`${chalk.gray('Total Lines:')} ${result.lineCount.toLocaleString()}`);
    
    // Code reduction potential
    logger.info(chalk.bold('\n💡 Code Reduction Potential\n'));
    logger.info(`Current: ${chalk.red(result.codeReduction.current.toLocaleString())} lines`);
    logger.info(`Potential: ${chalk.green(result.codeReduction.potential.toLocaleString())} lines`);
    logger.info(`Reduction: ${chalk.yellow(result.codeReduction.percentage + '%')}`);
    
    // Factory opportunities
    if (result.potentialFactories.length > 0) {
      logger.info(chalk.bold('\n🏭 Factory Opportunities\n'));
      result.potentialFactories.forEach(factory => {
        logger.info(`• ${chalk.cyan(factory.type)}: ${factory.count} components`);
        logger.info(`  Examples: ${factory.examples.join(', ')}`);
      });
    }
    
    // Recommendations
    logger.info(chalk.bold('\n✅ Recommendations\n'));
    result.recommendations.forEach(rec => {
      logger.info(rec);
    });
    
    // Call to action
    logger.info(chalk.bold('\n🚀 Next Steps\n'));
    logger.info('1. Run "rui generate --factory form" to create your first factory');
    logger.info('2. Use "rui add" to install pre-built components');
    logger.info('3. Try "rui ai" for AI-powered component generation');
  }

  private outputMarkdown(result: AnalysisResult): void {
    const markdown = `# Revolutionary UI Analysis Report

## Project Overview
- **Type**: ${result.projectType}
- **Framework**: ${result.framework}
- **Components**: ${result.componentCount}
- **Total Lines**: ${result.lineCount.toLocaleString()}

## Code Reduction Potential
- **Current**: ${result.codeReduction.current.toLocaleString()} lines
- **Potential**: ${result.codeReduction.potential.toLocaleString()} lines
- **Reduction**: ${result.codeReduction.percentage}%

## Factory Opportunities
${result.potentialFactories.map(f => 
  `- **${f.type}**: ${f.count} components\n  - Examples: ${f.examples.join(', ')}`
).join('\n')}

## Recommendations
${result.recommendations.map(r => `- ${r}`).join('\n')}
`;
    
    console.log(markdown);
  }
}