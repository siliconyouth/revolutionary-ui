#!/usr/bin/env node

/**
 * Revolutionary UI Factory CLI
 * Command-line interface for analyzing projects and setting up the factory system
 */

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
const inquirer = require('inquirer')
import { ProjectDetector } from './project-detector'
import { ProjectAnalyzer } from './project-analyzer'
import { AIAnalyzer } from './ai-analyzer'
import { SetupWizard, WizardOptions } from './setup-wizard'
import { PackageInstaller, InstallOptions } from './package-installer'
import * as fs from 'fs/promises'
import * as path from 'path'
// Factory stats
const FACTORY_STATS = {
  totalFrameworks: 11,
  totalUILibraries: 14,
  totalIconLibraries: 15,
  totalIcons: 75000,
  totalDesignTools: 6,
  totalColorTools: 4,
  totalFonts: 8,
  totalPackages: 100
}

// Version from package.json
const VERSION = '2.1.0'

const program = new Command()

// ASCII art banner
const printBanner = () => {
  console.log(chalk.magenta(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏭 Revolutionary UI Factory System                          ║
║   Transform your development with 60-95% less code!          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`))
}

// Print statistics
const printStats = () => {
  console.log(chalk.cyan('\n📊 Factory Resources:'))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalFrameworks} JavaScript Frameworks`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalUILibraries} UI Component Libraries`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalIconLibraries} Icon Libraries (${FACTORY_STATS.totalIcons}+ icons)`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalDesignTools} Design Tool Integrations`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalColorTools} Color & Styling Tools`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalFonts} Professional Fonts`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalPackages}+ Total Packages Available\n`))
}

// Main program configuration
program
  .name('revolutionary-ui')
  .description('Revolutionary UI Factory - Generate UI components with 60-95% less code')
  .version(VERSION)

// Analyze command
program
  .command('analyze')
  .alias('a')
  .description('Analyze your project and get recommendations')
  .option('-d, --detailed', 'Show detailed analysis')
  .option('-j, --json', 'Output as JSON')
  .option('-o, --output <file>', 'Save analysis to file')
  .option('--no-ai', 'Skip AI-powered analysis')
  .action(async (options) => {
    printBanner()
    
    const spinner = ora('Analyzing project...').start()
    
    try {
      // Run analysis
      const detector = new ProjectDetector()
      const analysis = await detector.analyze()
      
      const analyzer = new ProjectAnalyzer(analysis)
      const report = analyzer.generateReport()
      
      spinner.succeed('Analysis complete!')

      // Run AI analysis unless disabled
      let aiResults = null
      if (options.ai !== false) {
        spinner.start('Running AI-powered analysis...')
        const aiAnalyzer = new AIAnalyzer(analysis, report)
        aiResults = await aiAnalyzer.generateAIRecommendations()
        spinner.succeed('AI analysis complete!')
      }
      
      if (options.json) {
        const output = JSON.stringify({ analysis, report, aiResults }, null, 2)
        
        if (options.output) {
          await fs.writeFile(options.output, output, 'utf-8')
          console.log(chalk.green(`\n✅ Analysis saved to ${options.output}`))
        } else {
          console.log(output)
        }
      } else {
        // Print human-readable report
        printAnalysisReport(analysis, report, aiResults, options.detailed)
        
        if (options.output) {
          const output = generateTextReport(analysis, report, aiResults, options.detailed)
          await fs.writeFile(options.output, output, 'utf-8')
          console.log(chalk.green(`\n✅ Analysis saved to ${options.output}`))
        }
      }
      
      // Ask if they want to run setup
      if (!options.json) {
        const { runSetup } = await inquirer.prompt([{
          type: 'confirm',
          name: 'runSetup',
          message: '\nWould you like to run the setup wizard now?',
          default: true
        }])
        
        if (runSetup) {
          await runSetupWizard(analysis, report, {}, aiResults)
        }
      }
    } catch (error: any) {
      spinner.fail('Analysis failed')
      console.error(chalk.red(`\n❌ Error: ${error.message}`))
      process.exit(1)
    }
  })

