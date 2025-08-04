import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { homedir } from 'os'

export interface Session {
  id: string
  workspace: string
  createdAt: Date
  lastUpdated: Date
  isFirstRun: boolean
}

export interface SessionConfig {
  sessionId: string
  timestamp: string
  project?: {
    name: string
    framework: string
    language: string
    packageManager: string
  }
  features?: string[]
  analysis?: any
  settings?: Record<string, any>
  lastChangeHash?: string
}

export class SessionManager {
  private configDir: string
  private sessionFile: string
  private configFile: string
  private currentSession: Session | null = null

  constructor() {
    this.configDir = path.join(homedir(), '.revolutionary-ui')
    this.sessionFile = path.join(this.configDir, 'session.json')
    this.configFile = path.join(process.cwd(), '.revolutionary-ui.config.json')
  }

  async initializeSession(): Promise<Session> {
    // Ensure config directory exists
    await this.ensureConfigDir()

    // Check for existing session
    let session = await this.loadSession()
    
    if (!session || session.workspace !== process.cwd()) {
      // Create new session
      session = {
        id: this.generateSessionId(),
        workspace: process.cwd(),
        createdAt: new Date(),
        lastUpdated: new Date(),
        isFirstRun: true
      }
      
      await this.saveSession(session)
    } else {
      // Update existing session
      session.lastUpdated = new Date()
      session.isFirstRun = false
      await this.saveSession(session)
    }

    this.currentSession = session
    return session
  }

  async loadConfig(): Promise<SessionConfig | null> {
    try {
      const content = await fs.readFile(this.configFile, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  async saveConfig(config: Partial<SessionConfig>): Promise<void> {
    try {
      // Load existing config
      let existingConfig = await this.loadConfig() || {}
      
      // Merge with new config
      const updatedConfig: SessionConfig = {
        ...existingConfig,
        ...config,
        sessionId: this.currentSession?.id || existingConfig.sessionId,
        timestamp: new Date().toISOString(),
        lastChangeHash: this.generateChangeHash(config)
      }

      // Save to file
      await fs.writeFile(
        this.configFile,
        JSON.stringify(updatedConfig, null, 2),
        'utf-8'
      )

      // Add to .gitignore if not already there
      await this.addToGitignore()
    } catch (error: any) {
      throw new Error(`Failed to save config: ${error.message}`)
    }
  }

  async updateSessionTimestamp(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.lastUpdated = new Date()
      await this.saveSession(this.currentSession)
    }
  }

  async saveSecureConfig(key: string, value: any): Promise<void> {
    const secureFile = path.join(this.configDir, 'secure-config.json')
    
    try {
      // Load existing secure config
      let secureConfig: Record<string, any> = {}
      try {
        const content = await fs.readFile(secureFile, 'utf-8')
        secureConfig = JSON.parse(content)
      } catch {
        // File doesn't exist yet
      }

      // Update config
      secureConfig[key] = value

      // Encrypt sensitive data
      const encrypted = this.encrypt(JSON.stringify(secureConfig))
      
      // Save encrypted config
      await fs.writeFile(secureFile, encrypted, 'utf-8')
      
      // Set restrictive permissions
      await fs.chmod(secureFile, 0o600)
    } catch (error: any) {
      throw new Error(`Failed to save secure config: ${error.message}`)
    }
  }

  async loadSecureConfig(key: string): Promise<any> {
    const secureFile = path.join(this.configDir, 'secure-config.json')
    
    try {
      const encrypted = await fs.readFile(secureFile, 'utf-8')
      const decrypted = this.decrypt(encrypted)
      const config = JSON.parse(decrypted)
      return config[key]
    } catch {
      return null
    }
  }

  async getConfigHistory(): Promise<any[]> {
    const historyFile = path.join(this.configDir, 'config-history.json')
    
    try {
      const content = await fs.readFile(historyFile, 'utf-8')
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  async addToConfigHistory(config: SessionConfig): Promise<void> {
    const historyFile = path.join(this.configDir, 'config-history.json')
    
    try {
      let history = await this.getConfigHistory()
      
      // Keep only last 10 entries
      history = [config, ...history].slice(0, 10)
      
      await fs.writeFile(historyFile, JSON.stringify(history, null, 2), 'utf-8')
    } catch (error: any) {
      // Non-critical error
      console.error('Failed to save config history:', error.message)
    }
  }

  private async loadSession(): Promise<Session | null> {
    try {
      const content = await fs.readFile(this.sessionFile, 'utf-8')
      const session = JSON.parse(content)
      
      // Convert dates
      session.createdAt = new Date(session.createdAt)
      session.lastUpdated = new Date(session.lastUpdated)
      
      return session
    } catch {
      return null
    }
  }

  private async saveSession(session: Session): Promise<void> {
    await fs.writeFile(this.sessionFile, JSON.stringify(session, null, 2), 'utf-8')
  }

  private async ensureConfigDir(): Promise<void> {
    try {
      await fs.mkdir(this.configDir, { recursive: true })
    } catch {
      // Directory already exists
    }
  }

  private generateSessionId(): string {
    // Generate a unique session ID with timestamp and random component
    const timestamp = Date.now().toString(36)
    const random = crypto.randomBytes(8).toString('hex')
    return `${timestamp}-${random}`
  }

  private generateChangeHash(config: any): string {
    // Generate a hash of the configuration for change detection
    const configString = JSON.stringify(config, Object.keys(config).sort())
    return crypto.createHash('sha256').update(configString).digest('hex').substring(0, 16)
  }

  private encrypt(text: string): string {
    const algorithm = 'aes-256-gcm'
    const key = this.getEncryptionKey()
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  }

  private decrypt(encryptedData: string): string {
    const algorithm = 'aes-256-gcm'
    const key = this.getEncryptionKey()
    
    const parts = encryptedData.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  private getEncryptionKey(): Buffer {
    // Derive encryption key from machine-specific data
    const hostname = require('os').hostname()
    const username = require('os').userInfo().username
    const seed = `revolutionary-ui-${hostname}-${username}`
    
    return crypto.scryptSync(seed, 'revolutionary-ui-salt', 32)
  }

  private async addToGitignore(): Promise<void> {
    const gitignorePath = path.join(process.cwd(), '.gitignore')
    const configFileName = '.revolutionary-ui.config.json'
    
    try {
      let content = ''
      try {
        content = await fs.readFile(gitignorePath, 'utf-8')
      } catch {
        // .gitignore doesn't exist
      }

      // Check if already in .gitignore
      if (!content.includes(configFileName)) {
        // Add to .gitignore
        const newContent = content.trim() + '\n\n# Revolutionary UI\n' + configFileName + '\n'
        await fs.writeFile(gitignorePath, newContent, 'utf-8')
      }
    } catch {
      // Non-critical error
    }
  }
}