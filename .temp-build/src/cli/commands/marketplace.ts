import { Command } from 'commander'
import { MarketplaceManager } from '../features/marketplace-manager'
import { loadSessionConfig } from '../utils/config-manager'

export const marketplaceCommand = new Command('marketplace')
  .description('Browse and manage marketplace components')
  .action(async () => {
    const config = await loadSessionConfig()
    const manager = new MarketplaceManager(config)
    await manager.execute('browse', {})
  })

marketplaceCommand
  .command('browse')
  .description('Browse marketplace components')
  .action(async () => {
    const config = await loadSessionConfig()
    const manager = new MarketplaceManager(config)
    await manager.execute('browse', {})
  })

marketplaceCommand
  .command('publish')
  .description('Publish a component to marketplace')
  .action(async () => {
    const config = await loadSessionConfig()
    const manager = new MarketplaceManager(config)
    await manager.execute('publish', {})
  })

marketplaceCommand
  .command('purchases')
  .description('View your purchased components')
  .action(async () => {
    const config = await loadSessionConfig()
    const manager = new MarketplaceManager(config)
    await manager.execute('purchases', {})
  })

// Export class wrapper for compatibility
export class MarketplaceCommand {
  async execute(command: string, options: any): Promise<void> {
    const subCommand = marketplaceCommand.commands.find(cmd => cmd.name() === command)
    if (subCommand) {
      await subCommand.parseAsync(['', '', ...Object.entries(options).flatMap(([k, v]) => [`--${k}`, String(v)])])
    } else {
      await marketplaceCommand.parseAsync(['', '', command])
    }
  }
}