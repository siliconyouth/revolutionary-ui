#!/usr/bin/env node

/**
 * Test Database-Based Project Analyzer
 * Verifies that the new database-backed analyzer works correctly
 */

import { SmartProjectAnalyzer } from '../src/cli/core/smart-project-analyzer';
import { DatabaseResourceService } from '../src/services/database-resource-service';
import chalk from 'chalk';

async function testDatabaseAnalyzer() {
  console.log(chalk.blue.bold('\n🔍 Testing Database-Based Project Analyzer\n'));
  
  try {
    // First, check database connectivity
    console.log(chalk.cyan('📊 Checking database connection...'));
    const dbService = DatabaseResourceService.getInstance();
    
    // Test fetching frameworks from database
    const frameworks = await dbService.getFrameworks();
    console.log(chalk.green(`✅ Connected to database. Found ${frameworks.length} frameworks`));
    
    // Test fetching UI libraries
    const uiLibraries = await dbService.getUILibraries();
    console.log(chalk.green(`✅ Found ${uiLibraries.length} UI libraries in database`));
    
    // Test fetching icon libraries
    const iconLibraries = await dbService.getIconLibraries();
    console.log(chalk.green(`✅ Found ${iconLibraries.length} icon libraries in database`));
    
    // Now run the analyzer
    console.log(chalk.cyan('\n🔍 Running project analysis with database...'));
    const analyzer = new SmartProjectAnalyzer(process.cwd());
    const analysis = await analyzer.analyze();
    
    console.log(chalk.bold('\n📋 Analysis Results:'));
    console.log('='.repeat(50));
    
    console.log(chalk.cyan('\nBasic Information:'));
    console.log(`  Project Name: ${analysis.projectName}`);
    console.log(`  Project Type: ${analysis.projectType}`);
    console.log(`  Has TypeScript: ${analysis.hasTypeScript ? '✅ Yes' : '❌ No'}`);
    console.log(`  CSS Framework: ${analysis.cssFramework || 'None detected'}`);
    console.log(`  Package Manager: ${analysis.packageManager}`);
    
    // Show detected frameworks
    console.log(chalk.cyan(`\nDetected Frameworks (${analysis.detectedFrameworks.length}):`));
    if (analysis.detectedFrameworks.length > 0) {
      analysis.detectedFrameworks.forEach(fw => {
        console.log(`  ${chalk.green('✅')} ${fw}`);
      });
    } else {
      console.log(chalk.yellow('  None detected'));
    }
    
    // Show detected UI libraries
    console.log(chalk.cyan(`\nDetected UI Libraries (${analysis.detectedUILibraries.length}):`));
    if (analysis.detectedUILibraries.length > 0) {
      analysis.detectedUILibraries.forEach(lib => {
        console.log(`  ${chalk.green('✅')} ${lib}`);
      });
    } else {
      console.log(chalk.yellow('  None detected'));
    }
    
    // Show detected icon libraries
    console.log(chalk.cyan(`\nDetected Icon Libraries (${analysis.detectedIconLibraries.length}):`));
    if (analysis.detectedIconLibraries.length > 0) {
      analysis.detectedIconLibraries.forEach(lib => {
        console.log(`  ${chalk.green('✅')} ${lib}`);
      });
    } else {
      console.log(chalk.yellow('  None detected'));
    }
    
    // Show project structure
    console.log(chalk.cyan('\nProject Structure:'));
    console.log(`  Source Folder: ${analysis.structure.hasSourceFolder ? '✅ Yes' : '❌ No'}`);
    console.log(`  Components Path: ${analysis.structure.componentsPath || 'Not found'}`);
    console.log(`  Pages Path: ${analysis.structure.pagesPath || 'Not found'}`);
    console.log(`  API Path: ${analysis.structure.apiPath || 'Not found'}`);
    console.log(`  Styles Path: ${analysis.structure.stylesPath || 'Not found'}`);
    console.log(`  Public Path: ${analysis.structure.publicPath || 'Not found'}`);
    console.log(`  Tests Path: ${analysis.structure.testsPath || 'Not found'}`);
    
    // Show features
    console.log(chalk.cyan('\nDetected Features:'));
    const features = Object.entries(analysis.features)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key.replace(/^has/, ''));
    
    if (features.length > 0) {
      features.forEach(feature => {
        console.log(`  ${chalk.green('✅')} ${feature}`);
      });
    } else {
      console.log(chalk.yellow('  No features detected'));
    }
    
    // Show sub-projects if monorepo
    if (analysis.subProjects && analysis.subProjects.length > 0) {
      console.log(chalk.cyan(`\nSub-Projects (${analysis.subProjects.length}):`));
      analysis.subProjects.forEach(sub => {
        console.log(`  📁 ${sub.name} (${sub.type})${sub.framework ? ` - ${sub.framework}` : ''}`);
        if (sub.description) {
          console.log(`     ${sub.description}`);
        }
      });
    }
    
    // Show recommendations
    if (analysis.recommendations.length > 0) {
      console.log(chalk.cyan(`\nRecommendations (${analysis.recommendations.length}):`));
      analysis.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    // Test specific package detection
    console.log(chalk.cyan('\n🔬 Testing Package Detection:'));
    
    // Get some sample packages from dependencies
    const samplePackages = Object.keys(analysis.dependencies.all).slice(0, 5);
    console.log(`\nChecking ${samplePackages.length} sample packages:`);
    
    for (const pkg of samplePackages) {
      const frameworkMap = await dbService.getFrameworksByPackages([pkg]);
      const uiMap = await dbService.getUILibrariesByPackages([pkg]);
      
      if (frameworkMap.has(pkg)) {
        const fw = frameworkMap.get(pkg);
        console.log(`  ${chalk.green('✅')} ${pkg} → Framework: ${fw?.name}`);
      } else if (uiMap.has(pkg)) {
        const ui = uiMap.get(pkg);
        console.log(`  ${chalk.green('✅')} ${pkg} → UI Library: ${ui?.name}`);
      } else {
        console.log(`  ${chalk.gray('○')} ${pkg} → Not in database`);
      }
    }
    
    console.log(chalk.green.bold('\n✨ Database-based analyzer test completed successfully!'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error during test:'), error);
    process.exit(1);
  }
}

// Run the test
testDatabaseAnalyzer();