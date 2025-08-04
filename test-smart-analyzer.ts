#!/usr/bin/env tsx

import { SmartProjectAnalyzer } from './src/cli/core/smart-project-analyzer'
import chalk from 'chalk'

async function test() {
  console.log(chalk.cyan('Testing Smart Project Analyzer...\n'))
  
  const analyzer = new SmartProjectAnalyzer()
  const result = await analyzer.analyze()
  
  console.log(chalk.green('\nAnalysis Complete!\n'))
  console.log(JSON.stringify(result, null, 2))
}

test().catch(console.error)