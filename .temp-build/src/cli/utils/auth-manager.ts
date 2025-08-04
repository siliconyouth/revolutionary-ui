import fs from 'fs/promises'
import path from 'path'
import { homedir } from 'os'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { AuthService } from '../services/auth-service'
import { loadEnvVariables } from './env-loader'

export interface User {
  id: string
  email: string
  name: string
  company?: string
  plan?: string
  team?: {
    id: string
    name: string
    role: string
  }
  createdAt: string
  stats?: {
    componentsGenerated: number
    codeLinesReduced: number
    timeSaved: string
    purchases: number
    published: number
    avgReduction: string
    topFramework: string
    aiQueries: number
    teamMembers: number
  }
  usage?: {
    aiGenerations: number
    aiGenerationsLimit: number
    apiCalls: number
    apiCallsLimit: number
    storageUsed: number
    storageLimit: number
  }
  subscription?: {
    status: string
    renewsAt: string
  }
}

export interface Credentials {
  token: string
  refreshToken: string
  user: User
}

export class AuthManager {
  private configDir: string
  private credentialsFile: string
  private encryptionKey: Buffer
  private authService: AuthService | null = null

  constructor() {
    this.configDir = path.join(homedir(), '.revolutionary-ui')
    this.credentialsFile = path.join(this.configDir, 'credentials.json')
    
    // Generate encryption key from machine ID
    const machineId = this.getMachineId()
    this.encryptionKey = crypto.scryptSync(machineId, 'revolutionary-ui-salt', 32)
    
    // Load environment variables before initializing auth service
    loadEnvVariables()
    
    // Initialize auth service only when needed
    try {
      this.authService = new AuthService()
    } catch (error: any) {
      // Auth service initialization might fail if Supabase env vars are not set
      // This is OK - we'll use offline mode
      this.authService = null
    }
  }

  async saveCredentials(credentials: Credentials): Promise<void> {
    try {
      // Ensure config directory exists
      await this.ensureConfigDir()

      // Encrypt sensitive data
      const encrypted = this.encrypt(JSON.stringify(credentials))
      
      // Save to file
      await fs.writeFile(this.credentialsFile, encrypted, 'utf-8')
      
      // Set restrictive permissions
      await fs.chmod(this.credentialsFile, 0o600)
    } catch (error: any) {
      throw new Error(`Failed to save credentials: ${error.message}`)
    }
  }

