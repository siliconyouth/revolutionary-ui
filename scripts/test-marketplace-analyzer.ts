#!/usr/bin/env node

/**
 * Test Database Analyzer on Marketplace Project
 */

import { SmartProjectAnalyzer } from '../src/cli/core/smart-project-analyzer';
import chalk from 'chalk';
import path from 'path';

async function testMarketplaceAnalyzer() {
  console.log(chalk.blue.bold('\n🔍 Testing Database Analyzer on Marketplace Project\n'));
  
  try {
    const marketplacePath = path.join(process.cwd(), 'marketplace-nextjs');
    console.log(chalk.cyan(`Analyzing: ${marketplacePath}`));
    
    const analyzer = new SmartProjectAnalyzer(marketplacePath);
    const analysis = await analyzer.analyze();
    
    console.log(chalk.bold('\n📋 Marketplace Analysis Results:'));
    console.log('='.repeat(50));
    
    console.log(chalk.cyan('\nBasic Information:'));
    console.log(`  Project Name: ${analysis.projectName}`);
    console.log(`  Project Type: ${analysis.projectType}`);
    console.log(`  Has TypeScript: ${analysis.hasTypeScript ? '✅ Yes' : '❌ No'}`);
    console.log(`  CSS Framework: ${analysis.cssFramework || 'None detected'}`);
    
    // Show detected frameworks
    console.log(chalk.cyan(`\nDetected Frameworks (${analysis.detectedFrameworks.length}):`));
    if (analysis.detectedFrameworks.length > 0) {
      analysis.detectedFrameworks.forEach(fw => {
        console.log(`  ${chalk.green('✅')} ${fw}`);
      });
    }
    
    // Show detected UI libraries
    console.log(chalk.cyan(`\nDetected UI Libraries (${analysis.detectedUILibraries.length}):`));
    if (analysis.detectedUILibraries.length > 0) {
      analysis.detectedUILibraries.forEach(lib => {
        console.log(`  ${chalk.green('✅')} ${lib}`);
      });
    }
    
    // Show detected icon libraries
    console.log(chalk.cyan(`\nDetected Icon Libraries (${analysis.detectedIconLibraries.length}):`));
    if (analysis.detectedIconLibraries.length > 0) {
      analysis.detectedIconLibraries.forEach(lib => {
        console.log(`  ${chalk.green('✅')} ${lib}`);
      });
    }
    
    // Show features
    console.log(chalk.cyan('\nKey Features Detected:'));
    const keyFeatures = ['hasTypeScript', 'hasDatabase', 'hasAuth', 'hasPayments', 'hasSSR'];
    keyFeatures.forEach(feature => {
      if (analysis.features[feature]) {
        console.log(`  ${chalk.green('✅')} ${feature.replace('has', '')}`);
      }
    });
    
    console.log(chalk.green.bold('\n✨ Database-based analyzer working correctly!'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error during test:'), error);
    process.exit(1);
  }
}

testMarketplaceAnalyzer();