#!/usr/bin/env tsx

import { FeatureManager } from './src/cli/core/feature-manager'
import { SessionManager } from './src/cli/core/session-manager'
import chalk from 'chalk'

async function test() {
  console.log(chalk.cyan('Testing feature initialization...\n'))
  
  // Create a test configuration
  const testConfig = {
    project: {
      name: 'test-project',
      framework: 'React',
      language: 'TypeScript',
      packageManager: 'npm',
      typescript: true,
      styleSystem: 'tailwind',
      componentsDir: './src/components',
      outputDir: './src/components/generated'
    },
    preferences: {
      aiProvider: 'openai',
      defaultFramework: 'React',
      codeStyle: 'airbnb',
      componentNaming: 'PascalCase',
      fileNaming: 'PascalCase',
      importStyle: 'named'
    },
    features: {
      'ai-generation': true,
      'catalog': true,
      'marketplace': false,
      'monitoring': false,
      'team': false,
      'cloud': false,
      'analytics': false,
      'visual-builder': false
    },
    advanced: {
      cacheEnabled: true,
      telemetry: false,
      autoUpdate: false,
      experimentalFeatures: false,
      debugMode: false
    }
  }
  
  // Initialize feature manager
  const featureManager = new FeatureManager()
  
  console.log(chalk.yellow('Setting up features...'))
  const results = await featureManager.setupFeatures(testConfig)
  
  console.log(chalk.green('\nSetup results:'))
  results.forEach(result => {
    console.log(`- ${result.feature}: ${result.status} ${result.message || ''}`)
  })
  
  // Test generation
  console.log(chalk.cyan('\nTesting AI generation...'))
  try {
    await featureManager.generateWithAI()
  } catch (error: any) {
    console.log(chalk.red('Error:', error.message))
  }
}

test().catch(console.error)