  async getCredentials(): Promise<Credentials | null> {
    try {
      // Check if credentials file exists
      await fs.access(this.credentialsFile)
      
      // Read encrypted data
      const encrypted = await fs.readFile(this.credentialsFile, 'utf-8')
      
      // Decrypt
      const decrypted = this.decrypt(encrypted)
      const credentials = JSON.parse(decrypted) as Credentials
      
      // Validate token
      if (!this.isTokenValid(credentials.token)) {
        // Try to refresh token
        const refreshed = await this.refreshToken(credentials.refreshToken)
        if (refreshed) {
          credentials.token = refreshed.token
          credentials.refreshToken = refreshed.refreshToken
          await this.saveCredentials(credentials)
        } else {
          // Refresh failed, clear credentials
          await this.clearCredentials()
          return null
        }
      }
      
      return credentials
    } catch (error) {
      return null
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const credentials = await this.getCredentials()
    return credentials?.user || null
  }

  async getToken(): Promise<string | null> {
    const credentials = await this.getCredentials()
    return credentials?.token || null
  }

  async clearCredentials(): Promise<void> {
    try {
      await fs.unlink(this.credentialsFile)
    } catch (error) {
      // File doesn't exist, that's fine
    }
  }

  async updateUser(user: Partial<User>): Promise<void> {
    const credentials = await this.getCredentials()
    if (!credentials) {
      throw new Error('No credentials found')
    }

    credentials.user = { ...credentials.user, ...user }
    await this.saveCredentials(credentials)
  }

  private async ensureConfigDir(): Promise<void> {
    try {
      await fs.mkdir(this.configDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  }

  private decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  private getMachineId(): string {
    // Use combination of hostname and username for machine ID
    const hostname = require('os').hostname()
    const username = require('os').userInfo().username
    return crypto.createHash('sha256').update(`${hostname}-${username}`).digest('hex')
  }

  private isTokenValid(token: string): boolean {
    // Special handling for offline tokens
    if (token === 'offline-token') {
      return true
    }
    
    try {
      // Decode token without verification (server will verify)
      const decoded = jwt.decode(token) as any
      
      if (!decoded || !decoded.exp) {
        return false
      }
      
      // Check if token is expired (with 5 minute buffer)
      const expirationTime = decoded.exp * 1000
      const currentTime = Date.now()
      const buffer = 5 * 60 * 1000 // 5 minutes
      
      return expirationTime > currentTime + buffer
    } catch (error) {
      return false
    }
  }

  private async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string } | null> {
    if (!this.authService) {
      // Can't refresh offline tokens
      return null
    }
    
    try {
      return await this.authService.refreshSession(refreshToken)
    } catch (error) {
      return null
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const credentials = await this.getCredentials()
    return credentials !== null
  }

  async requireAuth(): Promise<void> {
    if (!await this.isAuthenticated()) {
      throw new Error('Authentication required. Please login with: revolutionary-ui login')
    }
  }

  async interactiveLogin(): Promise<void> {
    console.log(chalk.cyan('\n🔐 Revolutionary UI Login\n'))
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email:',
        validate: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(value) || 'Please enter a valid email'
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*',
        validate: (value: string) => value.length >= 6 || 'Password must be at least 6 characters'
      }
    ])

    try {
      if (!this.authService) {
        // Fallback to offline mode if auth service is not available
        console.log(chalk.yellow('\n⚠️  Auth service not available. Using offline mode.'))
        
        // Check if we have offline credentials for this email
        const existingCreds = await this.getCredentials()
        if (existingCreds && existingCreds.user.email === answers.email) {
          console.log(chalk.green(`\n✓ Logged in with offline credentials as ${answers.email}`))
          return
        }
        
        console.log(chalk.red('\n✗ No offline account found for this email.'))
        const { createOffline } = await inquirer.prompt([{
          type: 'confirm',
          name: 'createOffline',
          message: 'Create an offline account?',
          default: true
        }])
        
        if (createOffline) {
          await this.interactiveRegister()
        }
        return
      }

      // Real login with Supabase
      console.log(chalk.cyan('\n🔄 Signing in...'))
      
      const response = await this.authService.login(
        answers.email,
        answers.password
      )
      
      const credentials: Credentials = {
        token: response.token,
        refreshToken: response.refreshToken,
        user: response.user
      }
      
      await this.saveCredentials(credentials)
      console.log(chalk.green(`\n✓ Successfully logged in as ${answers.email}`))
    } catch (error: any) {
      console.error(chalk.red(`\n✗ Login failed: ${error.message}`))
      
      if (error.message.includes('Invalid email or password')) {
        const { retry } = await inquirer.prompt([{
          type: 'confirm',
          name: 'retry',
          message: 'Try again?',
          default: true
        }])
        
        if (retry) {
          await this.interactiveLogin()
          return
        }
      }
      
      throw error
    }
  }

