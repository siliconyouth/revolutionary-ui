#!/usr/bin/env node

/**
 * Revolutionary UI Factory CLI
 * Command-line interface for analyzing projects and setting up the factory system
 */

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { ProjectDetector, ProjectAnalysis } from './project-detector'
import { ProjectAnalyzer, AnalysisReport } from './project-analyzer'
import { AIAnalyzer, AIAnalysisResult } from './ai-analyzer'
import { SetupWizard } from './setup-wizard'
import { AuthManager } from './auth-manager'
import * as fs from 'fs/promises'
import * as path from 'path'

const VERSION = '3.2.0'
const program = new Command()

program
  .name('revolutionary-ui')
  .description('Revolutionary UI Factory - Generate UI components with 60-95% less code')
  .version(VERSION)

program
  .command('analyze')
  .description('Analyze your project and get recommendations')
  .action(async () => {
    const spinner = ora('Analyzing project...').start()
    try {
      const detector = new ProjectDetector()
      const analysis = await detector.analyze()
      const analyzer = new ProjectAnalyzer(analysis)
      const report = analyzer.generateReport()
      spinner.succeed('Analysis complete!')

      spinner.start('Running AI-powered analysis...')
      const aiAnalyzer = new AIAnalyzer(analysis, report)
      const aiResults = await aiAnalyzer.generateAIRecommendations()
      spinner.succeed('AI analysis complete!')

      console.log(JSON.stringify({ analysis, report, aiResults }, null, 2))
    } catch (error: any) {
      spinner.fail('Analysis failed')
      console.error(chalk.red(`
❌ Error: ${error.message}`))
      process.exit(1)
    }
  })

program
  .command('setup')
  .description('Set up Revolutionary UI Factory for your project')
  .action(async () => {
    try {
        const detector = new ProjectDetector()
        const analysis = await detector.analyze()
        const analyzer = new ProjectAnalyzer(analysis)
        const report = analyzer.generateReport()
        const aiAnalyzer = new AIAnalyzer(analysis, report)
        const aiResults = await aiAnalyzer.generateAIRecommendations()
        
        const wizard = new SetupWizard(analysis, report, {}, aiResults)
        await wizard.run()
    } catch (error: any) {
      console.error(chalk.red(`
❌ Error: ${error.message}`))
      process.exit(1)
    }
  })

// Other commands...
program
  .command('generate')
  .description('Generate a component')
  .action(() => console.log('Generate command placeholder'));

program
  .command('list')
  .description('List packages')
  .action(() => console.log('List command placeholder'));

program
  .command('info')
  .description('Show info')
  .action(() => console.log('Info command placeholder'));

program
  .command('login')
  .description('Login')
  .action(async () => { await AuthManager.login() });

program
  .command('logout')
  .description('Logout')
  .action(AuthManager.logout);

program
  .command('account')
  .description('Show account info')
  .action(async () => {
      const auth = await AuthManager.getAuth();
      console.log(auth);
  });

program.parse(process.argv)