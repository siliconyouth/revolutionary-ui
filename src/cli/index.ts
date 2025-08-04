#!/usr/bin/env node

/**
 * Revolutionary UI v3.0 CLI
 * Enhanced command-line interface with authentication, AI, catalog, and monitoring
 */

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import fs from 'fs/promises'
import path from 'path'
import { homedir } from 'os'

// Import command modules
import { AuthCommands } from './commands/auth'
import { AnalyzeCommand } from './commands/analyze'
import { GenerateCommand } from './commands/generate'
import { CatalogCommand } from './commands/catalog'
import { MarketplaceCommand } from './commands/marketplace'
import { MonitorCommand } from './commands/monitor'
import { SetupCommand } from './commands/setup'
import { ConfigCommand } from './commands/config'
import { TeamCommand } from './commands/team'
import { CloudCommand } from './commands/cloud'

// Import utilities
import { AuthManager } from './utils/auth-manager'
import { ConfigManager } from './utils/config-manager'
import { UpdateChecker } from './utils/update-checker'
import { TelemetryManager } from './utils/telemetry'

// Version from package.json
const VERSION = '3.0.0'

// Enhanced factory stats for v3.0
const FACTORY_STATS = {
  totalFrameworks: 50,
  totalComponents: 10000,
  totalUILibraries: 30,
  totalIconLibraries: 25,
  totalIcons: 150000,
  totalDesignTools: 10,
  totalColorTools: 8,
  totalFonts: 20,
  totalPackages: 200,
  aiProviders: 4,
  codeReduction: '60-95%'
}

