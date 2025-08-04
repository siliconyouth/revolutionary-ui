import { Command } from 'commander'
import { TeamManager } from '../features/team-manager'
import { loadSessionConfig } from '../utils/config-manager'

export const teamCommand = new Command('team')
  .description('Manage team collaboration')
  .action(async () => {
    const config = await loadSessionConfig()
    const manager = new TeamManager(config)
    await manager.execute('manage', {})
  })

teamCommand
  .command('create')
  .description('Create a new team')
  .action(async () => {
    const config = await loadSessionConfig()
    const manager = new TeamManager(config)
    await manager.setupTeam()
  })

teamCommand
  .command('share')
  .description('Share a component with your team')
  .option('-p, --path <path>', 'Component path')
  .action(async (options) => {
    const config = await loadSessionConfig()
    const manager = new TeamManager(config)
    await manager.execute('share', options)
  })

teamCommand
  .command('invite')
  .description('Invite members to your team')
  .action(async () => {
    const config = await loadSessionConfig()
    const manager = new TeamManager(config)
    await manager.execute('invite', {})
  })

// Export class wrapper for compatibility
export class TeamCommand {
  async execute(command: string, options: any): Promise<void> {
    const subCommand = teamCommand.commands.find(cmd => cmd.name() === command)
    if (subCommand) {
      await subCommand.parseAsync(['', '', ...Object.entries(options).flatMap(([k, v]) => [`--${k}`, String(v)])])
    } else {
      await teamCommand.parseAsync(['', '', command])
    }
  }
}