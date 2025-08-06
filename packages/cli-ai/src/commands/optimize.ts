import { BaseCommand, type CLIContext, createLogger, input, select, confirm, withSpinner } from '@revolutionary-ui/cli-core';
import { AIOptimizationService } from '../services/ai-optimization-service.js';
import { getProvider } from '../providers/index.js';
import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import Table from 'cli-table3';

export class OptimizeCommand extends BaseCommand {
  name = 'optimize <file>';
  description = 'AI-powered component optimization for performance and size';
  alias = ['opt'];
  
  options = [
    { flags: '-t, --target <size>', description: 'Target optimization: minimal, balanced, readable', defaultValue: 'balanced' },
    { flags: '-o, --output <path>', description: 'Output path for optimized file' },
    { flags: '--analyze-only', description: 'Only analyze optimization opportunities' },
    { flags: '--variants', description: 'Generate multiple optimization variants' },
    { flags: '-p, --provider <name>', description: 'AI provider to use' },
    { flags: '--preserve-comments', description: 'Preserve code comments' },
    { flags: '--no-memoization', description: 'Skip memoization optimizations' },
  ];

  async action(file: string, options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n⚡ AI Component Optimizer\n'));

    try {
      // Read the file
      const code = await readFile(file, 'utf-8');
      logger.info(`Analyzing ${chalk.cyan(basename(file))}...`);

      // Initialize AI provider and optimization service
      const provider = await getProvider(context.config, options.provider);
      const optimizer = new AIOptimizationService(provider);

      // Analyze only mode
      if (options.analyzeOnly) {
        await this.analyzeComponent(code, optimizer);
        return;
      }

      // Generate variants mode
      if (options.variants) {
        await this.generateVariants(code, file, optimizer);
        return;
      }

      // Optimize component
      const result = await withSpinner(
        'Optimizing component...',
        async () => {
          return optimizer.optimizeComponent(code, {
            targetSize: options.target,
            preserveComments: options.preserveComments,
            optimizeImports: true,
            enableMemoization: options.memoization !== false,
            framework: await this.detectFramework(code),
          });
        }
      );

      // Show results
      this.showOptimizationResults(result);

      // Show improvements
      if (result.improvements.length > 0) {
        logger.info(chalk.bold('\n✨ Improvements Made:\n'));
        result.improvements.forEach(imp => {
          const icon = imp.impact === 'high' ? '🔥' : imp.impact === 'medium' ? '⚡' : '💡';
          logger.info(`  ${icon} ${chalk.cyan(imp.type)}: ${imp.description}`);
        });
      }

      // Show suggestions
      if (result.suggestions.length > 0) {
        logger.info(chalk.bold('\n💡 Additional Suggestions:\n'));
        result.suggestions.forEach(suggestion => {
          logger.info(`  • ${suggestion}`);
        });
      }

      // Preview changes
      if (code !== result.optimized) {
        const shouldPreview = await confirm('\nWould you like to preview the changes?', true);
        if (shouldPreview) {
          await this.showDiff(code, result.optimized);
        }

        // Save optimized file
        const outputPath = options.output || file.replace(/\.(tsx?|jsx?)$/, '.optimized.$1');
        const shouldSave = await confirm(`\nSave optimized file to ${chalk.cyan(outputPath)}?`, true);
        
        if (shouldSave) {
          await writeFile(outputPath, result.optimized);
          logger.success(`\nOptimized file saved to ${outputPath}`);
          
          // Offer to replace original
          if (!options.output) {
            const shouldReplace = await confirm('\nReplace original file with optimized version?', false);
            if (shouldReplace) {
              // Backup original
              const backupPath = file + '.backup';
              await writeFile(backupPath, code);
              await writeFile(file, result.optimized);
              logger.success(`Original backed up to ${backupPath}`);
              logger.success(`File optimized in place`);
            }
          }
        }
      } else {
        logger.info(chalk.yellow('\nNo optimizations needed - component is already optimized! 🎉'));
      }

    } catch (error: any) {
      logger.error('Optimization failed:', error.message);
    }
  }

  private async analyzeComponent(code: string, optimizer: AIOptimizationService): Promise<void> {
    const logger = createLogger();
    
    const analysis = await withSpinner(
      'Analyzing optimization opportunities...',
      async () => {
        return optimizer.analyzeOptimizationOpportunities(code);
      }
    );

    logger.info(chalk.bold('\n📊 Optimization Analysis\n'));

    // Show opportunities table
    if (analysis.opportunities.length > 0) {
      const table = new Table({
        head: ['Type', 'Description', 'Impact', 'Effort'],
        colWidths: [20, 50, 10, 10],
        style: {
          head: ['cyan'],
        },
      });

      analysis.opportunities.forEach(opp => {
        const impactColor = opp.potentialImpact === 'high' ? chalk.red :
                           opp.potentialImpact === 'medium' ? chalk.yellow :
                           chalk.green;
        const effortColor = opp.effort === 'high' ? chalk.red :
                           opp.effort === 'medium' ? chalk.yellow :
                           chalk.green;
        
        table.push([
          opp.type,
          opp.description,
          impactColor(opp.potentialImpact),
          effortColor(opp.effort),
        ]);
      });

      console.log(table.toString());
    }

    logger.info(`\nEstimated code reduction: ${chalk.green(`${analysis.estimatedReduction}%`)}`);

    if (analysis.recommendations.length > 0) {
      logger.info(chalk.bold('\n📋 Recommendations:\n'));
      analysis.recommendations.forEach(rec => {
        logger.info(`  • ${rec}`);
      });
    }
  }

