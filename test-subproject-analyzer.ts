#!/usr/bin/env tsx

import { SmartProjectAnalyzer } from './src/cli/core/smart-project-analyzer'
import chalk from 'chalk'

async function test() {
  console.log(chalk.cyan('Testing Smart Project Analyzer with subproject detection...\n'))
  
  const analyzer = new SmartProjectAnalyzer()
  const result = await analyzer.analyze()
  
  console.log(chalk.green('\nAnalysis Complete!\n'))
  console.log('Project:', result.name)
  console.log('Framework:', result.framework)
  console.log('Path:', result.rootPath)
  
  if (result.subProjects && result.subProjects.length > 0) {
    console.log(chalk.yellow('\nSubprojects detected:'))
    result.subProjects.forEach(sub => {
      console.log(`  - ${sub.name} (${sub.framework}) at ${sub.path}`)
    })
  }
}

test().catch(console.error)