  async interactiveRegister(): Promise<void> {
    console.log(chalk.cyan('\n✨ Revolutionary UI Registration\n'))
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Full Name:',
        validate: (value: string) => value.length >= 2 || 'Please enter your name'
      },
      {
        type: 'input',
        name: 'email',
        message: 'Email:',
        validate: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(value) || 'Please enter a valid email'
        }
      },
      {
        type: 'input',
        name: 'company',
        message: 'Company (optional):'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*',
        validate: (value: string) => value.length >= 6 || 'Password must be at least 6 characters'
      },
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm Password:',
        mask: '*',
        validate: (value: string) => {
          // For newer inquirer versions, we need to validate after all prompts
          return value.length >= 6 || 'Password must be at least 6 characters'
        }
      }
    ])

    // Validate passwords match
    if (answers.password !== answers.confirmPassword) {
      console.error(chalk.red('\n✗ Passwords do not match'))
      return await this.interactiveRegister() // Retry
    }

    try {
      if (!this.authService) {
        // Fallback to mock registration if auth service is not available
        console.log(chalk.yellow('\n⚠️  Auth service not available. Using offline mode.'))
        
        const mockCredentials: Credentials = {
          token: 'offline-token',
          refreshToken: 'offline-refresh-token',
          user: {
            id: `offline-${Date.now()}`,
            email: answers.email,
            name: answers.name,
            company: answers.company || undefined,
            plan: 'free',
            createdAt: new Date().toISOString()
          }
        }
        
        await this.saveCredentials(mockCredentials)
        console.log(chalk.green(`\n✓ Successfully registered in offline mode as ${answers.email}`))
        console.log(chalk.gray('Note: This is a local-only account. Online features will be limited.'))
        return
      }

      // Real registration with Supabase
      console.log(chalk.cyan('\n🔄 Creating your account...'))
      
      const response = await this.authService.register(
        answers.email,
        answers.password,
        answers.name,
        answers.company
      )
      
      const credentials: Credentials = {
        token: response.token,
        refreshToken: response.refreshToken,
        user: response.user
      }
      
      await this.saveCredentials(credentials)
      console.log(chalk.green(`\n✓ Successfully registered as ${answers.email}`))
      console.log(chalk.gray('Welcome to Revolutionary UI! You can now use all features.'))
      
      // Send welcome email notification
      console.log(chalk.gray('A confirmation email has been sent to your address.'))
    } catch (error: any) {
      console.error(chalk.red(`\n✗ Registration failed: ${error.message}`))
      
      if (error.message.includes('already registered')) {
        const { tryLogin } = await inquirer.prompt([{
          type: 'confirm',
          name: 'tryLogin',
          message: 'Would you like to login instead?',
          default: true
        }])
        
        if (tryLogin) {
          await this.interactiveLogin()
          return
        }
      }
      
      throw error
    }
  }

  async logout(): Promise<void> {
    await this.clearCredentials()
    console.log(chalk.green('✓ Successfully logged out'))
  }

  async showAccountSettings(): Promise<void> {
    const user = await this.getCurrentUser()
    
    if (!user) {
      console.log(chalk.yellow('Please login first'))
      return
    }

    console.log(chalk.cyan('\n👤 Account Settings\n'))
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name}`)
    console.log(`Company: ${user.company || 'Not set'}`)
    console.log(`Plan: ${user.plan || 'Free'}`)
    console.log(`Member Since: ${new Date(user.createdAt).toLocaleDateString()}`)
    
    if (user.team) {
      console.log(`\nTeam: ${user.team.name}`)
      console.log(`Role: ${user.team.role}`)
    }
    
    if (user.usage) {
      console.log(chalk.cyan('\n📊 Usage:'))
      console.log(`AI Generations: ${user.usage.aiGenerations}/${user.usage.aiGenerationsLimit}`)
      console.log(`API Calls: ${user.usage.apiCalls}/${user.usage.apiCallsLimit}`)
      console.log(`Storage: ${user.usage.storageUsed}MB/${user.usage.storageLimit}MB`)
    }
    
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: '\nWhat would you like to do?',
      choices: [
        { name: 'Update Profile', value: 'update' },
        { name: 'Change Password', value: 'password' },
        { name: 'Manage Subscription', value: 'subscription' },
        { name: 'Back', value: 'back' }
      ]
    }])
    
    switch (action) {
      case 'update':
        // TODO: Implement profile update
        console.log(chalk.yellow('Profile update not yet implemented'))
        break
      case 'password':
        // TODO: Implement password change
        console.log(chalk.yellow('Password change not yet implemented'))
        break
      case 'subscription':
        await this.manageSubscription()
        break
    }
  }

  async manageSubscription(): Promise<void> {
    const user = await this.getCurrentUser()
    
    if (!user) {
      console.log(chalk.yellow('Please login first'))
      return
    }

    console.log(chalk.cyan('\n💳 Subscription Management\n'))
    console.log(`Current Plan: ${user.plan || 'Free'}`)
    
    if (user.subscription) {
      console.log(`Status: ${user.subscription.status}`)
      console.log(`Renews: ${new Date(user.subscription.renewsAt).toLocaleDateString()}`)
    }
    
    console.log(chalk.cyan('\n📦 Available Plans:\n'))
    console.log('Free:')
    console.log('  • 100 AI generations/month')
    console.log('  • Access to basic components')
    console.log('  • Community support')
    
    console.log('\nPro ($29/month):')
    console.log('  • Unlimited AI generations')
    console.log('  • Access to all components')
    console.log('  • Priority support')
    console.log('  • Team collaboration (5 members)')
    
    console.log('\nEnterprise ($99/month):')
    console.log('  • Everything in Pro')
    console.log('  • Unlimited team members')
    console.log('  • Private component registry')
    console.log('  • SLA support')
    console.log('  • Custom AI models')
    
    // TODO: Implement actual subscription management
    console.log(chalk.yellow('\n⚠️  Subscription management coming soon!'))
  }
}