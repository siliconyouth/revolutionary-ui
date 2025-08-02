/**
 * Authentication Manager for Revolutionary UI Factory
 * Handles user authentication, token storage, and premium feature access
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { spawn } from 'child_process'
import chalk from 'chalk'

interface AuthConfig {
  accessToken?: string
  refreshToken?: string
  userId?: string
  userEmail?: string
  subscriptionPlan?: 'free' | 'starter' | 'pro' | 'enterprise'
  subscriptionStatus?: 'active' | 'trialing' | 'canceled' | 'expired'
  expiresAt?: string
  features?: PremiumFeatures
}

interface PremiumFeatures {
  marketplaceAccess: boolean
  aiGenerator: boolean
  customAI: boolean
  teamCollaboration: boolean
  customComponents: boolean
  advancedAnalytics: boolean
  prioritySupport: boolean
  cloudSync: boolean
  versionControl: boolean
  privateRegistry: boolean
  whiteLabel: boolean
  apiAccess: boolean
  ssoIntegration: boolean
  auditLogs: boolean
  unlimitedProjects: boolean
}

export class AuthManager {
  private static CONFIG_DIR = path.join(os.homedir(), '.revolutionary-ui')
  private static AUTH_FILE = 'auth.json'
  private static AUTH_PATH = path.join(AuthManager.CONFIG_DIR, AuthManager.AUTH_FILE)
  private static LOGIN_URL = 'https://revolutionary-ui.com/cli-login'
  private static API_BASE = 'https://api.revolutionary-ui.com/v1'
  
  /**
   * Initialize auth manager and ensure config directory exists
   */
  static async init(): Promise<void> {
    try {
      await fs.mkdir(AuthManager.CONFIG_DIR, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
  }
  
  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const config = await this.loadConfig()
      if (!config.accessToken) return false
      
      // Check if token is expired
      if (config.expiresAt) {
        const expiryDate = new Date(config.expiresAt)
        if (expiryDate < new Date()) {
          // Try to refresh token
          if (config.refreshToken) {
            return await this.refreshAuth(config.refreshToken)
          }
          return false
        }
      }
      
      return true
    } catch {
      return false
    }
  }
  
  /**
   * Get current auth configuration
   */
  static async getAuth(): Promise<AuthConfig | null> {
    try {
      return await this.loadConfig()
    } catch {
      return null
    }
  }
  
  /**
   * Start login process
   */
  static async login(): Promise<boolean> {
    await this.init()
    
    console.log(chalk.cyan('\n🔐 Opening browser for authentication...'))
    console.log(chalk.gray(`URL: ${this.LOGIN_URL}`))
    
    // Generate a unique session ID for this login attempt
    const sessionId = this.generateSessionId()
    const loginUrl = `${this.LOGIN_URL}?session=${sessionId}&source=cli`
    
    // Open browser
    await this.openBrowser(loginUrl)
    
    console.log(chalk.yellow('\n⏳ Waiting for authentication...'))
    console.log(chalk.gray('Please complete the login process in your browser.'))
    console.log(chalk.gray('You can close this terminal if needed - your session will be saved.\n'))
    
    // Poll for authentication completion
    const authenticated = await this.pollForAuth(sessionId)
    
    if (authenticated) {
      const auth = await this.getAuth()
      console.log(chalk.green('\n✅ Authentication successful!'))
      console.log(chalk.gray(`Logged in as: ${auth?.userEmail}`))
      console.log(chalk.gray(`Subscription: ${auth?.subscriptionPlan?.toUpperCase() || 'FREE'}`))
      
      // Show available features
      if (auth?.features) {
        console.log(chalk.cyan('\n✨ Available Features:'))
        const features = this.getEnabledFeatures(auth.features)
        features.forEach(feature => {
          console.log(chalk.gray(`  • ${feature}`))
        })
      }
      
      return true
    } else {
      console.log(chalk.red('\n❌ Authentication failed or timed out.'))
      console.log(chalk.gray('Please try again or contact support if the issue persists.'))
      return false
    }
  }
  
  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await fs.unlink(this.AUTH_PATH)
      console.log(chalk.green('\n✅ Successfully logged out!'))
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  You were not logged in.'))
    }
  }
  
  /**
   * Check if user has access to a specific feature
   */
  static async hasFeature(feature: keyof PremiumFeatures): Promise<boolean> {
    const auth = await this.getAuth()
    if (!auth || !auth.features) return false
    return auth.features[feature] || false
  }
  
  /**
   * Get user's subscription plan
   */
  static async getSubscriptionPlan(): Promise<string> {
    const auth = await this.getAuth()
    return auth?.subscriptionPlan || 'free'
  }
  
  /**
   * Check if subscription is active
   */
  static async isSubscriptionActive(): Promise<boolean> {
    const auth = await this.getAuth()
    return auth?.subscriptionStatus === 'active' || auth?.subscriptionStatus === 'trialing'
  }
  
  /**
   * Save authentication config
   */
  private static async saveConfig(config: AuthConfig): Promise<void> {
    await fs.writeFile(this.AUTH_PATH, JSON.stringify(config, null, 2), 'utf-8')
    // Set restrictive permissions (user read/write only)
    await fs.chmod(this.AUTH_PATH, 0o600)
  }
  
  /**
   * Load authentication config
   */
  private static async loadConfig(): Promise<AuthConfig> {
    const data = await fs.readFile(this.AUTH_PATH, 'utf-8')
    return JSON.parse(data)
  }
  
  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Open browser with URL
   */
  private static async openBrowser(url: string): Promise<void> {
    const platform = process.platform
    let command: string
    let args: string[]
    
    if (platform === 'darwin') {
      command = 'open'
      args = [url]
    } else if (platform === 'win32') {
      command = 'cmd'
      args = ['/c', 'start', url]
    } else {
      command = 'xdg-open'
      args = [url]
    }
    
    return new Promise((resolve) => {
      const child = spawn(command, args, { detached: true, stdio: 'ignore' })
      child.unref()
      resolve()
    })
  }
  
  /**
   * Poll for authentication completion
   */
  private static async pollForAuth(sessionId: string, maxAttempts = 60): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Check with API if authentication is complete
        const response = await fetch(`${this.API_BASE}/auth/cli-session/${sessionId}`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'authenticated') {
            // Save authentication data
            await this.saveConfig({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              userId: data.userId,
              userEmail: data.userEmail,
              subscriptionPlan: data.subscriptionPlan,
              subscriptionStatus: data.subscriptionStatus,
              expiresAt: data.expiresAt,
              features: data.features
            })
            return true
          }
        }
      } catch (error) {
        // API might not be available, continue polling
      }
      
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    return false
  }
  
  /**
   * Refresh authentication token
   */
  private static async refreshAuth(refreshToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })
      
      if (response.ok) {
        const data = await response.json()
        const currentConfig = await this.loadConfig()
        
        await this.saveConfig({
          ...currentConfig,
          accessToken: data.accessToken,
          expiresAt: data.expiresAt
        })
        
        return true
      }
    } catch (error) {
      // Refresh failed
    }
    
    return false
  }
  
  /**
   * Get list of enabled features
   */
  private static getEnabledFeatures(features: PremiumFeatures): string[] {
    const featureNames: Record<keyof PremiumFeatures, string> = {
      marketplaceAccess: '🛍️  Marketplace Components',
      aiGenerator: '🤖 AI Component Generator',
      customAI: '🧠 Bring Your Own AI',
      teamCollaboration: '👥 Team Collaboration',
      customComponents: '🎨 Custom Component Library',
      advancedAnalytics: '📊 Advanced Analytics',
      prioritySupport: '🚀 Priority Support',
      cloudSync: '☁️  Cloud Sync',
      versionControl: '🔄 Version Control Integration',
      privateRegistry: '🔒 Private Component Registry',
      whiteLabel: '🏷️  White Label Options',
      apiAccess: '🔌 API Access',
      ssoIntegration: '🔐 SSO Integration',
      auditLogs: '📋 Audit Logs',
      unlimitedProjects: '♾️  Unlimited Projects'
    }
    
    return Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => featureNames[key as keyof PremiumFeatures])
      .filter(Boolean)
  }
  
  /**
   * Make authenticated API request
   */
  static async apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response | null> {
    const auth = await this.getAuth()
    if (!auth?.accessToken) {
      throw new Error('Not authenticated. Please run "revolutionary-ui login" first.')
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json'
    }
    
    try {
      const response = await fetch(`${this.API_BASE}${endpoint}`, {
        ...options,
        headers
      })
      
      if (response.status === 401) {
        // Try to refresh token
        if (auth.refreshToken && await this.refreshAuth(auth.refreshToken)) {
          // Retry with new token
          const newAuth = await this.getAuth()
          headers['Authorization'] = `Bearer ${newAuth?.accessToken}`
          return await fetch(`${this.API_BASE}${endpoint}`, {
            ...options,
            headers
          })
        }
        throw new Error('Authentication expired. Please login again.')
      }
      
      return response
    } catch (error) {
      console.error(chalk.red(`API request failed: ${error}`))
      return null
    }
  }
}