// Setup command
program
  .command('setup')
  .alias('s')
  .description('Set up Revolutionary UI Factory for your project')
  .option('-i, --interactive', 'Run in interactive mode (default)', true)
  .option('-a, --auto', 'Run in automatic mode with recommended settings')
  .option('-u, --update', 'Update existing packages to latest versions')
  .option('--dry-run', 'Show what would be installed without making changes')
  .option('--force', 'Force installation even if errors occur')
  .option('--skip-config', 'Skip creating configuration files')
  .option('-p, --package-manager <pm>', 'Package manager to use', 'npm')
  .action(async (options) => {
    printBanner()
    
    try {
      // Run analysis first
      const spinner = ora('Analyzing project...').start()
      const detector = new ProjectDetector()
      const analysis = await detector.analyze()
      
      const analyzer = new ProjectAnalyzer(analysis)
      const report = analyzer.generateReport()
      
      spinner.succeed('Analysis complete!')
      
      // Run AI analysis
      spinner.start('Running AI-powered analysis...')
      const aiAnalyzer = new AIAnalyzer(analysis, report)
      const aiResults = await aiAnalyzer.generateAIRecommendations()
      spinner.succeed('AI analysis complete!')
      
      // Run setup wizard
      await runSetupWizard(analysis, report, options, aiResults)
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`))
      process.exit(1)
    }
  })

// Generate command
program
  .command('generate [component]')
  .alias('g')
  .description('Generate a new component using Revolutionary UI Factory')
  .option('-t, --type <type>', 'Component type (e.g., button, form, card)')
  .option('-l, --library <library>', 'UI library to use')
  .option('-o, --output <path>', 'Output directory')
  .action(async (componentName, options) => {
    printBanner()
    
    // Check if factory is configured
    const configPath = path.join(process.cwd(), 'revolutionary-ui.config.js')
    const hasConfig = await fileExists(configPath)
    
    if (!hasConfig) {
      console.log(chalk.yellow('\n⚠️  Revolutionary UI Factory is not configured for this project.'))
      const { runSetup } = await inquirer.prompt([{
        type: 'confirm',
        name: 'runSetup',
        message: 'Would you like to run the setup wizard?',
        default: true
      }])
      
      if (runSetup) {
        const detector = new ProjectDetector()
        const analysis = await detector.analyze()
        const analyzer = new ProjectAnalyzer(analysis)
        const report = analyzer.generateReport()
        await runSetupWizard(analysis, report)
      } else {
        process.exit(0)
      }
    }
    
    // TODO: Implement component generation
    console.log(chalk.yellow('\n🚧 Component generation coming soon!'))
    console.log(chalk.gray('This feature will generate components with 60-95% less code.'))
  })

// List command
program
  .command('list [category]')
  .alias('ls')
  .description('List available packages by category')
  .option('-i, --installed', 'Show only installed packages')
  .action(async (category, options) => {
    printBanner()
    
    const validCategories = ['frameworks', 'ui', 'icons', 'design', 'color', 'fonts', 'all']
    
    if (category && !validCategories.includes(category)) {
      console.log(chalk.red(`\n❌ Invalid category: ${category}`))
      console.log(chalk.gray(`Valid categories: ${validCategories.join(', ')}`))
      process.exit(1)
    }
    
    // TODO: Implement package listing
    console.log(chalk.yellow('\n🚧 Package listing coming soon!'))
    printStats()
  })

// Info command
program
  .command('info')
  .description('Show information about Revolutionary UI Factory')
  .action(() => {
    printBanner()
    printStats()
    
    console.log(chalk.bold('\n🚀 What is Revolutionary UI Factory?\n'))
    console.log('Revolutionary UI Factory is a next-generation development system that')
    console.log('transforms how you build user interfaces. Write 60-95% less code while')
    console.log('maintaining full control and flexibility.\n')
    
    console.log(chalk.bold('✨ Key Features:\n'))
    console.log('  • Intelligent project analysis and recommendations')
    console.log('  • Support for all major frameworks and UI libraries')
    console.log('  • Seamless integration with existing projects')
    console.log('  • Design tool importers (Figma, Sketch)')
    console.log('  • 75,000+ icons across multiple libraries')
    console.log('  • Automatic setup and configuration')
    console.log('  • Component generation with massive code reduction\n')
    
    console.log(chalk.bold('📚 Documentation:\n'))
    console.log('  • Website: https://revolutionary-ui.com')
    console.log('  • GitHub: https://github.com/revolutionary-ui/factory')
    console.log('  • Discord: https://discord.gg/revolutionary-ui\n')
  })

// Parse arguments
program.parse(process.argv)

// Show help if no command provided
if (!process.argv.slice(2).length) {
  printBanner()
  program.outputHelp()
}

// Helper functions

async function runSetupWizard(analysis: any, report: any, options: any = {}, aiResults: any = null) {
  // Display AI insights if available
  if (aiResults && aiResults.projectInsights.length > 0) {
    console.log(chalk.bold.magenta('\n🤖 AI Insights:\n'))
    aiResults.projectInsights.forEach((insight: string) => {
      console.log(chalk.cyan(`  ${insight}`))
    })
    console.log()
  }
  
  const wizardOptions: WizardOptions = {
    interactive: !options.auto,
    autoInstall: !options.dryRun,
    updateExisting: options.update || false,
    packageManager: options.packageManager || analysis.packageManager
  }
  
  const wizard = new SetupWizard(analysis, report, wizardOptions)
  const wizardResult = await wizard.run()
  
  // Show what will be installed
  console.log(chalk.bold.blue('\n📋 Installation Plan:\n'))
  
  if (wizardResult.installCommands.length > 0) {
    console.log(chalk.cyan('Commands to run:'))
    wizardResult.installCommands.forEach(cmd => {
      console.log(chalk.gray(`  $ ${cmd}`))
    })
  }
  
  if (wizardResult.configFiles.length > 0) {
    console.log(chalk.cyan('\nConfiguration files to create:'))
    wizardResult.configFiles.forEach(file => {
      console.log(chalk.gray(`  • ${file.filename} - ${file.description}`))
    })
  }
  
  // Confirm installation
  if (!options.dryRun && wizardResult.installCommands.length > 0) {
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: '\nProceed with installation?',
      default: true
    }])
    
    if (proceed) {
      const installOptions: InstallOptions = {
        dryRun: false,
        verbose: true,
        force: options.force || false,
        skipConfigFiles: options.skipConfig || false,
        packageManager: wizardOptions.packageManager
      }
      
      const installer = new PackageInstaller(process.cwd(), installOptions)
      const result = await installer.install(wizardResult)
      
      // Print results
      console.log(chalk.bold.blue('\n📊 Installation Summary:\n'))
      
      if (result.installedPackages.length > 0) {
        console.log(chalk.green(`✅ Installed ${result.installedPackages.length} packages`))
      }
      
      if (result.failedPackages.length > 0) {
        console.log(chalk.red(`❌ Failed to install ${result.failedPackages.length} packages`))
        result.failedPackages.forEach(pkg => {
          console.log(chalk.red(`   • ${pkg}`))
        })
      }
      
      if (result.configFilesCreated.length > 0) {
        console.log(chalk.green(`✅ Created ${result.configFilesCreated.length} configuration files`))
      }
      
      if (result.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'))
        result.warnings.forEach(warning => {
          console.log(chalk.yellow(`   • ${warning}`))
        })
      }
      
      // Show next steps
      if (wizardResult.nextSteps.length > 0) {
        console.log(chalk.bold.blue('\n🎯 Next Steps:\n'))
        wizardResult.nextSteps.forEach((step, index) => {
          console.log(chalk.cyan(`${index + 1}. ${step}`))
        })
      }
      
      console.log(chalk.bold.green('\n✨ Revolutionary UI Factory setup complete!'))
      console.log(chalk.gray('Start building amazing components with 60-95% less code.\n'))
    }
  } else if (options.dryRun) {
    console.log(chalk.yellow('\n⚠️  Dry run mode - no changes were made'))
  }
}

function printAnalysisReport(analysis: any, report: any, aiResults: any, detailed: boolean = false) {
  console.log(chalk.bold.blue('\n📊 Project Analysis Report\n'))
  
  // Summary
  const { summary } = report
  console.log(chalk.cyan('Project Summary:'))
  console.log(`  • Name: ${analysis.projectName}`)
  console.log(`  • Package Manager: ${analysis.packageManager}`)
  console.log(`  • TypeScript: ${analysis.hasTypeScript ? '✅' : '❌'}`)
  console.log(`  • Tailwind CSS: ${analysis.hasTailwind ? '✅' : '❌'}`)
  console.log(`  • ESLint: ${analysis.hasESLint ? '✅' : '❌'}`)
  console.log(`  • Prettier: ${analysis.hasPrettier ? '✅' : '❌'}`)
  
  console.log(chalk.cyan('\nStack Overview:'))
  console.log(`  • Frameworks: ${summary.frameworkStack.length > 0 ? summary.frameworkStack.join(', ') : 'None'}`)
  console.log(`  • UI Libraries: ${summary.uiStack.length > 0 ? summary.uiStack.join(', ') : 'None'}`)
  console.log(`  • Design Tools: ${summary.designCapabilities.length > 0 ? summary.designCapabilities.join(', ') : 'None'}`)
  
  console.log(chalk.cyan('\nCoverage:'))
  console.log(`  • Overall: ${summary.coverage.overall}%`)
  console.log(`  • Frameworks: ${summary.coverage.frameworks}%`)
  console.log(`  • UI Libraries: ${summary.coverage.uiLibraries}%`)
  console.log(`  • Icons: ${summary.coverage.icons}%`)
  console.log(`  • Design Tools: ${summary.coverage.designTools}%`)
  
  // Compatibility
  if (report.compatibility.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Compatibility Warnings:'))
    report.compatibility.warnings.forEach((warning: string) => {
      console.log(chalk.yellow(`  • ${warning}`))
    })
  }
  
  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(chalk.cyan('\n💡 Recommendations:'))
    report.recommendations
      .filter((rec: any) => rec.priority === 'high' || detailed)
      .forEach((rec: any) => {
        console.log(`  • ${rec.reason}`)
        if (detailed) {
          console.log(chalk.gray(`    Suggested: ${rec.packages.join(', ')}`))
          console.log(chalk.gray(`    Priority: ${rec.priority}`))
        }
      })
  }
  
  // Missing features
  if (report.missingFeatures.length > 0) {
    console.log(chalk.cyan('\n🔍 Missing Features:'))
    report.missingFeatures
      .filter((feature: any) => feature.impact !== 'nice-to-have' || detailed)
      .forEach((feature: any) => {
        console.log(`  • ${feature.feature} (${feature.impact})`)
        if (detailed) {
          console.log(chalk.gray(`    ${feature.description}`))
          console.log(chalk.gray(`    Suggested: ${feature.suggestedPackages.join(', ')}`))
        }
      })
  }
  
  // Optimizations
  if (report.optimizations.length > 0 && detailed) {
    console.log(chalk.cyan('\n⚡ Optimization Opportunities:'))
    report.optimizations.forEach((opt: any) => {
      console.log(`  • ${opt.description}`)
      console.log(chalk.gray(`    Action: ${opt.action}`))
      console.log(chalk.gray(`    Impact: ${opt.impact}`))
    })
  }
  
  // Setup plan
  if (detailed && report.setupPlan.steps.length > 0) {
    console.log(chalk.cyan('\n📋 Recommended Setup Plan:'))
    console.log(`  Estimated time: ${report.setupPlan.estimatedTime}`)
    console.log(`  Difficulty: ${report.setupPlan.difficulty}`)
    console.log('\n  Steps:')
    report.setupPlan.steps.forEach((step: any) => {
      console.log(`  ${step.order}. ${step.title}${step.optional ? ' (optional)' : ''}`)
      console.log(chalk.gray(`     ${step.description}`))
    })
  }

  // AI Results
  if (aiResults) {
    console.log(chalk.bold.magenta('\n🤖 AI-Powered Insights:\n'))
    
    // Project insights
    if (aiResults.projectInsights.length > 0) {
      console.log(chalk.cyan('Key Insights:'))
      aiResults.projectInsights.forEach((insight: string) => {
        console.log(`  ${insight}`)
      })
    }
    
    // AI recommendations
    if (aiResults.recommendations.length > 0) {
      console.log(chalk.cyan('\n🎯 AI Recommendations:'))
      aiResults.recommendations
        .filter((rec: any) => rec.priority === 'critical' || rec.priority === 'high' || detailed)
        .forEach((rec: any) => {
          console.log(chalk.yellow(`\n  ${rec.category}: ${rec.recommendation}`))
          console.log(chalk.gray(`    ${rec.reasoning}`))
          console.log(chalk.green(`    Impact: ${rec.estimatedImpact}`))
          if (rec.packages && rec.packages.length > 0) {
            console.log(chalk.gray(`    Packages: ${rec.packages.join(', ')}`))
          }
        })
    }
    
    // Architecture advice
    if (detailed && aiResults.architectureAdvice) {
      console.log(chalk.cyan('\n🏗️ Architecture Recommendations:'))
      console.log(aiResults.architectureAdvice.split('\n').map((line: string) => `  ${line}`).join('\n'))
    }
    
    // Performance optimizations
    if (aiResults.performanceOptimizations.length > 0 && detailed) {
      console.log(chalk.cyan('\n⚡ Performance Optimizations:'))
      aiResults.performanceOptimizations.forEach((opt: string) => {
        console.log(`  • ${opt}`)
      })
    }
    
    // Security considerations
    if (aiResults.securityConsiderations.length > 0 && detailed) {
      console.log(chalk.cyan('\n🔒 Security Considerations:'))
      aiResults.securityConsiderations.forEach((sec: string) => {
        console.log(`  • ${sec}`)
      })
    }
  }
}

function generateTextReport(analysis: any, report: any, aiResults: any, detailed: boolean): string {
  let output = 'Revolutionary UI Factory - Project Analysis Report\n'
  output += '================================================\n\n'
  
  // Add all the report sections as text
  // (Similar to printAnalysisReport but returning a string)
  
  return output
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}