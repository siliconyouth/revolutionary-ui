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