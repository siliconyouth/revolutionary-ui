#!/usr/bin/env node

/**
 * Test specific package detection from database
 */

import { DatabaseResourceService } from '../src/services/database-resource-service';
import chalk from 'chalk';

async function testSpecificPackages() {
  console.log(chalk.blue.bold('\n🔍 Testing Specific Package Detection\n'));
  
  const dbService = DatabaseResourceService.getInstance();
  
  // Test packages we know are in marketplace-nextjs
  const testPackages = [
    'react',
    'next',
    'antd',
    'lucide-react',
    '@mui/material',
    '@chakra-ui/react',
    '@angular/core',
    'vue',
    'svelte',
    '@mantine/core'
  ];
  
  console.log(chalk.cyan('Testing framework detection:'));
  const frameworkMap = await dbService.getFrameworksByPackages(testPackages);
  console.log(`Found ${frameworkMap.size} frameworks:`);
  frameworkMap.forEach((framework, pkg) => {
    console.log(`  ${chalk.green('✓')} ${pkg} → ${framework.name}`);
  });
  
  console.log(chalk.cyan('\nTesting UI library detection:'));
  const uiMap = await dbService.getUILibrariesByPackages(testPackages);
  console.log(`Found ${uiMap.size} UI libraries:`);
  uiMap.forEach((library, pkg) => {
    console.log(`  ${chalk.green('✓')} ${pkg} → ${library.name}`);
  });
  
  console.log(chalk.cyan('\nTesting icon library detection:'));
  const iconLibraries = await dbService.getIconLibraries();
  const iconPackageMap = new Map<string, string>();
  iconLibraries.forEach(lib => {
    if (lib.packageName && testPackages.includes(lib.packageName)) {
      iconPackageMap.set(lib.packageName, lib.name);
    }
  });
  console.log(`Found ${iconPackageMap.size} icon libraries:`);
  iconPackageMap.forEach((name, pkg) => {
    console.log(`  ${chalk.green('✓')} ${pkg} → ${name}`);
  });
  
  // Test the actual marketplace dependencies
  console.log(chalk.cyan('\n\nTesting marketplace-nextjs project:'));
  
  const marketplaceDeps = {
    "react": "19.1.1",
    "next": "15.4.5",
    "antd": "^5.26.7",
    "lucide-react": "^0.536.0",
    "@mui/material": "^6.4.0",
    "@chakra-ui/react": "^3.2.3",
    "@mantine/core": "^8.1.2",
    "@angular/core": "^19.1.6"
  };
  
  const packageNames = Object.keys(marketplaceDeps);
  
  console.log(chalk.yellow(`\nChecking ${packageNames.length} packages from marketplace:`));
  
  const frameworks = await dbService.getFrameworksByPackages(packageNames);
  const uiLibs = await dbService.getUILibrariesByPackages(packageNames);
  const iconLibs = await dbService.getIconLibraries();
  
  let detectedCount = 0;
  
  for (const pkg of packageNames) {
    if (frameworks.has(pkg)) {
      console.log(`  ${chalk.green('✓')} ${pkg} → Framework: ${frameworks.get(pkg)?.name}`);
      detectedCount++;
    } else if (uiLibs.has(pkg)) {
      console.log(`  ${chalk.green('✓')} ${pkg} → UI Library: ${uiLibs.get(pkg)?.name}`);
      detectedCount++;
    } else {
      const iconLib = iconLibs.find(lib => lib.packageName === pkg);
      if (iconLib) {
        console.log(`  ${chalk.green('✓')} ${pkg} → Icon Library: ${iconLib.name}`);
        detectedCount++;
      } else {
        console.log(`  ${chalk.red('✗')} ${pkg} → Not found in database`);
      }
    }
  }
  
  console.log(chalk.bold(`\nDetection rate: ${detectedCount}/${packageNames.length} (${Math.round(detectedCount/packageNames.length * 100)}%)`));
  
  await dbService.disconnect();
}

testSpecificPackages().catch(console.error);