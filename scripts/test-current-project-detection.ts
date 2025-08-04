#!/usr/bin/env node

/**
 * Test Framework Detection on Current Project
 * Tests if the enhanced framework detection works on the Revolutionary UI project itself
 */

import { SmartProjectAnalyzer } from '../src/cli/core/smart-project-analyzer';
import { FRAMEWORK_CONFIGS } from '../src/config/frameworks';
import { UI_LIBRARIES } from '../src/config/ui-libraries';
import { ICON_LIBRARIES } from '../src/config/icon-libraries';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function testCurrentProject() {
  console.log(`${colors.bright}${colors.blue}🔍 Testing Framework Detection on Current Project${colors.reset}\n`);
  
  try {
    // Analyze root project
    const analyzer = new SmartProjectAnalyzer(process.cwd());
    const analysis = await analyzer.analyze();
    
    console.log(`${colors.bright}Project Analysis Results:${colors.reset}`);
    console.log('=' .repeat(50));
    
    console.log(`\n${colors.cyan}Basic Information:${colors.reset}`);
    console.log(`  Project Name: ${analysis.projectName}`);
    console.log(`  Project Type: ${analysis.projectType}`);
    console.log(`  Has TypeScript: ${analysis.hasTypeScript ? '✅ Yes' : '❌ No'}`);
    console.log(`  CSS Framework: ${analysis.cssFramework || 'None detected'}`);
    
    // Show detected frameworks
    console.log(`\n${colors.cyan}Detected Frameworks (${analysis.detectedFrameworks.length}):${colors.reset}`);
    if (analysis.detectedFrameworks.length > 0) {
      analysis.detectedFrameworks.forEach(fw => {
        const config = FRAMEWORK_CONFIGS.find(f => f.name === fw);
        console.log(`  ${colors.green}✅${colors.reset} ${fw}${config ? ` (${config.packageName})` : ''}`);
      });
    } else {
      console.log(`  ${colors.yellow}None detected${colors.reset}`);
    }
    
    // Show detected UI libraries
    console.log(`\n${colors.cyan}Detected UI Libraries (${analysis.detectedUILibraries.length}):${colors.reset}`);
    if (analysis.detectedUILibraries.length > 0) {
      analysis.detectedUILibraries.forEach(lib => {
        const config = UI_LIBRARIES.find(l => l.name === lib);
        console.log(`  ${colors.green}✅${colors.reset} ${lib}${config ? ` (${config.packageName})` : ''}`);
      });
    } else {
      console.log(`  ${colors.yellow}None detected${colors.reset}`);
    }
    
    // Show detected packages that match our configs
    console.log(`\n${colors.cyan}All Detected Packages:${colors.reset}`);
    const frameworkPackages = analysis.detectedPackages.filter(pkg => 
      FRAMEWORK_CONFIGS.some(f => f.packageName === pkg)
    );
    const uiPackages = analysis.detectedPackages.filter(pkg => 
      UI_LIBRARIES.some(l => l.packageName === pkg)
    );
    const iconPackages = analysis.detectedPackages.filter(pkg => 
      ICON_LIBRARIES.some(l => l.packageName === pkg)
    );
    
    if (frameworkPackages.length > 0) {
      console.log(`  ${colors.bright}Frameworks:${colors.reset} ${frameworkPackages.join(', ')}`);
    }
    if (uiPackages.length > 0) {
      console.log(`  ${colors.bright}UI Libraries:${colors.reset} ${uiPackages.join(', ')}`);
    }
    if (iconPackages.length > 0) {
      console.log(`  ${colors.bright}Icon Libraries:${colors.reset} ${iconPackages.join(', ')}`);
    }
    
    // Show sub-projects
    if (analysis.subProjects && analysis.subProjects.length > 0) {
      console.log(`\n${colors.cyan}Sub-Projects Detected (${analysis.subProjects.length}):${colors.reset}`);
      analysis.subProjects.forEach(sub => {
        console.log(`  📁 ${sub.name} (${sub.type})${sub.framework ? ` - ${sub.framework}` : ''}`);
        if (sub.description) {
          console.log(`     ${sub.description}`);
        }
      });
    }
    
    // Show configuration from our files
    console.log(`\n${colors.bright}${colors.blue}📊 Configuration Summary:${colors.reset}`);
    console.log('=' .repeat(50));
    console.log(`Total Frameworks Configured: ${FRAMEWORK_CONFIGS.length}`);
    console.log(`Total UI Libraries Configured: ${UI_LIBRARIES.length}`);
    console.log(`Total Icon Libraries Configured: ${ICON_LIBRARIES.length}`);
    
    // Verify what should be detected
    const expectedFrameworks = ['React', 'Next.js', 'Vue', 'Angular', 'Svelte'];
    const expectedUILibs = ['Ant Design', 'Material-UI (MUI)', 'Chakra UI', 'Tailwind CSS'];
    const expectedIcons = ['Lucide Icons', 'React Icons', 'Tabler Icons', 'Heroicons'];
    
    console.log(`\n${colors.bright}Expected vs Detected:${colors.reset}`);
    
    console.log(`\n${colors.cyan}Frameworks:${colors.reset}`);
    expectedFrameworks.forEach(fw => {
      const detected = analysis.detectedFrameworks.includes(fw);
      console.log(`  ${detected ? colors.green + '✅' : colors.red + '❌'}${colors.reset} ${fw}`);
    });
    
    console.log(`\n${colors.cyan}UI Libraries:${colors.reset}`);
    expectedUILibs.forEach(lib => {
      const detected = analysis.detectedUILibraries.includes(lib);
      console.log(`  ${detected ? colors.green + '✅' : colors.red + '❌'}${colors.reset} ${lib}`);
    });
    
    // Success summary
    const totalExpected = expectedFrameworks.length + expectedUILibs.length;
    const totalDetected = expectedFrameworks.filter(fw => analysis.detectedFrameworks.includes(fw)).length +
                         expectedUILibs.filter(lib => analysis.detectedUILibraries.includes(lib)).length;
    
    console.log(`\n${colors.bright}Detection Success Rate: ${Math.round(totalDetected / totalExpected * 100)}%${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error during analysis:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the test
testCurrentProject();