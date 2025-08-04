#!/usr/bin/env node

/**
 * Direct Framework Detection Test
 * Tests framework detection without the interactive CLI
 */

import * as fs from 'fs';
import * as path from 'path';
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

function detectFrameworks(deps: Record<string, string>, devDeps: Record<string, string>): string[] {
  const allDeps = { ...deps, ...devDeps };
  const frameworks: string[] = [];
  
  // Check each framework from our comprehensive list
  for (const framework of FRAMEWORK_CONFIGS) {
    if (framework.packageName && framework.packageName !== 'none') {
      if (allDeps[framework.packageName]) {
        frameworks.push(framework.name);
      }
    }
  }
  
  return frameworks;
}

function detectUILibraries(deps: Record<string, string>, devDeps: Record<string, string>): string[] {
  const allDeps = { ...deps, ...devDeps };
  const libraries: string[] = [];
  
  for (const lib of UI_LIBRARIES) {
    if (allDeps[lib.packageName]) {
      libraries.push(lib.name);
    }
  }
  
  return libraries;
}

function detectIconLibraries(deps: Record<string, string>, devDeps: Record<string, string>): string[] {
  const allDeps = { ...deps, ...devDeps };
  const libraries: string[] = [];
  
  for (const lib of ICON_LIBRARIES) {
    if (allDeps[lib.packageName]) {
      libraries.push(lib.name);
    }
  }
  
  return libraries;
}

async function testDetection() {
  console.log(`${colors.bright}${colors.blue}🔍 Direct Framework Detection Test${colors.reset}\n`);
  
  // Read root package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('No package.json found!');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  
  console.log(`${colors.cyan}Project:${colors.reset} ${packageJson.name}`);
  console.log(`${colors.cyan}Version:${colors.reset} ${packageJson.version}`);
  console.log(`${colors.cyan}Description:${colors.reset} ${packageJson.description}`);
  
  // Detect frameworks
  const detectedFrameworks = detectFrameworks(deps, devDeps);
  console.log(`\n${colors.bright}Detected Frameworks (${detectedFrameworks.length}):${colors.reset}`);
  if (detectedFrameworks.length > 0) {
    detectedFrameworks.forEach(fw => {
      const config = FRAMEWORK_CONFIGS.find(f => f.name === fw);
      console.log(`  ${colors.green}✅${colors.reset} ${fw} (${config?.packageName})`);
    });
  } else {
    console.log(`  ${colors.yellow}None detected${colors.reset}`);
  }
  
  // Detect UI libraries
  const detectedUILibs = detectUILibraries(deps, devDeps);
  console.log(`\n${colors.bright}Detected UI Libraries (${detectedUILibs.length}):${colors.reset}`);
  if (detectedUILibs.length > 0) {
    detectedUILibs.forEach(lib => {
      const config = UI_LIBRARIES.find(l => l.name === lib);
      console.log(`  ${colors.green}✅${colors.reset} ${lib} (${config?.packageName})`);
    });
  } else {
    console.log(`  ${colors.yellow}None detected${colors.reset}`);
  }
  
  // Detect icon libraries
  const detectedIcons = detectIconLibraries(deps, devDeps);
  console.log(`\n${colors.bright}Detected Icon Libraries (${detectedIcons.length}):${colors.reset}`);
  if (detectedIcons.length > 0) {
    detectedIcons.forEach(lib => {
      const config = ICON_LIBRARIES.find(l => l.name === lib);
      console.log(`  ${colors.green}✅${colors.reset} ${lib} (${config?.packageName})`);
    });
  } else {
    console.log(`  ${colors.yellow}None detected${colors.reset}`);
  }
  
  // Show all packages that match our configs
  console.log(`\n${colors.bright}All Matching Packages:${colors.reset}`);
  const allDeps = { ...deps, ...devDeps };
  const allPackages = Object.keys(allDeps);
  
  const frameworkPackages = allPackages.filter(pkg => 
    FRAMEWORK_CONFIGS.some(f => f.packageName === pkg)
  );
  const uiPackages = allPackages.filter(pkg => 
    UI_LIBRARIES.some(l => l.packageName === pkg)
  );
  const iconPackages = allPackages.filter(pkg => 
    ICON_LIBRARIES.some(l => l.packageName === pkg)
  );
  
  if (frameworkPackages.length > 0) {
    console.log(`  ${colors.cyan}Framework packages:${colors.reset} ${frameworkPackages.join(', ')}`);
  }
  if (uiPackages.length > 0) {
    console.log(`  ${colors.cyan}UI library packages:${colors.reset} ${uiPackages.join(', ')}`);
  }
  if (iconPackages.length > 0) {
    console.log(`  ${colors.cyan}Icon library packages:${colors.reset} ${iconPackages.join(', ')}`);
  }
  
  // Test sub-projects
  console.log(`\n${colors.bright}${colors.blue}Testing Sub-Projects:${colors.reset}`);
  
  const subProjects = [
    { name: 'marketplace-nextjs', path: 'marketplace-nextjs' },
    { name: 'vscode-extension', path: 'vscode-extension' }
  ];
  
  for (const subProject of subProjects) {
    const subPackageJsonPath = path.join(process.cwd(), subProject.path, 'package.json');
    if (fs.existsSync(subPackageJsonPath)) {
      console.log(`\n${colors.cyan}📁 ${subProject.name}:${colors.reset}`);
      
      const subPackageJson = JSON.parse(fs.readFileSync(subPackageJsonPath, 'utf-8'));
      const subDeps = subPackageJson.dependencies || {};
      const subDevDeps = subPackageJson.devDependencies || {};
      
      const subFrameworks = detectFrameworks(subDeps, subDevDeps);
      const subUILibs = detectUILibraries(subDeps, subDevDeps);
      const subIcons = detectIconLibraries(subDeps, subDevDeps);
      
      if (subFrameworks.length > 0) {
        console.log(`  Frameworks: ${subFrameworks.join(', ')}`);
      }
      if (subUILibs.length > 0) {
        console.log(`  UI Libraries: ${subUILibs.join(', ')}`);
      }
      if (subIcons.length > 0) {
        console.log(`  Icon Libraries: ${subIcons.join(', ')}`);
      }
      
      if (subFrameworks.length === 0 && subUILibs.length === 0 && subIcons.length === 0) {
        console.log(`  ${colors.yellow}No matching packages detected${colors.reset}`);
      }
    }
  }
  
  // Summary
  console.log(`\n${colors.bright}${colors.blue}📊 Configuration Summary:${colors.reset}`);
  console.log('=' .repeat(50));
  console.log(`Total Frameworks Configured: ${FRAMEWORK_CONFIGS.length}`);
  console.log(`Total UI Libraries Configured: ${UI_LIBRARIES.length}`);
  console.log(`Total Icon Libraries Configured: ${ICON_LIBRARIES.length}`);
  
  const totalDetected = detectedFrameworks.length + detectedUILibs.length + detectedIcons.length;
  console.log(`\n${colors.bright}Total Detected in Root Project: ${totalDetected}${colors.reset}`);
  console.log(`  - Frameworks: ${detectedFrameworks.length}`);
  console.log(`  - UI Libraries: ${detectedUILibs.length}`);
  console.log(`  - Icon Libraries: ${detectedIcons.length}`);
}

// Run the test
testDetection();