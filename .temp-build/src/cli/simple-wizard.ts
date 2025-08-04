#!/usr/bin/env node

import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { ConfigurationWizard } from './core/configuration-wizard'
import { FeatureManager } from './core/feature-manager'
import { ProjectGenerator } from './core/project-generator'

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

async function main() {
  printBanner()
  
  console.log(chalk.bold.cyan('\n🚀 Revolutionary UI Setup Wizard\n'))
  
  // Ask what the user wants to do
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      { name: '🆕 Create a new project', value: 'create' },
      { name: '⚙️  Configure Revolutionary UI for current project', value: 'configure' },
      { name: '📊 Quick project analysis', value: 'analyze' },
      { name: '❌ Exit', value: 'exit' }
    ]
  }])

  if (action === 'exit') {
    console.log(chalk.yellow('\n👋 Goodbye!'))
    process.exit(0)
  }

  switch (action) {
    case 'create':
      await createNewProject()
      break
    case 'configure':
      await configureCurrentProject()
      break
    case 'analyze':
      await quickAnalysis()
      break
  }
}

async function createNewProject() {
  const projectGenerator = new ProjectGenerator()
  
  // Get project name
  const { projectName } = await inquirer.prompt([{
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    default: 'my-revolutionary-app',
    validate: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Project name is required'
      }
      if (!/^[a-z0-9-_]+$/i.test(value)) {
        return 'Project name can only contain letters, numbers, hyphens, and underscores'
      }
      return true
    }
  }])

  // Quick or custom setup
  const { setupType } = await inquirer.prompt([{
    type: 'list',
    name: 'setupType',
    message: 'Setup type:',
    choices: [
      { name: '⚡ Quick (React + TypeScript + Tailwind)', value: 'quick' },
      { name: '🎨 Custom', value: 'custom' }
    ]
  }])

  let config

  if (setupType === 'quick') {
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
        marketplace: false,
        monitoring: false,
        team: false,
        cloud: false,
        analytics: true,
        visualBuilder: false
      },
      advanced: {
        cacheEnabled: true,
        telemetry: false,
        autoUpdate: false,
        experimentalFeatures: false,
        debugMode: false
      }
    }
  } else {
    // Simple custom setup
    const customAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Framework:',
        choices: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js']
      },
      {
        type: 'list',
        name: 'language',
        message: 'Language:',
        choices: ['TypeScript', 'JavaScript']
      },
      {
        type: 'list',
        name: 'styleSystem',
        message: 'Styling:',
        choices: [
          { name: 'Tailwind CSS', value: 'tailwind' },
          { name: 'CSS Modules', value: 'css-modules' },
          { name: 'Styled Components', value: 'styled-components' },
          { name: 'Plain CSS', value: 'css' }
        ]
      }
    ])

    config = {
      project: {
        name: projectName,
        framework: customAnswers.framework,
        language: customAnswers.language,
        packageManager: 'npm',
        typescript: customAnswers.language === 'TypeScript',
        styleSystem: customAnswers.styleSystem,
        componentsDir: './src/components',
        outputDir: './src/components/generated'
      },
      preferences: {
        aiProvider: 'openai',
        defaultFramework: customAnswers.framework,
        codeStyle: 'airbnb',
        componentNaming: 'PascalCase',
        fileNaming: 'PascalCase',
        importStyle: 'named'
      },
      features: {
        ai: true,
        catalog: true,
        marketplace: false,
        monitoring: false,
        team: false,
        cloud: false,
        analytics: true,
        visualBuilder: false
      },
      advanced: {
        cacheEnabled: true,
        telemetry: false,
        autoUpdate: false,
        experimentalFeatures: false,
        debugMode: false
      }
    }
  }

  // Generate project
  const spinner = ora('Creating project...').start()
  
  try {
    const projectPath = await projectGenerator.generateProject(projectName, config)
    spinner.succeed('Project created successfully!')
    
    console.log(chalk.green('\n✨ Project created!\n'))
    console.log(chalk.bold('📁 Location:'))
    console.log(chalk.gray(`   ${projectPath}\n`))
    
    console.log(chalk.bold('🚀 Get started:'))
    console.log(chalk.cyan(`   cd ${projectName}`))
    console.log(chalk.cyan(`   npm install`))
    console.log(chalk.cyan(`   npm run dev\n`))
  } catch (error: any) {
    spinner.fail('Failed to create project')
    console.error(chalk.red(error.message))
  }
}

async function configureCurrentProject() {
  console.log(chalk.yellow('\n⚙️  Configuring Revolutionary UI for current project\n'))
  
  const configWizard = new ConfigurationWizard()
  const featureManager = new FeatureManager()
  
  // Simple project info for configuration
  const projectInfo = {
    summary: {
      name: process.cwd().split('/').pop() || 'my-project',
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
  
  const config = await configWizard.runWizard(projectInfo, {})
  
  console.log(chalk.green('\n✅ Configuration complete!\n'))
  console.log(chalk.gray('Your configuration has been saved.'))
}

async function quickAnalysis() {
  console.log(chalk.yellow('\n📊 Quick Project Analysis\n'))
  
  const projectName = process.cwd().split('/').pop() || 'Current Project'
  
  console.log(chalk.cyan('Project:'), projectName)
  console.log(chalk.cyan('Path:'), process.cwd())
  
  // Check for common files
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const checks = [
    { file: 'package.json', label: 'Node.js project' },
    { file: 'tsconfig.json', label: 'TypeScript' },
    { file: 'tailwind.config.js', label: 'Tailwind CSS' },
    { file: '.eslintrc.js', label: 'ESLint' },
    { file: 'vite.config.js', label: 'Vite' },
    { file: 'next.config.js', label: 'Next.js' }
  ]
  
  console.log(chalk.cyan('\nDetected:'))
  
  for (const check of checks) {
    try {
      await fs.access(path.join(process.cwd(), check.file))
      console.log(chalk.green(`  ✓ ${check.label}`))
    } catch {
      // File doesn't exist
    }
  }
  
  console.log(chalk.yellow('\n💡 Recommendations:'))
  console.log('  • Use Revolutionary UI to generate components 60-95% faster')
  console.log('  • Run "rui create" to start a new optimized project')
  console.log('  • Visit https://revolutionary-ui.com for documentation\n')
}

// Run the wizard
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error.message)
  process.exit(1)
})