  private async generateVariants(code: string, file: string, optimizer: AIOptimizationService): Promise<void> {
    const logger = createLogger();
    
    const variants = await withSpinner(
      'Generating optimization variants...',
      async () => {
        return optimizer.generateOptimizedVariants(code, ['performance', 'size', 'accessibility']);
      }
    );

    logger.info(chalk.bold('\n🎯 Optimization Variants Generated\n'));

    const dir = dirname(file);
    const base = basename(file, '.tsx').replace('.ts', '').replace('.jsx', '').replace('.js', '');
    const ext = file.match(/\.(tsx?|jsx?)$/)?.[1] || 'js';

    for (const [variant, optimizedCode] of Object.entries(variants)) {
      const variantFile = join(dir, `${base}.${variant}.${ext}`);
      
      // Calculate size reduction
      const reduction = Math.round(((code.length - optimizedCode.length) / code.length) * 100);
      
      logger.info(`${chalk.cyan(variant)} variant:`);
      logger.info(`  Size reduction: ${reduction > 0 ? chalk.green(`-${reduction}%`) : chalk.yellow('0%')}`);
      logger.info(`  Output: ${variantFile}`);
      
      const shouldSave = await confirm(`Save ${variant} variant?`, true);
      if (shouldSave) {
        await writeFile(variantFile, optimizedCode);
      }
    }
  }

  private showOptimizationResults(result: any): void {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n📈 Optimization Results:\n'));
    
    const table = new Table({
      head: ['Metric', 'Before', 'After', 'Change'],
      style: {
        head: ['cyan'],
      },
    });

    // Size metrics
    const sizeChange = result.metrics.reductionPercentage;
    table.push([
      'File Size',
      `${result.metrics.originalSize} bytes`,
      `${result.metrics.optimizedSize} bytes`,
      sizeChange > 0 ? chalk.green(`-${sizeChange}%`) : chalk.yellow('0%'),
    ]);

    // Complexity metrics
    if (result.metrics.complexityBefore && result.metrics.complexityAfter) {
      const complexityChange = Math.round(
        ((result.metrics.complexityBefore - result.metrics.complexityAfter) / 
         result.metrics.complexityBefore) * 100
      );
      table.push([
        'Complexity',
        result.metrics.complexityBefore.toString(),
        result.metrics.complexityAfter.toString(),
        complexityChange > 0 ? chalk.green(`-${complexityChange}%`) : chalk.yellow('0%'),
      ]);
    }

    console.log(table.toString());
  }

  private async showDiff(original: string, optimized: string): Promise<void> {
    const logger = createLogger();
    
    // Simple line-by-line diff
    const originalLines = original.split('\n');
    const optimizedLines = optimized.split('\n');
    
    logger.info(chalk.bold('\n📝 Preview Changes:\n'));
    
    const maxLines = Math.max(originalLines.length, optimizedLines.length);
    let changesShown = 0;
    const maxChanges = 20;
    
    for (let i = 0; i < maxLines && changesShown < maxChanges; i++) {
      const origLine = originalLines[i] || '';
      const optLine = optimizedLines[i] || '';
      
      if (origLine !== optLine) {
        if (origLine && !optLine) {
          logger.info(chalk.red(`- ${origLine}`));
          changesShown++;
        } else if (!origLine && optLine) {
          logger.info(chalk.green(`+ ${optLine}`));
          changesShown++;
        } else {
          logger.info(chalk.red(`- ${origLine}`));
          logger.info(chalk.green(`+ ${optLine}`));
          changesShown += 2;
        }
      }
    }
    
    if (changesShown >= maxChanges) {
      logger.info(chalk.gray('\n... (more changes not shown)'));
    }
  }

  private async detectFramework(code: string): Promise<string> {
    if (code.includes('import React') || code.includes('from "react"') || code.includes("from 'react'")) {
      return 'react';
    }
    if (code.includes('import Vue') || code.includes('from "vue"') || code.includes("from 'vue'")) {
      return 'vue';
    }
    if (code.includes('@angular') || code.includes('from "@angular')) {
      return 'angular';
    }
    if (code.includes('import { writable }') || code.includes('from "svelte')) {
      return 'svelte';
    }
    return 'javascript';
  }
}