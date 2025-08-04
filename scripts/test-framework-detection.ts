#!/usr/bin/env node

/**
 * Test Framework Detection Script
 * Tests the enhanced framework detection with all 50+ frameworks
 */

import { SmartProjectAnalyzer } from '../src/cli/core/smart-project-analyzer';
import { FRAMEWORK_CONFIGS } from '../src/config/frameworks';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

interface TestResult {
  framework: string;
  detected: boolean;
  packageJson: any;
}

async function createTestProject(framework: string, dependencies: Record<string, string>): Promise<string> {
  // Create a temporary directory for the test
  const tempDir = path.join(os.tmpdir(), `rui-test-${framework}-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Create a package.json with the framework
  const packageJson = {
    name: `test-${framework}`,
    version: '1.0.0',
    dependencies: dependencies
  };
  
  fs.writeFileSync(
    path.join(tempDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  return tempDir;
}

async function testFrameworkDetection(framework: any): Promise<TestResult> {
  console.log(`\n${colors.cyan}Testing ${framework.name}...${colors.reset}`);
  
  // Skip if no package name
  if (!framework.packageName || framework.packageName === 'none') {
    console.log(`  ${colors.yellow}⚠️  Skipping (no package)${colors.reset}`);
    return { framework: framework.name, detected: false, packageJson: null };
  }
  
  // Create test dependencies
  const dependencies: Record<string, string> = {};
  dependencies[framework.packageName] = 'latest';
  
  // Add additional packages for meta-frameworks
  if (framework.name === 'Next.js') {
    dependencies['react'] = 'latest';
    dependencies['react-dom'] = 'latest';
  } else if (framework.name === 'Nuxt') {
    dependencies['vue'] = 'latest';
  } else if (framework.name === 'SvelteKit') {
    dependencies['svelte'] = 'latest';
  } else if (framework.name === 'Remix') {
    dependencies['react'] = 'latest';
    dependencies['react-dom'] = 'latest';
  }
  
  // Create test project
  const testDir = await createTestProject(framework.id, dependencies);
  
  try {
    // Test detection
    const analyzer = new SmartProjectAnalyzer(testDir);
    const analysis = await analyzer.analyze();
    
    // Check if framework was detected
    const detected = analysis.detectedFrameworks.includes(framework.name);
    
    if (detected) {
      console.log(`  ${colors.green}✅ Detected successfully${colors.reset}`);
      console.log(`  ${colors.bright}Frameworks found:${colors.reset} ${analysis.detectedFrameworks.join(', ')}`);
    } else {
      console.log(`  ${colors.red}❌ Not detected${colors.reset}`);
      console.log(`  ${colors.bright}Expected:${colors.reset} ${framework.name}`);
      console.log(`  ${colors.bright}Found:${colors.reset} ${analysis.detectedFrameworks.join(', ') || 'none'}`);
    }
    
    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
    
    return { 
      framework: framework.name, 
      detected,
      packageJson: dependencies
    };
  } catch (error) {
    console.log(`  ${colors.red}❌ Error: ${error}${colors.reset}`);
    
    // Cleanup on error
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {}
    
    return { 
      framework: framework.name, 
      detected: false,
      packageJson: dependencies
    };
  }
}

async function runTests() {
  console.log(`${colors.bright}${colors.blue}🧪 Testing Framework Detection${colors.reset}`);
  console.log(`${colors.bright}Testing ${FRAMEWORK_CONFIGS.length} frameworks...${colors.reset}`);
  
  const results: TestResult[] = [];
  
  // Test each framework
  for (const framework of FRAMEWORK_CONFIGS) {
    const result = await testFrameworkDetection(framework);
    results.push(result);
  }
  
  // Summary
  console.log(`\n${colors.bright}${colors.blue}📊 Test Summary${colors.reset}`);
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.detected);
  const failed = results.filter(r => !r.detected && r.packageJson);
  const skipped = results.filter(r => !r.detected && !r.packageJson);
  
  console.log(`${colors.green}✅ Successful:${colors.reset} ${successful.length}/${FRAMEWORK_CONFIGS.length}`);
  console.log(`${colors.red}❌ Failed:${colors.reset} ${failed.length}/${FRAMEWORK_CONFIGS.length}`);
  console.log(`${colors.yellow}⚠️  Skipped:${colors.reset} ${skipped.length}/${FRAMEWORK_CONFIGS.length}`);
  
  if (successful.length > 0) {
    console.log(`\n${colors.bright}Detected Frameworks:${colors.reset}`);
    successful.forEach(r => console.log(`  ✅ ${r.framework}`));
  }
  
  if (failed.length > 0) {
    console.log(`\n${colors.bright}Failed Detections:${colors.reset}`);
    failed.forEach(r => {
      console.log(`  ❌ ${r.framework}`);
      console.log(`     Package: ${Object.keys(r.packageJson)[0]}`);
    });
  }
  
  // Test real project detection
  console.log(`\n${colors.bright}${colors.blue}🔍 Testing Current Project${colors.reset}`);
  const analyzer = new SmartProjectAnalyzer(process.cwd());
  const projectAnalysis = await analyzer.analyze();
  
  console.log(`\n${colors.bright}Current Project Analysis:${colors.reset}`);
  console.log(`Project: ${projectAnalysis.projectName}`);
  console.log(`Type: ${projectAnalysis.projectType}`);
  console.log(`Frameworks: ${projectAnalysis.detectedFrameworks.join(', ') || 'none'}`);
  console.log(`UI Libraries: ${projectAnalysis.detectedUILibraries.join(', ') || 'none'}`);
  console.log(`CSS Framework: ${projectAnalysis.cssFramework || 'none'}`);
  console.log(`Has TypeScript: ${projectAnalysis.hasTypeScript ? 'Yes' : 'No'}`);
  
  // Show all detected packages
  if (projectAnalysis.detectedPackages.length > 0) {
    console.log(`\n${colors.bright}All Detected Packages (${projectAnalysis.detectedPackages.length}):${colors.reset}`);
    const frameworkPackages = projectAnalysis.detectedPackages.filter(pkg => 
      FRAMEWORK_CONFIGS.some(f => f.packageName === pkg)
    );
    if (frameworkPackages.length > 0) {
      console.log(`  Frameworks: ${frameworkPackages.join(', ')}`);
    }
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Test failed:${colors.reset}`, error);
  process.exit(1);
});