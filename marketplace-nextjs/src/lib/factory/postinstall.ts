#!/usr/bin/env node

/**
 * Revolutionary UI Factory - Post Install Script
 * Automatically runs setup wizard after package installation
 */

import chalk from 'chalk'
import ora from 'ora'
import { ProjectDetector } from './project-detector'
import { ProjectAnalyzer } from './project-analyzer'
import { AIAnalyzer } from './ai-analyzer'
import { SetupWizard, WizardOptions } from './setup-wizard'
import { PackageInstaller, InstallOptions } from './package-installer'
import * as fs from 'fs/promises'
import * as path from 'path'

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || 
              process.env.CONTINUOUS_INTEGRATION === 'true' ||
              process.env.GITHUB_ACTIONS === 'true' ||
              process.env.GITLAB_CI === 'true' ||
              process.env.CIRCLECI === 'true'

// Check if this is being run as part of the package's own install
const isOwnInstall = process.cwd().includes('revolutionary-ui-marketplace')

async function runPostInstall() {
  // Skip in CI environments or when installing the package itself
  if (isCI || isOwnInstall) {
    return
  }

  console.clear()
  
  // Welcome message
  console.log(chalk.magenta.bold(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏭 Revolutionary UI Factory                                 ║
║   Thank you for installing!                                   ║
║                                                               ║
║   Transform your development with 60-95% less code!          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`))

  console.log(chalk.cyan('✨ Initializing Revolutionary UI Factory...\n'))

  try {
    // Step 1: Analyze the project
    const spinner = ora('Analyzing your project...').start()
    
    const detector = new ProjectDetector()
    const analysis = await detector.analyze()
    
    const analyzer = new ProjectAnalyzer(analysis)
    const report = analyzer.generateReport()
    
    spinner.succeed('Project analysis complete!')

    // Step 2: Run AI analysis
    spinner.start('Running AI-powered analysis...')
    
    const aiAnalyzer = new AIAnalyzer(analysis, report)
    const aiResults = await aiAnalyzer.generateAIRecommendations()
    
    spinner.succeed('AI analysis complete!')

    // Display AI insights
    console.log(chalk.bold.blue('\n🤖 AI Insights:\n'))
    
    if (aiResults.projectInsights.length > 0) {
      console.log(chalk.cyan('Project Insights:'))
      aiResults.projectInsights.forEach(insight => {
        console.log(`  ${insight}`)
      })
      console.log()
    }

    // Display top AI recommendations
    if (aiResults.recommendations.length > 0) {
      console.log(chalk.cyan('Top Recommendations:'))
      aiResults.recommendations
        .filter(rec => rec.priority === 'critical' || rec.priority === 'high')
        .slice(0, 3)
        .forEach(rec => {
          console.log(chalk.yellow(`\n  📌 ${rec.category}: ${rec.recommendation}`))
          console.log(chalk.gray(`     ${rec.reasoning}`))
          console.log(chalk.green(`     Impact: ${rec.estimatedImpact}`))
        })
      console.log()
    }

    // Step 3: Ask if user wants to proceed with setup
    console.log(chalk.bold.yellow('\n🚀 Ready to set up Revolutionary UI Factory?\n'))
    console.log('This will:')
    console.log('  • Install recommended packages based on AI analysis')
    console.log('  • Configure your project for optimal performance')
    console.log('  • Set up development tools and scripts')
    console.log('  • Create example components to get you started')
    console.log()

    // For postinstall, we'll use automatic mode with AI recommendations
    const wizardOptions: WizardOptions = {
      interactive: false, // Use automatic mode for postinstall
      autoInstall: true,
      updateExisting: true,
      packageManager: analysis.packageManager
    }

    // Create a configuration file to track that setup has been run
    const configPath = path.join(process.cwd(), '.revolutionary-ui-setup')
    
    try {
      await fs.access(configPath)
      console.log(chalk.yellow('ℹ️  Revolutionary UI Factory has already been set up for this project.'))
      console.log(chalk.gray('   Run "npx revolutionary-ui setup" to reconfigure.\n'))
      return
    } catch {
      // Config doesn't exist, continue with setup
    }

    // Step 4: Run setup wizard in automatic mode
    console.log(chalk.cyan('🔧 Running automatic setup based on AI recommendations...\n'))
    
    const wizard = new SetupWizard(analysis, report, wizardOptions)
    const wizardResult = await wizard.run()

    // Step 5: Install packages
    if (wizardResult.installCommands.length > 0) {
      const installOptions: InstallOptions = {
        dryRun: false,
        verbose: false,
        force: false,
        skipConfigFiles: false,
        packageManager: analysis.packageManager
      }

      const installer = new PackageInstaller(process.cwd(), installOptions)
      const installResult = await installer.install(wizardResult)

      // Display results
      console.log(chalk.bold.green('\n✅ Setup Complete!\n'))

      if (installResult.installedPackages.length > 0) {
        console.log(chalk.green(`✓ Installed ${installResult.installedPackages.length} packages`))
      }

      if (installResult.configFilesCreated.length > 0) {
        console.log(chalk.green(`✓ Created ${installResult.configFilesCreated.length} configuration files`))
      }

      // Save setup configuration
      await fs.writeFile(configPath, JSON.stringify({
        version: '2.1.0',
        setupDate: new Date().toISOString(),
        installedPackages: installResult.installedPackages,
        aiRecommendations: aiResults.recommendations.length
      }, null, 2))
    }

    // Step 6: Display next steps
    console.log(chalk.bold.blue('\n🎯 Next Steps:\n'))
    
    const nextSteps = [
      'Use "npx revolutionary-ui generate <component>" to create components',
      'Run "npx revolutionary-ui analyze" to see detailed project analysis',
      'Visit https://revolutionary-ui.com/docs for documentation',
      ...aiResults.nextSteps.slice(0, 2)
    ]

    nextSteps.forEach((step, index) => {
      console.log(chalk.cyan(`${index + 1}. ${step}`))
    })

    console.log(chalk.bold.green('\n✨ Happy coding with Revolutionary UI Factory!\n'))
    console.log(chalk.gray('Generate UI components with 60-95% less code.\n'))

  } catch (error: any) {
    console.error(chalk.red('\n❌ Setup failed:'), error.message)
    console.log(chalk.yellow('\nYou can manually run setup with: npx revolutionary-ui setup\n'))
    
    // Don't fail the install
    process.exit(0)
  }
}

// Run the postinstall script
runPostInstall().catch(error => {
  console.error('Postinstall error:', error)
  // Don't fail the install
  process.exit(0)
})