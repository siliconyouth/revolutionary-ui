import { Command } from 'commander'
import { loadSessionConfig, saveSessionConfig } from '../utils/config-manager'
import chalk from 'chalk'
import inquirer from 'inquirer'

export const configCommand = new Command('config')
  .description('Manage Revolutionary UI configuration')
  .action(async () => {
    const config = await loadSessionConfig()
    
    console.log(chalk.cyan('⚙️  Revolutionary UI Configuration\n'))
    
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View current configuration',
        'Update framework preference',
        'Update AI provider',
        'Reset configuration'
      ]
    }])
    
    switch (action) {
      case 'View current configuration':
        console.log(JSON.stringify(config, null, 2))
        break
        
      case 'Update framework preference':
        const { framework } = await inquirer.prompt([{
          type: 'list',
          name: 'framework',
          message: 'Select preferred framework:',
          choices: ['React', 'Vue', 'Angular', 'Svelte', 'Solid']
        }])
        config.preferences = { ...config.preferences, framework }
        await saveSessionConfig(config)
        console.log(chalk.green('✓ Framework preference updated'))
        break
        
      case 'Update AI provider':
        const { provider } = await inquirer.prompt([{
          type: 'list',
          name: 'provider',
          message: 'Select AI provider:',
          choices: ['OpenAI', 'Anthropic', 'Google', 'Groq', 'Mistral']
        }])
        config.aiProvider = provider
        await saveSessionConfig(config)
        console.log(chalk.green('✓ AI provider updated'))
        break
        
      case 'Reset configuration':
        // Reset to defaults
        await saveSessionConfig({
          sessionId: config.sessionId,
          preferences: {},
          features: {},
          history: []
        })
        console.log(chalk.green('✓ Configuration reset'))
        break
    }
  })

// Export class wrapper for compatibility
export class ConfigCommand {
  async execute(options: any = {}): Promise<void> {
    await configCommand.parseAsync(['', ''])
  }
}