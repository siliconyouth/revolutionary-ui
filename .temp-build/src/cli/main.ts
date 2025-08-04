#!/usr/bin/env node

/**
 * Revolutionary UI v3.2.0 - Main CLI Entry Point
 * Unified command-line interface with all features
 */

import { Command } from 'commander'
import chalk from 'chalk'
import { UnifiedCLI } from './unified-cli'
import packageJson from '../../package.json' with { type: 'json' }

// Direct command imports for non-interactive mode
import { AuthCommands } from './commands/auth'
import { analyzeCommand } from './commands/analyze'
import { GenerateCommand } from './commands/generate'
import { CatalogCommand } from './commands/catalog'
import { marketplaceCommand } from './commands/marketplace'
import { MonitorCommand } from './commands/monitor'
import { setupCommand } from './commands/setup'
import { configCommand } from './commands/config'
import { teamCommand } from './commands/team'
import { cloudCommand } from './commands/cloud'

const program = new Command()

// Configure program
program
  .name('revolutionary-ui')
  .description('Revolutionary UI Factory System - Generate UI components with 60-95% less code')
  .version(packageJson.version)
  .option('-i, --interactive', 'Run in interactive mode (default)', true)
  .option('-d, --direct', 'Run direct commands without wizard')
  .option('--no-banner', 'Skip the banner display')
  .option('--no-telemetry', 'Disable anonymous usage statistics')

// Default action - interactive wizard
program
  .action(async (options) => {
    if (!options.direct) {
      const cli = new UnifiedCLI()
      await cli.start()
    } else {
      program.help()
    }
  })

// Create/new project command
program
  .command('create [project-name]')
  .alias('new')
  .description('Create a new Revolutionary UI project')
  .option('-t, --template <template>', 'Project template to use')
  .option('-f, --framework <framework>', 'Target framework (react, vue, angular, svelte)')
  .action(async (projectName, options) => {
    if (program.opts().direct) {
      const { CreateAppCLI } = await import('./create-app')
      const cli = new CreateAppCLI()
      await cli.create(projectName)
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Analyze command
program
  .command('analyze [path]')
  .description('Analyze a project for Revolutionary UI compatibility')
  .option('-o, --output <path>', 'Output path for analysis report')
  .option('--ai', 'Include AI-powered recommendations')
  .action(async (path, options) => {
    if (program.opts().direct) {
      await analyzeCommand(path || process.cwd(), options)
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Generate command
program
  .command('generate [type]')
  .alias('g')
  .description('Generate UI components')
  .option('-p, --prompt <prompt>', 'Natural language prompt for AI generation')
  .option('-n, --name <name>', 'Component name')
  .option('-f, --framework <framework>', 'Target framework')
  .option('--factory <factory>', 'Use specific factory')
  .action(async (type, options) => {
    if (program.opts().direct && (type || options.prompt)) {
      const generateCmd = new GenerateCommand()
      if (options.prompt) {
        await generateCmd.generateFromPrompt(options.prompt)
      } else {
        await generateCmd.generateComponent(type, options)
      }
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Catalog command
program
  .command('catalog [action]')
  .description('Browse and search the component catalog')
  .option('-s, --search <query>', 'Search query')
  .option('-c, --category <category>', 'Filter by category')
  .option('-f, --framework <framework>', 'Filter by framework')
  .action(async (action, options) => {
    if (program.opts().direct && action) {
      const catalogCmd = new CatalogCommand()
      await catalogCmd.execute(action, options)
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Marketplace command
program
  .command('marketplace [action]')
  .alias('market')
  .description('Access the Revolutionary UI marketplace')
  .action(async (action, options) => {
    if (program.opts().direct && action) {
      await marketplaceCommand(action, options)
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Auth command
program
  .command('auth [action]')
  .description('Authentication management')
  .action(async (action) => {
    if (program.opts().direct && action) {
      const authCmd = new AuthCommands()
      switch (action) {
        case 'login':
          await authCmd.login()
          break
        case 'logout':
          await authCmd.logout()
          break
        case 'register':
          await authCmd.register()
          break
        case 'status':
          await authCmd.status()
          break
        default:
          console.log(chalk.red(`Unknown auth action: ${action}`))
          console.log('Available actions: login, logout, register, status')
      }
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Team command
program
  .command('team [action]')
  .description('Team collaboration features')
  .action(async (action, options) => {
    if (program.opts().direct && action) {
      await teamCommand(action, options)
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Cloud command
program
  .command('cloud [action]')
  .description('Cloud sync and storage')
  .action(async (action, options) => {
    if (program.opts().direct && action) {
      await cloudCommand(action, options)
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Monitor command
program
  .command('monitor [action]')
  .description('Real-time monitoring and analytics')
  .option('-m, --metrics <metrics>', 'Specific metrics to monitor')
  .action(async (action, options) => {
    if (program.opts().direct && action) {
      const monitorCmd = new MonitorCommand()
      await monitorCmd.execute(action, options)
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Config command
program
  .command('config [action]')
  .description('Configuration management')
  .option('-k, --key <key>', 'Configuration key')
  .option('-v, --value <value>', 'Configuration value')
  .action(async (action, options) => {
    if (program.opts().direct && action) {
      await configCommand(action, options)
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Setup command
program
  .command('setup')
  .description('Setup Revolutionary UI in current project')
  .option('--force', 'Force setup even if already configured')
  .action(async (options) => {
    if (program.opts().direct) {
      await setupCommand(options)
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Init command (alias for setup)
program
  .command('init')
  .description('Initialize Revolutionary UI in current project')
  .action(async () => {
    if (program.opts().direct) {
      await setupCommand({})
    } else {
      const cli = new UnifiedCLI()
      await cli.start()
    }
  })

// Version command with extended info
program
  .command('version')
  .alias('v')
  .description('Show version and system information')
  .action(() => {
    console.log(chalk.bold('\nRevolutionary UI Factory System'))
    console.log(chalk.gray('────────────────────────────────'))
    console.log(`Version: ${chalk.green(packageJson.version)}`)
    console.log(`Node: ${chalk.green(process.version)}`)
    console.log(`Platform: ${chalk.green(process.platform)}`)
    console.log(`Architecture: ${chalk.green(process.arch)}`)
    console.log()
  })

// Parse arguments
program.parse(process.argv)

// If no arguments, show interactive wizard
if (process.argv.length === 2) {
  const cli = new UnifiedCLI()
  cli.start().catch(error => {
    console.error(chalk.red('Error:'), error)
    process.exit(1)
  })
}