import { AuthManager } from './auth-manager'
import { ConfigManager } from './config-manager'
import { APIClient } from './api-client'
import crypto from 'crypto'

export class TelemetryManager {
  private authManager: AuthManager
  private configManager: ConfigManager
  private apiClient: APIClient
  private sessionId: string
  private enabled: boolean = true

  constructor() {
    this.authManager = new AuthManager()
    this.configManager = new ConfigManager()
    this.apiClient = new APIClient()
    this.sessionId = crypto.randomUUID()
  }

  async initialize(): Promise<void> {
    // Check if telemetry is enabled
    const telemetryEnabled = await this.configManager.get('telemetry')
    this.enabled = telemetryEnabled !== false

    if (!this.enabled) {
      return
    }

    // Start session
    await this.startSession()
  }

  async trackCommand(args: string[]): Promise<void> {
    if (!this.enabled) return

    try {
      const user = await this.authManager.getCurrentUser()
      const command = args[0] || 'help'
      const subcommand = args[1]
      
      const event = {
        type: 'command',
        command,
        subcommand,
        sessionId: this.sessionId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        platform: process.platform,
        nodeVersion: process.version,
        args: this.sanitizeArgs(args)
      }

      // Send telemetry event
      await this.apiClient.post('/telemetry/events', event).catch(() => {
        // Silent fail
      })
    } catch {
      // Silent fail
    }
  }

  async trackError(error: Error, context?: any): Promise<void> {
    if (!this.enabled) return

    try {
      const user = await this.authManager.getCurrentUser()
      
      const event = {
        type: 'error',
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context,
        sessionId: this.sessionId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }

      // Send error event
      await this.apiClient.post('/telemetry/errors', event).catch(() => {
        // Silent fail
      })
    } catch {
      // Silent fail
    }
  }

  async trackFeatureUsage(feature: string, metadata?: any): Promise<void> {
    if (!this.enabled) return

    try {
      const user = await this.authManager.getCurrentUser()
      
      const event = {
        type: 'feature_usage',
        feature,
        metadata,
        sessionId: this.sessionId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }

      // Send feature usage event
      await this.apiClient.post('/telemetry/features', event).catch(() => {
        // Silent fail
      })
    } catch {
      // Silent fail
    }
  }

  async trackPerformance(operation: string, duration: number, metadata?: any): Promise<void> {
    if (!this.enabled) return

    try {
      const user = await this.authManager.getCurrentUser()
      
      const event = {
        type: 'performance',
        operation,
        duration,
        metadata,
        sessionId: this.sessionId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }

      // Send performance event
      await this.apiClient.post('/telemetry/performance', event).catch(() => {
        // Silent fail
      })
    } catch {
      // Silent fail
    }
  }

  async endSession(): Promise<void> {
    if (!this.enabled) return

    try {
      const user = await this.authManager.getCurrentUser()
      
      const event = {
        type: 'session_end',
        sessionId: this.sessionId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.getSessionStartTime()
      }

      // Send session end event
      await this.apiClient.post('/telemetry/sessions', event).catch(() => {
        // Silent fail
      })
    } catch {
      // Silent fail
    }
  }

  private async startSession(): Promise<void> {
    try {
      const user = await this.authManager.getCurrentUser()
      
      const event = {
        type: 'session_start',
        sessionId: this.sessionId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        platform: process.platform,
        nodeVersion: process.version,
        cliArgs: process.argv.slice(2)
      }

      // Store session start time
      this.setSessionStartTime()

      // Send session start event
      await this.apiClient.post('/telemetry/sessions', event).catch(() => {
        // Silent fail
      })
    } catch {
      // Silent fail
    }
  }

  private sanitizeArgs(args: string[]): string[] {
    // Remove sensitive information from args
    return args.map((arg, index) => {
      // Hide passwords
      if (args[index - 1] === '--password' || args[index - 1] === '-p') {
        return '***'
      }
      
      // Hide API keys
      if (arg.includes('key=') || arg.includes('token=')) {
        return arg.replace(/=.+/, '=***')
      }
      
      // Hide email if it's a password command
      if (args[0] === 'login' && arg.includes('@')) {
        return '***@***'
      }
      
      return arg
    })
  }

  private setSessionStartTime(): void {
    if (typeof globalThis.sessionStorage !== 'undefined') {
      globalThis.sessionStorage.setItem('sessionStartTime', Date.now().toString())
    }
  }

  private getSessionStartTime(): number {
    if (typeof globalThis.sessionStorage !== 'undefined') {
      const stored = globalThis.sessionStorage.getItem('sessionStartTime')
      return stored ? parseInt(stored, 10) : Date.now()
    }
    return Date.now()
  }

  // Analytics methods
  async getUsageStats(): Promise<any> {
    if (!this.enabled) return null

    try {
      const user = await this.authManager.getCurrentUser()
      if (!user) return null

      const response = await this.apiClient.get('/telemetry/stats', {
        params: { userId: user.id }
      })

      return response.data
    } catch {
      return null
    }
  }

  async optOut(): Promise<void> {
    this.enabled = false
    await this.configManager.set('telemetry', false)
    console.log('Telemetry has been disabled. We respect your privacy!')
  }

  async optIn(): Promise<void> {
    this.enabled = true
    await this.configManager.set('telemetry', true)
    console.log('Thank you for helping us improve Revolutionary UI!')
  }
}