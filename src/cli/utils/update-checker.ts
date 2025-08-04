import chalk from 'chalk'
import { APIClient } from './api-client'
import semver from 'semver'
import ora from 'ora'

export class UpdateChecker {
  private apiClient: APIClient
  private lastCheckKey = 'lastUpdateCheck'
  private checkInterval = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    this.apiClient = new APIClient()
  }

  async checkForUpdates(currentVersion: string): Promise<void> {
    try {
      // Check if we should check for updates
      if (!this.shouldCheckForUpdates()) {
        return
      }

      const latestVersion = await this.getLatestVersion()
      
      if (latestVersion && semver.gt(latestVersion, currentVersion)) {
        this.displayUpdateNotification(currentVersion, latestVersion)
      }

      // Update last check time
      this.updateLastCheckTime()
    } catch (error) {
      // Silent fail - don't interrupt user flow
    }
  }

  async checkAndPromptUpdate(currentVersion: string): Promise<void> {
    const spinner = ora('Checking for updates...').start()

    try {
      const latestVersion = await this.getLatestVersion()
      
      if (!latestVersion) {
        spinner.fail('Failed to check for updates')
        return
      }

      if (semver.gt(latestVersion, currentVersion)) {
        spinner.succeed(`Update available: ${latestVersion}`)
        
        console.log(chalk.cyan('\n📦 Update Information:\n'))
        console.log(`  Current version: ${chalk.red(currentVersion)}`)
        console.log(`  Latest version: ${chalk.green(latestVersion)}`)
        console.log(`  Type: ${this.getUpdateType(currentVersion, latestVersion)}`)
        
        // Get changelog
        const changelog = await this.getChangelog(currentVersion, latestVersion)
        if (changelog) {
          console.log(chalk.cyan('\n📝 What\'s New:\n'))
          console.log(changelog)
        }

        console.log(chalk.cyan('\n📥 Update Command:\n'))
        console.log(chalk.green('  npm update -g @vladimirdukelic/revolutionary-ui'))
        console.log(chalk.gray('\n  Or using npx:'))
        console.log(chalk.green('  npx @vladimirdukelic/revolutionary-ui@latest'))
        
      } else {
        spinner.succeed('You are on the latest version!')
        console.log(chalk.green(`\n✅ Revolutionary UI v${currentVersion} is up to date`))
      }
    } catch (error: any) {
      spinner.fail('Failed to check for updates')
      console.error(chalk.red(`\n❌ Error: ${error.message}`))
    }
  }

  private async getLatestVersion(): Promise<string | null> {
    try {
      const response = await this.apiClient.get('/cli/latest-version')
      return response.data.version
    } catch {
      // Try npm registry as fallback
      try {
        const response = await fetch('https://registry.npmjs.org/@vladimirdukelic/revolutionary-ui/latest')
        const data = await response.json()
        return data.version
      } catch {
        return null
      }
    }
  }

  private async getChangelog(currentVersion: string, latestVersion: string): Promise<string | null> {
    try {
      const response = await this.apiClient.get('/cli/changelog', {
        params: { from: currentVersion, to: latestVersion }
      })
      return response.data.changelog
    } catch {
      return null
    }
  }

  private shouldCheckForUpdates(): boolean {
    try {
      const lastCheck = this.getLastCheckTime()
      if (!lastCheck) return true
      
      const timeSinceLastCheck = Date.now() - lastCheck
      return timeSinceLastCheck > this.checkInterval
    } catch {
      return true
    }
  }

  private getLastCheckTime(): number | null {
    try {
      if (typeof globalThis.localStorage !== 'undefined') {
        const stored = globalThis.localStorage.getItem(this.lastCheckKey)
        return stored ? parseInt(stored, 10) : null
      }
      return null
    } catch {
      return null
    }
  }

  private updateLastCheckTime(): void {
    try {
      if (typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.setItem(this.lastCheckKey, Date.now().toString())
      }
    } catch {
      // Ignore
    }
  }

  private displayUpdateNotification(currentVersion: string, latestVersion: string): void {
    console.log(chalk.yellow('\n╔════════════════════════════════════════════════════════╗'))
    console.log(chalk.yellow('║                                                        ║'))
    console.log(chalk.yellow('║  🎉 Revolutionary UI Update Available!                 ║'))
    console.log(chalk.yellow('║                                                        ║'))
    console.log(chalk.yellow(`║  Current: v${currentVersion.padEnd(8)} → Latest: v${latestVersion.padEnd(8)}     ║`))
    console.log(chalk.yellow('║                                                        ║'))
    console.log(chalk.yellow('║  Run: npm update -g @vladimirdukelic/revolutionary-ui  ║'))
    console.log(chalk.yellow('║                                                        ║'))
    console.log(chalk.yellow('╚════════════════════════════════════════════════════════╝\n'))
  }

  private getUpdateType(currentVersion: string, latestVersion: string): string {
    const current = semver.parse(currentVersion)
    const latest = semver.parse(latestVersion)
    
    if (!current || !latest) return 'Unknown'
    
    if (latest.major > current.major) {
      return chalk.red('Major Update (Breaking Changes)')
    } else if (latest.minor > current.minor) {
      return chalk.yellow('Minor Update (New Features)')
    } else {
      return chalk.green('Patch Update (Bug Fixes)')
    }
  }
}