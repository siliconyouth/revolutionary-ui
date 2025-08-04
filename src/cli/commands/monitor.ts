import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

export class MonitorCommand {
  private monitorScriptPath: string
  private monitorProcess: any = null

  constructor() {
    // Path to the enhanced monitoring script
    this.monitorScriptPath = path.join(process.cwd(), '.enhanced-session-monitor.js')
  }

  async execute(options: any) {
    if (options.start) {
      await this.start(options)
    } else if (options.stop) {
      await this.stop()
    } else if (options.status) {
      await this.status()
    } else {
      await this.executeInteractive()
    }
  }

  async executeInteractive() {
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Monitoring actions:',
      choices: [
        { name: '▶️  Start Monitoring', value: 'start' },
        { name: '⏹️  Stop Monitoring', value: 'stop' },
        { name: '📊 Check Status', value: 'status' },
        { name: '🏥 Health Check', value: 'health' },
        { name: '📋 View Recent Changes', value: 'changes' },
        { name: '⚙️  Configure Monitoring', value: 'configure' },
        { name: '🔙 Back', value: 'back' }
      ]
    }])

    if (action === 'back') return

    switch (action) {
      case 'start':
        await this.start({})
        break
      case 'stop':
        await this.stop()
        break
      case 'status':
        await this.status()
        break
      case 'health':
        await this.health()
        break
      case 'changes':
        await this.showRecentChanges()
        break
      case 'configure':
        await this.configure()
        break
    }
  }

  async start(options: { interval?: number }) {
    try {
      // Check if monitor script exists
      const scriptExists = await this.checkMonitorScript()
      if (!scriptExists) {
        console.error(chalk.red('❌ Monitoring script not found'))
        console.log(chalk.yellow('💡 Run setup-monitoring.sh to install the monitoring system'))
        return
      }

      console.log(chalk.cyan('\n🚀 Starting Revolutionary UI Session Monitor...\n'))

      const spinner = ora('Initializing monitoring system...').start()

      // Set environment variables
      const env = { ...process.env }
      if (options.interval) {
        env.CHECK_INTERVAL = options.interval.toString()
      }

      // Start the monitoring process
      this.monitorProcess = spawn('node', [this.monitorScriptPath, 'start'], {
        env,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      // Handle output
      this.monitorProcess.stdout.on('data', (data: Buffer) => {
        spinner.stop()
        const output = data.toString().trim()
        if (output.includes('ERROR')) {
          console.error(chalk.red(output))
        } else if (output.includes('WARNING')) {
          console.warn(chalk.yellow(output))
        } else if (output.includes('CRITICAL')) {
          console.error(chalk.red.bold(output))
        } else {
          console.log(output)
        }
      })

      this.monitorProcess.stderr.on('data', (data: Buffer) => {
        spinner.stop()
        console.error(chalk.red(data.toString()))
      })

      // Give it a moment to start
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      spinner.succeed(chalk.green('✅ Monitoring system started successfully!'))
      
      console.log(chalk.gray('\nMonitoring:'))
      console.log(chalk.gray('  • 11 critical files'))
      console.log(chalk.gray('  • 6 key directories'))
      console.log(chalk.gray(`  • Check interval: ${options.interval || 30000}ms`))
      console.log(chalk.gray('\nAlerts will appear here when changes are detected.'))
      console.log(chalk.yellow('\nPress Ctrl+C to return to CLI (monitoring continues in background)'))

      // Keep process alive to show alerts
      process.stdin.resume()
      process.on('SIGINT', () => {
        console.log(chalk.cyan('\n\n👋 Returning to CLI. Monitoring continues in background.'))
        console.log(chalk.gray('Use "revolutionary-ui monitor stop" to stop monitoring.'))
        process.exit(0)
      })

    } catch (error: any) {
      console.error(chalk.red(`❌ Failed to start monitoring: ${error.message}`))
    }
  }

  async stop() {
    try {
      const spinner = ora('Stopping monitoring system...').start()

      // Run stop command
      const stopProcess = spawn('node', [this.monitorScriptPath, 'stop'], {
        stdio: 'pipe'
      })

      await new Promise((resolve, reject) => {
        stopProcess.on('close', (code) => {
          if (code === 0) {
            spinner.succeed(chalk.green('✅ Monitoring system stopped'))
            resolve(true)
          } else {
            spinner.fail('Failed to stop monitoring')
            reject(new Error('Stop command failed'))
          }
        })
      })

    } catch (error: any) {
      console.error(chalk.red(`❌ Error stopping monitor: ${error.message}`))
    }
  }

  async status() {
    try {
      console.log(chalk.cyan('\n📊 Monitoring System Status\n'))

      const spinner = ora('Checking monitoring status...').start()

      // Get status from monitor
      const statusProcess = spawn('node', [this.monitorScriptPath, 'status', 'detailed'], {
        stdio: 'pipe'
      })

      let output = ''
      statusProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString()
      })

      await new Promise((resolve) => {
        statusProcess.on('close', () => {
          spinner.stop()
          
          try {
            const status = JSON.parse(output)
            
            // Display status
            console.log(chalk.bold('Monitoring: ') + (status.monitoring ? chalk.green('Active') : chalk.red('Inactive')))
            
            if (status.monitoring) {
              console.log(chalk.gray(`\nCheck Interval: ${status.options.checkInterval}ms`))
              console.log(chalk.gray(`Log Level: ${status.options.logLevel}`))
              console.log(chalk.gray(`Webhook Enabled: ${status.options.enableWebhook ? 'Yes' : 'No'}`))
            }

            // Show watched resources
            console.log(chalk.cyan('\n📁 Monitored Resources:'))
            console.log(chalk.gray(`  • Critical Files: ${status.criticalFiles.length}`))
            console.log(chalk.gray(`  • Directories: ${status.watchedDirectories.length}`))

            // Show recent alerts
            if (status.alertHistory && status.alertHistory.length > 0) {
              console.log(chalk.cyan('\n🔔 Recent Alerts:'))
              status.alertHistory.slice(0, 5).forEach((alert: any) => {
                const time = new Date(alert.timestamp).toLocaleTimeString()
                const severityColor = this.getSeverityColor(alert.severity)
                console.log(`  ${time} - ${severityColor(alert.severity)}: ${alert.message}`)
              })
            } else {
              console.log(chalk.gray('\n✨ No recent alerts'))
            }

            // Show baseline info
            if (status.baseline) {
              const baselineTime = new Date(status.baseline.timestamp).toLocaleString()
              console.log(chalk.gray(`\n📍 Baseline established: ${baselineTime}`))
              console.log(chalk.gray(`  • Git branch: ${status.baseline.git.branch}`))
              console.log(chalk.gray(`  • Uncommitted changes: ${status.baseline.git.uncommittedChanges.length}`))
            }

            resolve(true)
          } catch (error) {
            console.error(chalk.red('❌ Failed to parse monitor status'))
            resolve(false)
          }
        })
      })

    } catch (error: any) {
      console.error(chalk.red(`❌ Error checking status: ${error.message}`))
    }
  }

  async health() {
    try {
      console.log(chalk.cyan('\n🏥 Project Health Check\n'))

      const spinner = ora('Running health check...').start()

      // Get health status
      const healthProcess = spawn('node', [this.monitorScriptPath, 'health'], {
        stdio: 'pipe'
      })

      let output = ''
      healthProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString()
      })

      await new Promise((resolve) => {
        healthProcess.on('close', () => {
          spinner.stop()
          
          try {
            const health = JSON.parse(output)
            
            // Display overall health
            const healthColor = health.overall === 'healthy' ? chalk.green :
                              health.overall === 'warning' ? chalk.yellow :
                              chalk.red
            
            console.log(chalk.bold('Overall Health: ') + healthColor(health.overall.toUpperCase()))

            // Show issues
            if (health.issues && health.issues.length > 0) {
              console.log(chalk.yellow('\n⚠️  Issues:'))
              health.issues.forEach((issue: string) => {
                console.log(chalk.yellow(`  • ${issue}`))
              })
            }

            // Show recommendations
            if (health.recommendations && health.recommendations.length > 0) {
              console.log(chalk.cyan('\n💡 Recommendations:'))
              health.recommendations.forEach((rec: string) => {
                console.log(chalk.gray(`  • ${rec}`))
              })
            }

            // Show quick actions
            console.log(chalk.cyan('\n🎯 Quick Actions:'))
            console.log(chalk.gray('  • Run ' + chalk.green('revolutionary-ui monitor start') + ' to begin monitoring'))
            console.log(chalk.gray('  • Run ' + chalk.green('git status') + ' to review changes'))
            console.log(chalk.gray('  • Run ' + chalk.green('npm test') + ' to verify system integrity'))

            resolve(true)
          } catch (error) {
            console.error(chalk.red('❌ Failed to parse health status'))
            resolve(false)
          }
        })
      })

    } catch (error: any) {
      console.error(chalk.red(`❌ Error checking health: ${error.message}`))
    }
  }

  async showRecentChanges() {
    try {
      console.log(chalk.cyan('\n📋 Recent Changes Detected\n'))

      const spinner = ora('Checking for recent changes...').start()

      // Get recent changes
      const changesProcess = spawn('node', [this.monitorScriptPath, 'check'], {
        stdio: 'pipe'
      })

      let output = ''
      changesProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString()
      })

      await new Promise((resolve) => {
        changesProcess.on('close', () => {
          spinner.stop()
          
          try {
            const result = JSON.parse(output)
            
            if (!result.hasChanges) {
              console.log(chalk.green('✅ No changes detected since last check'))
            } else {
              console.log(chalk.yellow(`⚠️  ${result.details.length} changes detected`))
              
              if (result.criticalChanges) {
                console.log(chalk.red.bold('\n🚨 CRITICAL CHANGES REQUIRE IMMEDIATE ATTENTION'))
              }

              // Group changes by severity
              const grouped = result.details.reduce((acc: any, change: any) => {
                const severity = change.severity || 'info'
                if (!acc[severity]) acc[severity] = []
                acc[severity].push(change)
                return acc
              }, {})

              // Display by severity
              ['critical', 'high', 'medium', 'low'].forEach(severity => {
                if (grouped[severity] && grouped[severity].length > 0) {
                  const color = this.getSeverityColor(severity)
                  console.log(color(`\n${severity.toUpperCase()} (${grouped[severity].length}):`))
                  
                  grouped[severity].forEach((change: any) => {
                    console.log(color(`  • ${change.type}: ${change.message}`))
                  })
                }
              })

              // Show recommendations
              if (result.recommendations && result.recommendations.length > 0) {
                console.log(chalk.cyan('\n💡 Recommendations:'))
                result.recommendations.forEach((rec: string) => {
                  console.log(chalk.gray(`  • ${rec}`))
                })
              }
            }

            resolve(true)
          } catch (error) {
            console.error(chalk.red('❌ Failed to parse changes'))
            resolve(false)
          }
        })
      })

    } catch (error: any) {
      console.error(chalk.red(`❌ Error checking changes: ${error.message}`))
    }
  }

  async configure() {
    try {
      console.log(chalk.cyan('\n⚙️  Configure Monitoring System\n'))

      // Read current config
      const configPath = path.join(process.cwd(), '.monitoring-config.json')
      let currentConfig: any = {}
      
      try {
        const configContent = await fs.readFile(configPath, 'utf-8')
        currentConfig = JSON.parse(configContent).monitoring || {}
      } catch (error) {
        // Config doesn't exist yet
      }

      // Prompt for configuration
      const answers = await inquirer.prompt([
        {
          type: 'number',
          name: 'checkInterval',
          message: 'Check interval (milliseconds):',
          default: currentConfig.checkInterval || 30000,
          validate: (value: number) => value >= 5000 || 'Minimum interval is 5000ms'
        },
        {
          type: 'list',
          name: 'logLevel',
          message: 'Log level:',
          choices: ['debug', 'info', 'warn', 'error'],
          default: currentConfig.logLevel || 'info'
        },
        {
          type: 'confirm',
          name: 'enableWebhook',
          message: 'Enable webhook notifications?',
          default: currentConfig.enableWebhook || false
        }
      ])

      if (answers.enableWebhook) {
        const webhookAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'webhookUrl',
            message: 'Webhook URL:',
            default: currentConfig.webhookUrl || '',
            validate: (value: string) => {
              if (!value) return 'Webhook URL is required'
              try {
                new URL(value)
                return true
              } catch {
                return 'Please enter a valid URL'
              }
            }
          },
          {
            type: 'list',
            name: 'webhookType',
            message: 'Webhook type:',
            choices: ['slack', 'discord', 'custom'],
            default: 'custom'
          }
        ])
        
        Object.assign(answers, webhookAnswers)
      }

      // Update config file
      const fullConfig = {
        project: 'Revolutionary UI v3.0.0',
        version: '1.0.0',
        created: new Date().toISOString(),
        monitoring: {
          checkInterval: answers.checkInterval,
          logLevel: answers.logLevel,
          enableWebhook: answers.enableWebhook,
          webhookUrl: answers.webhookUrl || null,
          webhookType: answers.webhookType || null,
          criticalFiles: currentConfig.criticalFiles || [
            'CLAUDE.md',
            'CLAUDE_CONTEXT.md',
            'README.md',
            'CHANGELOG.md',
            'package.json',
            'marketplace-nextjs/package.json',
            '.env.local',
            '.env.sample',
            'prisma/schema.prisma',
            'marketplace-nextjs/prisma/schema.prisma',
            'tsconfig.json'
          ],
          watchedDirectories: currentConfig.watchedDirectories || [
            'src/ai/',
            'datasets/',
            'prisma/',
            'marketplace-nextjs/src/app/api/',
            'docs/',
            'scripts/'
          ]
        },
        recommendations: {
          claudeCode: {
            refreshContextOn: ['CLAUDE.md', 'CLAUDE_CONTEXT.md'],
            syncDatabaseOn: ['prisma/schema.prisma'],
            checkDependenciesOn: ['package.json'],
            reviewEnvironmentOn: ['.env.local', '.env.sample']
          }
        }
      }

      await fs.writeFile(configPath, JSON.stringify(fullConfig, null, 2), 'utf-8')
      
      console.log(chalk.green('\n✅ Configuration saved successfully!'))
      console.log(chalk.gray('\nRestart monitoring for changes to take effect.'))

    } catch (error: any) {
      console.error(chalk.red(`❌ Error configuring monitor: ${error.message}`))
    }
  }

  private async checkMonitorScript(): Promise<boolean> {
    try {
      await fs.access(this.monitorScriptPath)
      return true
    } catch {
      return false
    }
  }

  private getSeverityColor(severity: string) {
    switch (severity.toLowerCase()) {
      case 'critical':
        return chalk.red.bold
      case 'high':
        return chalk.red
      case 'medium':
        return chalk.yellow
      case 'low':
        return chalk.blue
      default:
        return chalk.gray
    }
  }
}