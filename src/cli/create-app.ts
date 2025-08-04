#!/usr/bin/env node

/**
 * Revolutionary UI v3.0 - Create New App CLI
 * Always generates a new project with user-selected configuration
 */

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import { ProjectGenerator } from './core/project-generator'
import { ConfigurationWizard } from './core/configuration-wizard'
import { FeatureManager } from './core/feature-manager'
import packageJson from '../../package.json' with { type: 'json' }

// Revolutionary banner
const printBanner = () => {
  console.clear()
  console.log(chalk.magenta.bold(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║  ██████╗ ███████╗██╗   ██╗ ██████╗ ██╗     ██╗   ██╗████████╗██╗ ██████╗ ███╗   ██╗ ║
║  ██╔══██╗██╔════╝██║   ██║██╔═══██╗██║     ██║   ██║╚══██╔══╝██║██╔═══██╗████╗  ██║ ║
║  ██████╔╝█████╗  ██║   ██║██║   ██║██║     ██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║ ║
║  ██╔══██╗██╔══╝  ╚██╗ ██╔╝██║   ██║██║     ██║   ██║   ██║   ██║██║   ██║██║╚██╗██║ ║
║  ██║  ██║███████╗ ╚████╔╝ ╚██████╔╝███████╗╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║ ║
║  ╚═╝  ╚═╝╚══════╝  ╚═══╝   ╚═════╝ ╚══════╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ║
║                                                                               ║
║                          U I   F A C T O R Y   v3.0                          ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`))
}

// Progress indicator
const showProgress = (step: number, total: number, message: string) => {
  const percentage = Math.round((step / total) * 100)
  const filled = Math.round((step / total) * 20)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  
  console.log(chalk.cyan(`\n[${bar}] ${percentage}% - ${message}`))
}

export class CreateAppCLI {
  private projectGenerator: ProjectGenerator
  private configWizard: ConfigurationWizard
  private featureManager: FeatureManager

  constructor() {
    this.projectGenerator = new ProjectGenerator()
    this.configWizard = new ConfigurationWizard()
    this.featureManager = new FeatureManager()
  }

  async create(projectName?: string) {
    printBanner()
    
    console.log(chalk.bold.cyan('\n🚀 Create a new Revolutionary UI project\n'))
    console.log(chalk.gray('Generate production-ready UI components with AI-powered factories.\n'))

    // Step 1: Get project name
    if (!projectName) {
      const answer = await inquirer.prompt([{
        type: 'input',
        name: 'projectName',
        message: 'What would you like to name your project?',
        default: 'my-revolutionary-app',
        validate: (value: string) => {
          if (!value || value.trim().length === 0) {
            return 'Project name is required'
          }
          if (!/^[a-z0-9-_]+$/i.test(value)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores'
          }
          return true
        },
        filter: (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-')
      }])
      projectName = answer.projectName
    }

    // Step 2: Quick or custom setup
    const { setupType } = await inquirer.prompt([{
      type: 'list',
      name: 'setupType',
      message: 'Choose setup type:',
      choices: [
        { 
          name: '⚡ Quick setup (React, TypeScript, Tailwind)', 
          value: 'quick' 
        },
        { 
          name: '🎨 Custom setup (choose framework, styling, features)', 
          value: 'custom' 
        }
      ]
    }])

    let config

    if (setupType === 'quick') {
      // Quick setup with sensible defaults
      config = {
        project: {
          name: projectName,
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
          ai: true,
          catalog: true,
          marketplace: true,
          monitoring: false,
          team: false,
          cloud: true,
          analytics: true,
          visualBuilder: true
        },
        advanced: {
          cacheEnabled: true,
          telemetry: true,
          autoUpdate: true,
          experimentalFeatures: false,
          debugMode: false
        }
      }
      
      console.log(chalk.green('\n✓ Using quick setup configuration'))
    } else {
      // Custom setup
      showProgress(1, 5, 'Starting configuration wizard...')
      
      // Create a minimal analysis for new projects
      const minimalAnalysis = {
        summary: {
          name: projectName,
          framework: 'React',
          language: 'TypeScript',
          packageManager: 'npm',
          hasTypeScript: true,
          hasTailwind: false,
          hasESLint: true
        },
        structure: { files: [], directories: [] },
        dependencies: {},
        devDependencies: {},
        patterns: {},
        metrics: { totalFiles: 0, components: 0, dependencies: 0 },
        git: null,
        environment: {},
        recommendations: []
      }
      
      config = await this.configWizard.runWizard(minimalAnalysis, {})
    }

    // Step 3: Feature setup (for custom setup)
    if (setupType === 'custom') {
      showProgress(2, 5, 'Setting up features...')
      await this.featureManager.setupFeatures(config)
    }

    // Step 4: Generate project
    showProgress(setupType === 'quick' ? 1 : 3, setupType === 'quick' ? 3 : 5, 'Generating project structure...')
    
    const projectPath = await this.projectGenerator.generateProject(projectName!, config)

    // Step 5: Install dependencies
    showProgress(setupType === 'quick' ? 2 : 4, setupType === 'quick' ? 3 : 5, 'Dependencies...')
    
    const { installDeps } = await inquirer.prompt([{
      type: 'confirm',
      name: 'installDeps',
      message: 'Install dependencies now?',
      default: true
    }])

    if (installDeps) {
      const spinner = ora('Installing dependencies...').start()
      try {
        const { exec } = await import('child_process')
        const { promisify } = await import('util')
        const execAsync = promisify(exec)
        
        await execAsync(`${config.project.packageManager} install`, { 
          cwd: projectPath 
        })
        
        spinner.succeed('Dependencies installed successfully!')
      } catch (error) {
        spinner.fail('Failed to install dependencies')
        console.log(chalk.yellow('\nYou can install them manually by running:'))
        console.log(chalk.cyan(`  cd ${projectName}`))
        console.log(chalk.cyan(`  ${config.project.packageManager} install`))
      }
    }

    // Step 6: Final instructions
    showProgress(setupType === 'quick' ? 3 : 5, setupType === 'quick' ? 3 : 5, 'Complete!')
    
    console.log(chalk.green('\n✨ Project created successfully!\n'))
    console.log(chalk.bold('📁 Project location:'))
    console.log(chalk.gray(`   ${projectPath}\n`))
    
    console.log(chalk.bold('🚀 Get started with:'))
    console.log(chalk.cyan(`   cd ${projectName}`))
    if (!installDeps) {
      console.log(chalk.cyan(`   ${config.project.packageManager} install`))
    }
    console.log(chalk.cyan(`   ${config.project.packageManager} run dev\n`))
    
    console.log(chalk.bold('🤖 Generate components:'))
    console.log(chalk.cyan(`   ${config.project.packageManager} run rui:generate\n`))
    
    console.log(chalk.bold('📚 Browse catalog:'))
    console.log(chalk.cyan(`   ${config.project.packageManager} run rui:catalog\n`))
    
    console.log(chalk.gray('Check README.md for more information.\n'))
  }
}

// CLI program
const program = new Command()

program
  .name('create-revolutionary-app')
  .description('Create a new Revolutionary UI project')
  .version(packageJson.version)
  .argument('[project-name]', 'Name of the project to create')
  .action(async (projectName) => {
    const cli = new CreateAppCLI()
    await cli.create(projectName)
  })

program.parse()

// Error handling
process.on('unhandledRejection', (reason: any) => {
  console.error(chalk.red('\n❌ Error:'), reason.message || reason)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Creation cancelled!'))
  process.exit(0)
})