import fs from 'fs/promises'
import path from 'path'
import { homedir } from 'os'

export interface CLIConfig {
  version: string
  defaultFramework?: string
  defaultStyleSystem?: string
  defaultOutputDir?: string
  aiProvider?: string
  telemetry?: boolean
  analytics?: boolean
  theme?: 'auto' | 'light' | 'dark'
  experimental?: {
    streaming?: boolean
    multipleVariations?: boolean
    autoSave?: boolean
  }
  aliases?: Record<string, string>
  workspace?: {
    projectPath?: string
    componentsDir?: string
    templatesDir?: string
  }
  api?: {
    baseUrl?: string
    timeout?: number
  }
}

export class ConfigManager {
  private configDir: string
  private configFile: string
  private globalConfigFile: string
  private config: CLIConfig | null = null

  constructor() {
    this.configDir = path.join(homedir(), '.revolutionary-ui')
    this.globalConfigFile = path.join(this.configDir, 'config.json')
    this.configFile = path.join(process.cwd(), '.revolutionary-ui.json')
  }

  async getConfig(): Promise<CLIConfig> {
    if (this.config) {
      return this.config
    }

    // Load global config first
    const globalConfig = await this.loadGlobalConfig()
    
    // Load project config and merge
    const projectConfig = await this.loadProjectConfig()
    
    // Merge configs (project overrides global)
    this.config = {
      ...this.getDefaultConfig(),
      ...globalConfig,
      ...projectConfig
    }

    return this.config
  }

  async get<K extends keyof CLIConfig>(key: K): Promise<CLIConfig[K] | undefined> {
    const config = await this.getConfig()
    return config[key]
  }

  async set<K extends keyof CLIConfig>(key: K, value: CLIConfig[K], global: boolean = false): Promise<void> {
    const configFile = global ? this.globalConfigFile : this.configFile
    
    // Load existing config
    let config: CLIConfig = { version: '3.2.0' }
    try {
      const content = await fs.readFile(configFile, 'utf-8')
      config = JSON.parse(content)
    } catch {
      // File doesn't exist or is invalid
    }

    // Update value
    config[key] = value

    // Ensure directory exists
    const dir = path.dirname(configFile)
    await fs.mkdir(dir, { recursive: true })

    // Save config
    await fs.writeFile(configFile, JSON.stringify(config, null, 2), 'utf-8')

    // Clear cache
    this.config = null
  }

  async setNested(keyPath: string, value: any, global: boolean = false): Promise<void> {
    const configFile = global ? this.globalConfigFile : this.configFile
    
    // Load existing config
    let config: any = { version: '3.2.0' }
    try {
      const content = await fs.readFile(configFile, 'utf-8')
      config = JSON.parse(content)
    } catch {
      // File doesn't exist or is invalid
    }

    // Set nested value
    const keys = keyPath.split('.')
    let current = config
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value

    // Save config
    const dir = path.dirname(configFile)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(configFile, JSON.stringify(config, null, 2), 'utf-8')

    // Clear cache
    this.config = null
  }

  async getNested(keyPath: string): Promise<any> {
    const config = await this.getConfig()
    
    const keys = keyPath.split('.')
    let current: any = config
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }
    
    return current
  }

  async reset(global: boolean = false): Promise<void> {
    const configFile = global ? this.globalConfigFile : this.configFile
    
    try {
      await fs.unlink(configFile)
    } catch {
      // File doesn't exist
    }

    // Clear cache
    this.config = null
  }

  async list(): Promise<Record<string, any>> {
    const config = await this.getConfig()
    return this.flattenConfig(config)
  }

  async addAlias(alias: string, command: string): Promise<void> {
    const config = await this.getConfig()
    
    if (!config.aliases) {
      config.aliases = {}
    }
    
    config.aliases[alias] = command
    
    await this.set('aliases', config.aliases)
  }

  async removeAlias(alias: string): Promise<void> {
    const config = await this.getConfig()
    
    if (config.aliases && alias in config.aliases) {
      delete config.aliases[alias]
      await this.set('aliases', config.aliases)
    }
  }

  async getAlias(alias: string): Promise<string | undefined> {
    const config = await this.getConfig()
    return config.aliases?.[alias]
  }

  private async loadGlobalConfig(): Promise<Partial<CLIConfig>> {
    try {
      const content = await fs.readFile(this.globalConfigFile, 'utf-8')
      return JSON.parse(content)
    } catch {
      return {}
    }
  }

  private async loadProjectConfig(): Promise<Partial<CLIConfig>> {
    try {
      const content = await fs.readFile(this.configFile, 'utf-8')
      return JSON.parse(content)
    } catch {
      return {}
    }
  }

  private getDefaultConfig(): CLIConfig {
    return {
      version: '3.0.0',
      defaultFramework: 'react',
      defaultStyleSystem: 'tailwind',
      defaultOutputDir: './components',
      aiProvider: 'openai',
      telemetry: true,
      analytics: true,
      theme: 'auto',
      experimental: {
        streaming: true,
        multipleVariations: true,
        autoSave: false
      }
    }
  }

  private flattenConfig(obj: any, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {}
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        
        if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(result, this.flattenConfig(obj[key], newKey))
        } else {
          result[newKey] = obj[key]
        }
      }
    }
    
    return result
  }

  // Project-specific configuration
  async initializeProject(options: {
    framework?: string
    typescript?: boolean
    styleSystem?: string
    componentsDir?: string
  }): Promise<void> {
    const projectConfig = {
      version: '3.0.0',
      project: {
        framework: options.framework || 'react',
        typescript: options.typescript ?? true,
        styleSystem: options.styleSystem || 'tailwind',
        componentsDir: options.componentsDir || './components'
      },
      workspace: {
        projectPath: process.cwd(),
        componentsDir: options.componentsDir || './components',
        templatesDir: './templates'
      }
    }

    await fs.writeFile(this.configFile, JSON.stringify(projectConfig, null, 2), 'utf-8')
    
    // Create .gitignore entry
    try {
      const gitignorePath = path.join(process.cwd(), '.gitignore')
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8').catch(() => '')
      
      if (!gitignoreContent.includes('.revolutionary-ui.json')) {
        await fs.appendFile(gitignorePath, '\n# Revolutionary UI\n.revolutionary-ui.json\n')
      }
    } catch {
      // Ignore errors
    }
  }

  async hasProjectConfig(): Promise<boolean> {
    try {
      await fs.access(this.configFile)
      return true
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance()

// Helper functions for session config
export async function loadSessionConfig(): Promise<any> {
  const sessionPath = path.join(process.cwd(), '.revolutionary-ui.json')
  try {
    const content = await fs.readFile(sessionPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    // Return default session config
    return {
      sessionId: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      preferences: {},
      aiProvider: 'openai',
      features: []
    }
  }
}

export async function saveSessionConfig(config: any): Promise<void> {
  const sessionPath = path.join(process.cwd(), '.revolutionary-ui.json')
  await fs.writeFile(sessionPath, JSON.stringify(config, null, 2), 'utf-8')
}