#!/usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import { RevolutionaryCLI } from './revolutionary-cli'
import { SessionManager } from './core/session-manager'
import { FeatureManager } from './core/feature-manager'
import packageJson from '../../package.json' with { type: 'json' }

async function main() {
  program
    .name('rui')
    .description('Revolutionary UI - AI-Powered Component Generation')
    .version(packageJson.version)
    .option('-i, --interactive', 'Run in interactive mode')
    .option('--no-wizard', 'Skip wizard for direct commands')

  // Create new project command
  program
    .command('create [project-name]')
    .alias('new')
    .description('Create a new Revolutionary UI project')
    .action(async (projectName) => {
      const { CreateAppCLI } = await import('./create-app')
      const cli = new CreateAppCLI()
      await cli.create(projectName)
    })

  // Main wizard command (default)
  program
    .command('start', { isDefault: true })
    .description('Start Revolutionary UI wizard')
    .action(async () => {
      const cli = new RevolutionaryCLI()
      await cli.start()
    })

  // Quick commands for experienced users
  program
    .command('generate [type]')
    .alias('g')
    .description('Generate components quickly')
    .option('-p, --prompt <prompt>', 'Natural language prompt')
    .option('--ai <provider>', 'AI provider')
    .action(async (type, options) => {
      if (program.opts().interactive || !type) {
        const cli = new RevolutionaryCLI()
        await cli.quickGenerate(type, options)
      } else {
        // Direct generation
        await quickGenerate(type, options)
      }
    })

  program
    .command('catalog [action]')
    .alias('c')
    .description('Browse component catalog')
    .action(async (action) => {
      const featureManager = await getFeatureManager()
      await featureManager.runFeature('catalog', action || 'browse')
    })

  program
    .command('analyze')
    .alias('a')
    .description('Analyze current project')
    .option('--smart', 'Use smart analyzer (recommended)')
    .action(async (options) => {
      const cli = new RevolutionaryCLI()
      await cli.analyzeOnly(options)
    })

  program
    .command('monitor [action]')
    .alias('m')
    .description('Manage session monitoring')
    .action(async (action) => {
      const featureManager = await getFeatureManager()
      await featureManager.runFeature('monitoring', action || 'status')
    })

  program
    .command('config [section]')
    .description('Modify configuration')
    .action(async (section) => {
      const cli = new RevolutionaryCLI()
      await cli.modifyConfig(section)
    })

  program
    .command('login')
    .description('Login to Revolutionary UI')
    .action(async () => {
      const cli = new RevolutionaryCLI()
      await cli.login()
    })

  program
    .command('logout')
    .description('Logout from Revolutionary UI')
    .action(async () => {
      const cli = new RevolutionaryCLI()
      await cli.logout()
    })

  program
    .command('help [command]')
    .description('Show help for a command')
    .action((command) => {
      if (command) {
        const cmd = program.commands.find(c => c.name() === command)
        if (cmd) {
          cmd.help()
        } else {
          console.log(chalk.red(`Unknown command: ${command}`))
        }
      } else {
        program.help()
      }
    })

  // Parse arguments
  await program.parseAsync(process.argv)

  // If no command specified and not in wizard mode, show interactive prompt
  if (process.argv.length === 2) {
    const cli = new RevolutionaryCLI()
    await cli.start()
  }
}

async function getFeatureManager(): Promise<FeatureManager> {
  const sessionManager = new SessionManager()
  const config = await sessionManager.loadConfig()
  
  if (!config) {
    console.log(chalk.yellow('No configuration found. Please run setup first.'))
    console.log(chalk.cyan('Run: rui'))
    process.exit(1)
  }

  return new FeatureManager()
}

async function quickGenerate(type: string, options: any): Promise<void> {
  const featureManager = await getFeatureManager()
  await featureManager.runFeature('ai', 'generate', { type, ...options })
}

// Error handling
process.on('unhandledRejection', (reason: any) => {
  console.error(chalk.red('\n❌ Error:'), reason.message || reason)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye!'))
  process.exit(0)
})

// Run CLI
main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})