// ASCII art banner with new branding
const printBanner = () => {
  console.log(chalk.magenta(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🏭 Revolutionary UI v${VERSION}                                    ║
║   AI-Powered Component Generation with ${FACTORY_STATS.codeReduction} Less Code!    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`))
}

// Print enhanced statistics
const printStats = () => {
  console.log(chalk.cyan('\n📊 Revolutionary UI Resources:'))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalFrameworks}+ JavaScript Frameworks`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalComponents.toLocaleString()}+ UI Components Cataloged`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalUILibraries}+ UI Component Libraries`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalIconLibraries}+ Icon Libraries (${FACTORY_STATS.totalIcons.toLocaleString()}+ icons)`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalDesignTools} Design Tool Integrations`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.aiProviders} AI Providers (OpenAI, Anthropic, Google, Mistral)`))
  console.log(chalk.gray(`   • ${FACTORY_STATS.totalPackages}+ Total Packages Available\n`))
}

// Initialize CLI components
async function initializeCLI() {
  const authManager = new AuthManager()
  const configManager = new ConfigManager()
  const telemetry = new TelemetryManager()
  const updateChecker = new UpdateChecker()

  // Check for updates
  await updateChecker.checkForUpdates(VERSION)

  return { authManager, configManager, telemetry }
}

// Main program configuration
const program = new Command()

program
  .name('revolutionary-ui')
  .description('Revolutionary UI v3.0 - AI-Powered Component Generation')
  .version(VERSION)
  .hook('preAction', async () => {
    // Initialize CLI components before any command
    const { telemetry } = await initializeCLI()
    await telemetry.trackCommand(process.argv.slice(2))
  })

// Auth commands (login, logout, register, whoami)
program
  .command('login')
  .description('Login to Revolutionary UI')
  .option('-e, --email <email>', 'Email address')
  .option('-p, --password <password>', 'Password (not recommended in CLI)')
  .action(async (options) => {
    printBanner()
    const auth = new AuthCommands()
    await auth.login(options)
  })

program
  .command('register')
  .description('Register a new Revolutionary UI account')
  .option('-e, --email <email>', 'Email address')
  .option('-n, --name <name>', 'Full name')
  .option('-c, --company <company>', 'Company name (optional)')
  .action(async (options) => {
    printBanner()
    const auth = new AuthCommands()
    await auth.register(options)
  })

program
  .command('logout')
  .description('Logout from Revolutionary UI')
  .action(async () => {
    const auth = new AuthCommands()
    await auth.logout()
  })

program
  .command('whoami')
  .description('Display current logged in user')
  .action(async () => {
    const auth = new AuthCommands()
    await auth.whoami()
  })

// Enhanced analyze command with AI insights
program
  .command('analyze')
  .alias('a')
  .description('Analyze your project with AI-powered insights')
  .option('-d, --detailed', 'Show detailed analysis')
  .option('-j, --json', 'Output as JSON')
  .option('-o, --output <file>', 'Save analysis to file')
  .option('--no-ai', 'Skip AI-powered analysis')
  .option('--catalog', 'Include component catalog suggestions')
  .action(async (options) => {
    printBanner()
    const analyze = new AnalyzeCommand()
    await analyze.execute(options)
  })

// AI-powered generate command
program
  .command('generate [type]')
  .alias('g')
  .description('Generate components with AI assistance')
  .option('-p, --prompt <prompt>', 'Natural language prompt for AI')
  .option('--ai <provider>', 'AI provider (openai, anthropic, google, mistral)')
  .option('-f, --framework <framework>', 'Target framework')
  .option('-s, --style <style>', 'Styling system (tailwind, css, styled-components)')
  .option('-o, --output <path>', 'Output directory')
  .option('--stream', 'Stream AI responses in real-time')
  .option('--variations <count>', 'Generate multiple variations', parseInt)
  .action(async (type, options) => {
    printBanner()
    const generate = new GenerateCommand()
    await generate.execute(type, options)
  })

// Component catalog commands
program
  .command('catalog')
  .alias('cat')
  .description('Browse and search the UI component catalog')
  .option('-s, --search <query>', 'Search components')
  .option('-f, --framework <framework>', 'Filter by framework')
  .option('-c, --category <category>', 'Filter by category')
  .option('--stars <min>', 'Minimum GitHub stars', parseInt)
  .option('--limit <count>', 'Number of results', parseInt)
  .action(async (options) => {
    printBanner()
    const catalog = new CatalogCommand()
    await catalog.browse(options)
  })

program
  .command('catalog:info <component>')
  .description('Get detailed information about a component')
  .action(async (component) => {
    const catalog = new CatalogCommand()
    await catalog.info(component)
  })

// Marketplace commands
program
  .command('marketplace')
  .alias('market')
  .description('Browse the Revolutionary UI marketplace')
  .option('-s, --search <query>', 'Search marketplace')
  .option('--premium', 'Show only premium components')
  .option('--free', 'Show only free components')
  .action(async (options) => {
    printBanner()
    const marketplace = new MarketplaceCommand()
    await marketplace.browse(options)
  })

program
  .command('purchase <component>')
  .description('Purchase a premium component')
  .action(async (component) => {
    const marketplace = new MarketplaceCommand()
    await marketplace.purchase(component)
  })

program
  .command('publish')
  .description('Publish your component to the marketplace')
  .option('-n, --name <name>', 'Component name')
  .option('-d, --description <desc>', 'Component description')
  .option('-p, --price <price>', 'Price (0 for free)', parseFloat)
  .action(async (options) => {
    const marketplace = new MarketplaceCommand()
    await marketplace.publish(options)
  })

// Monitoring commands
program
  .command('monitor')
  .alias('m')
  .description('Monitor parallel Claude Code sessions')
  .option('start', 'Start monitoring')
  .option('stop', 'Stop monitoring')
  .option('status', 'Check monitoring status')
  .option('--interval <ms>', 'Check interval in milliseconds', parseInt)
  .action(async (options) => {
    const monitor = new MonitorCommand()
    await monitor.execute(options)
  })

program
  .command('health')
  .description('Check project health and monitoring status')
  .action(async () => {
    const monitor = new MonitorCommand()
    await monitor.health()
  })

// Team collaboration commands
program
  .command('team:create <name>')
  .description('Create a new team')
  .action(async (name) => {
    const team = new TeamCommand()
    await team.create(name)
  })

program
  .command('team:invite <email>')
  .description('Invite a member to your team')
  .option('-r, --role <role>', 'Member role (admin, developer, viewer)')
  .action(async (email, options) => {
    const team = new TeamCommand()
    await team.invite(email, options.role)
  })

program
  .command('team:list')
  .description('List team members')
  .action(async () => {
    const team = new TeamCommand()
    await team.list()
  })

// Cloud sync commands
program
  .command('cloud:push')
  .description('Push components to cloud')
  .option('--force', 'Force push, overwriting cloud version')
  .action(async (options) => {
    const cloud = new CloudCommand()
    await cloud.push(options)
  })

program
  .command('cloud:pull')
  .description('Pull components from cloud')
  .option('--merge', 'Merge with local changes')
  .action(async (options) => {
    const cloud = new CloudCommand()
    await cloud.pull(options)
  })

program
  .command('cloud:status')
  .description('Check cloud sync status')
  .action(async () => {
    const cloud = new CloudCommand()
    await cloud.status()
  })

// Configuration commands
program
  .command('config')
  .description('Manage Revolutionary UI configuration')
  .option('-l, --list', 'List all configuration')
  .option('-g, --get <key>', 'Get configuration value')
  .option('-s, --set <key=value>', 'Set configuration value')
  .option('--reset', 'Reset to default configuration')
  .action(async (options) => {
    const config = new ConfigCommand()
    await config.execute(options)
  })

// Enhanced setup command
program
  .command('setup')
  .alias('init')
  .description('Set up Revolutionary UI for your project')
  .option('-i, --interactive', 'Run in interactive mode (default)', true)
  .option('-a, --auto', 'Run with recommended settings')
  .option('--with-ai', 'Include AI provider setup')
  .option('--with-marketplace', 'Include marketplace integration')
  .option('--with-monitoring', 'Include monitoring setup')
  .action(async (options) => {
    printBanner()
    const setup = new SetupCommand()
    await setup.execute(options)
  })

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    printBanner()
    console.log(chalk.cyan('🚀 Starting Revolutionary UI Interactive Mode...\n'))
    
    // Interactive menu loop
    let exit = false
    while (!exit) {
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🔍 Analyze Project', value: 'analyze' },
          { name: '🤖 Generate Component with AI', value: 'generate' },
          { name: '📚 Browse Component Catalog', value: 'catalog' },
          { name: '🛍️  Visit Marketplace', value: 'marketplace' },
          { name: '📊 Check Monitoring Status', value: 'monitor' },
          { name: '👥 Manage Team', value: 'team' },
          { name: '☁️  Cloud Sync', value: 'cloud' },
          { name: '⚙️  Configuration', value: 'config' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }])

      switch (action) {
        case 'analyze':
          const analyze = new AnalyzeCommand()
          await analyze.executeInteractive()
          break
        case 'generate':
          const generate = new GenerateCommand()
          await generate.executeInteractive()
          break
        case 'catalog':
          const catalog = new CatalogCommand()
          await catalog.browseInteractive()
          break
        case 'marketplace':
          const marketplace = new MarketplaceCommand()
          await marketplace.browseInteractive()
          break
        case 'monitor':
          const monitor = new MonitorCommand()
          await monitor.executeInteractive()
          break
        case 'team':
          const team = new TeamCommand()
          await team.executeInteractive()
          break
        case 'cloud':
          const cloud = new CloudCommand()
          await cloud.executeInteractive()
          break
        case 'config':
          const config = new ConfigCommand()
          await config.executeInteractive()
          break
        case 'exit':
          exit = true
          break
      }

      if (!exit) {
        console.log() // Add spacing between actions
      }
    }

    console.log(chalk.cyan('\n👋 Thanks for using Revolutionary UI!\n'))
  })

// Info command with v3.0 features
program
  .command('info')
  .description('Show information about Revolutionary UI v3.0')
  .action(() => {
    printBanner()
    printStats()
    
    console.log(chalk.bold('\n🚀 What\'s New in v3.0?\n'))
    console.log('  • 🤖 AI-Powered Component Generation (GPT-4, Claude 3, Gemini, Mistral)')
    console.log('  • 📚 Component Catalog with 10,000+ components')
    console.log('  • 🛍️  Full Marketplace with e-commerce capabilities')
    console.log('  • 👤 User Authentication & Team Collaboration')
    console.log('  • ☁️  Cloud Sync across devices')
    console.log('  • 📊 Parallel Session Monitoring for Claude Code')
    console.log('  • 🎨 Visual Component Preview')
    console.log('  • 🔄 Framework Transpilation')
    console.log('  • 📈 Advanced Analytics & Metrics\n')
    
    console.log(chalk.bold('✨ Key Features:\n'))
    console.log('  • Write 60-95% less code with factory patterns')
    console.log('  • Support for 50+ frameworks and libraries')
    console.log('  • Real-time AI streaming responses')
    console.log('  • Comprehensive project analysis')
    console.log('  • Secure payment processing with Stripe')
    console.log('  • Private component registry')
    console.log('  • Team workspace management')
    console.log('  • Automated setup and configuration\n')
    
    console.log(chalk.bold('📚 Resources:\n'))
    console.log('  • Website: https://revolutionary-ui.com')
    console.log('  • Documentation: https://revolutionary-ui.com/docs')
    console.log('  • GitHub: https://github.com/revolutionary-ui/factory')
    console.log('  • Discord: https://discord.gg/revolutionary-ui')
    console.log('  • Support: support@revolutionary-ui.com\n')
  })

// Stats command
program
  .command('stats')
  .description('Show your Revolutionary UI usage statistics')
  .option('--detailed', 'Show detailed statistics')
  .action(async (options) => {
    const authManager = new AuthManager()
    const user = await authManager.getCurrentUser()
    
    if (!user) {
      console.log(chalk.yellow('Please login to view your statistics'))
      return
    }
    
    console.log(chalk.bold.cyan('\n📊 Your Revolutionary UI Statistics:\n'))
    console.log(`  • Components Generated: ${user.stats?.componentsGenerated || 0}`)
    console.log(`  • Code Lines Saved: ${user.stats?.codeLinesReduced || 0}`)
    console.log(`  • Time Saved: ${user.stats?.timeSaved || '0 hours'}`)
    console.log(`  • Marketplace Purchases: ${user.stats?.purchases || 0}`)
    console.log(`  • Components Published: ${user.stats?.published || 0}`)
    
    if (options.detailed) {
      console.log(chalk.cyan('\n📈 Detailed Metrics:'))
      console.log(`  • Average Code Reduction: ${user.stats?.avgReduction || '0%'}`)
      console.log(`  • Most Used Framework: ${user.stats?.topFramework || 'N/A'}`)
      console.log(`  • AI Queries: ${user.stats?.aiQueries || 0}`)
      console.log(`  • Team Members: ${user.stats?.teamMembers || 0}`)
    }
  })

// Version check command
program
  .command('update')
  .description('Check for Revolutionary UI updates')
  .action(async () => {
    const updateChecker = new UpdateChecker()
    await updateChecker.checkAndPromptUpdate(VERSION)
  })

// Parse arguments
program.parse(process.argv)

// Show help if no command provided
if (!process.argv.slice(2).length) {
  printBanner()
  program.outputHelp()
  
  // Show quick start tips
  console.log(chalk.cyan('\n🚀 Quick Start:\n'))
  console.log('  1. Register or login: ' + chalk.green('revolutionary-ui register'))
  console.log('  2. Analyze your project: ' + chalk.green('revolutionary-ui analyze'))
  console.log('  3. Generate with AI: ' + chalk.green('revolutionary-ui generate --ai "Create a pricing table"'))
  console.log('  4. Browse catalog: ' + chalk.green('revolutionary-ui catalog'))
  console.log('  5. Start monitoring: ' + chalk.green('revolutionary-ui monitor start'))
  console.log()
}

// Handle errors gracefully
process.on('unhandledRejection', (error: any) => {
  console.error(chalk.red('\n❌ Unexpected error:'), error.message)
  if (process.env.DEBUG) {
    console.error(error.stack)
  }
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Revolutionary UI CLI interrupted'))
  process.exit(0)
})