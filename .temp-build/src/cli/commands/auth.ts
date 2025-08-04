import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import { AuthManager } from '../utils/auth-manager'
import { ConfigManager } from '../utils/config-manager'
import { APIClient } from '../utils/api-client'
import { validateEmail } from '../utils/validators'

export class AuthCommands {
  private authManager: AuthManager
  private configManager: ConfigManager
  private apiClient: APIClient

  constructor() {
    this.authManager = new AuthManager()
    this.configManager = new ConfigManager()
    this.apiClient = new APIClient()
  }

  async login(options: { email?: string; password?: string }) {
    try {
      // Check if already logged in
      const currentUser = await this.authManager.getCurrentUser()
      if (currentUser) {
        const { overwrite } = await inquirer.prompt([{
          type: 'confirm',
          name: 'overwrite',
          message: `You are already logged in as ${currentUser.email}. Login with a different account?`,
          default: false
        }])
        
        if (!overwrite) {
          return
        }
      }

      // Collect credentials
      const credentials = await this.collectLoginCredentials(options)
      
      // Attempt login
      const spinner = ora('Logging in...').start()
      
      try {
        const response = await this.apiClient.post('/auth/login', {
          email: credentials.email,
          password: credentials.password
        })

        // Save auth token and user info
        await this.authManager.saveCredentials({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          user: response.data.user
        })

        spinner.succeed(chalk.green('✅ Successfully logged in!'))
        
        console.log(chalk.cyan(`\nWelcome back, ${response.data.user.name}! 👋`))
        console.log(chalk.gray(`Email: ${response.data.user.email}`))
        console.log(chalk.gray(`Plan: ${response.data.user.plan || 'Free'}`))
        
        // Show available features based on plan
        this.showPlanFeatures(response.data.user.plan)
        
      } catch (error: any) {
        spinner.fail(chalk.red('Login failed'))
        
        if (error.response?.status === 401) {
          console.error(chalk.red('❌ Invalid email or password'))
        } else if (error.response?.status === 429) {
          console.error(chalk.red('❌ Too many login attempts. Please try again later.'))
        } else {
          console.error(chalk.red(`❌ ${error.message}`))
        }
        
        process.exit(1)
      }
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Unexpected error: ${error.message}`))
      process.exit(1)
    }
  }

  async register(options: { email?: string; name?: string; company?: string }) {
    try {
      console.log(chalk.cyan('\n🎉 Welcome to Revolutionary UI!\n'))
      console.log(chalk.gray('Let\'s create your account to unlock AI-powered component generation.\n'))

      // Collect registration info
      const registrationData = await this.collectRegistrationData(options)
      
      // Validate password strength
      if (!this.validatePasswordStrength(registrationData.password)) {
        console.error(chalk.red('❌ Password must be at least 8 characters with uppercase, lowercase, and numbers'))
        process.exit(1)
      }

      // Attempt registration
      const spinner = ora('Creating your account...').start()
      
      try {
        const response = await this.apiClient.post('/auth/register', {
          email: registrationData.email,
          password: registrationData.password,
          name: registrationData.name,
          company: registrationData.company,
          acceptTerms: registrationData.acceptTerms,
          marketingEmails: registrationData.marketingEmails
        })

        // Automatically log them in
        await this.authManager.saveCredentials({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          user: response.data.user
        })

        spinner.succeed(chalk.green('✅ Account created successfully!'))
        
        console.log(chalk.cyan(`\n🎊 Welcome to Revolutionary UI, ${response.data.user.name}!`))
        console.log(chalk.gray('\nYour free account includes:'))
        console.log(chalk.gray('  • 100 AI component generations per month'))
        console.log(chalk.gray('  • Access to component catalog'))
        console.log(chalk.gray('  • Basic project analysis'))
        console.log(chalk.gray('  • Community support'))
        
        console.log(chalk.cyan('\n🚀 Next steps:'))
        console.log(chalk.gray('  1. Run ' + chalk.green('revolutionary-ui analyze') + ' to analyze your project'))
        console.log(chalk.gray('  2. Try ' + chalk.green('revolutionary-ui generate --ai "Create a hero section"')))
        console.log(chalk.gray('  3. Browse components with ' + chalk.green('revolutionary-ui catalog')))
        
        // Send welcome email
        await this.sendWelcomeEmail(response.data.user.email)
        
      } catch (error: any) {
        spinner.fail(chalk.red('Registration failed'))
        
        if (error.response?.status === 409) {
          console.error(chalk.red('❌ An account with this email already exists'))
          console.log(chalk.gray('\nTry logging in with ' + chalk.green('revolutionary-ui login')))
        } else if (error.response?.status === 400) {
          console.error(chalk.red(`❌ ${error.response.data.message}`))
        } else {
          console.error(chalk.red(`❌ ${error.message}`))
        }
        
        process.exit(1)
      }
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Unexpected error: ${error.message}`))
      process.exit(1)
    }
  }

  async logout() {
    try {
      const currentUser = await this.authManager.getCurrentUser()
      
      if (!currentUser) {
        console.log(chalk.yellow('You are not currently logged in'))
        return
      }

      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to logout from ${currentUser.email}?`,
        default: false
      }])

      if (!confirm) {
        return
      }

      const spinner = ora('Logging out...').start()

      try {
        // Notify server to invalidate token
        await this.apiClient.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${await this.authManager.getToken()}`
          }
        })
      } catch (error) {
        // Continue with local logout even if server request fails
      }

      // Clear local credentials
      await this.authManager.clearCredentials()
      
      spinner.succeed(chalk.green('✅ Successfully logged out'))
      console.log(chalk.gray('\nThanks for using Revolutionary UI! See you soon 👋'))
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Error during logout: ${error.message}`))
      process.exit(1)
    }
  }

  async whoami() {
    try {
      const currentUser = await this.authManager.getCurrentUser()
      
      if (!currentUser) {
        console.log(chalk.yellow('You are not currently logged in'))
        console.log(chalk.gray('\nLogin with ' + chalk.green('revolutionary-ui login')))
        return
      }

      // Fetch latest user info from server
      const spinner = ora('Fetching account info...').start()
      
      try {
        const response = await this.apiClient.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${await this.authManager.getToken()}`
          }
        })

        spinner.stop()
        
        const user = response.data.user
        
        console.log(chalk.bold.cyan('\n👤 Account Information:\n'))
        console.log(`  Name: ${user.name}`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Plan: ${user.plan || 'Free'}`)
        console.log(`  Member Since: ${new Date(user.createdAt).toLocaleDateString()}`)
        
        if (user.company) {
          console.log(`  Company: ${user.company}`)
        }
        
        if (user.team) {
          console.log(`  Team: ${user.team.name} (${user.team.role})`)
        }

        // Show usage stats
        if (user.usage) {
          console.log(chalk.bold.cyan('\n📊 Usage This Month:\n'))
          console.log(`  AI Generations: ${user.usage.aiGenerations}/${user.usage.aiGenerationsLimit}`)
          console.log(`  API Calls: ${user.usage.apiCalls}/${user.usage.apiCallsLimit}`)
          console.log(`  Storage Used: ${this.formatBytes(user.usage.storageUsed)}/${this.formatBytes(user.usage.storageLimit)}`)
        }

        // Show subscription info
        if (user.subscription) {
          console.log(chalk.bold.cyan('\n💳 Subscription:\n'))
          console.log(`  Status: ${user.subscription.status}`)
          console.log(`  Renews: ${new Date(user.subscription.renewsAt).toLocaleDateString()}`)
        }
        
      } catch (error: any) {
        spinner.fail('Failed to fetch latest account info')
        
        // Fall back to cached info
        console.log(chalk.bold.cyan('\n👤 Cached Account Information:\n'))
        console.log(`  Email: ${currentUser.email}`)
        console.log(`  Name: ${currentUser.name || 'N/A'}`)
        console.log(chalk.yellow('\n⚠️  Showing cached information. Connect to internet for latest data.'))
      }
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error.message}`))
      process.exit(1)
    }
  }

  private async collectLoginCredentials(options: { email?: string; password?: string }) {
    const questions: any[] = []

    if (!options.email) {
      questions.push({
        type: 'input',
        name: 'email',
        message: 'Email:',
        validate: (value: string) => {
          if (!validateEmail(value)) {
            return 'Please enter a valid email address'
          }
          return true
        }
      })
    }

    if (!options.password) {
      questions.push({
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*'
      })
    }

    const answers = await inquirer.prompt(questions)
    
    return {
      email: options.email || answers.email,
      password: options.password || answers.password
    }
  }

  private async collectRegistrationData(options: any) {
    const questions: any[] = []

    if (!options.email) {
      questions.push({
        type: 'input',
        name: 'email',
        message: 'Email address:',
        validate: (value: string) => {
          if (!validateEmail(value)) {
            return 'Please enter a valid email address'
          }
          return true
        }
      })
    }

    if (!options.name) {
      questions.push({
        type: 'input',
        name: 'name',
        message: 'Full name:',
        validate: (value: string) => value.length > 0 || 'Name is required'
      })
    }

    questions.push({
      type: 'password',
      name: 'password',
      message: 'Password (min 8 chars, mixed case, numbers):',
      mask: '*',
      validate: (value: string) => {
        if (value.length < 8) {
          return 'Password must be at least 8 characters'
        }
        return true
      }
    })

    questions.push({
      type: 'password',
      name: 'confirmPassword',
      message: 'Confirm password:',
      mask: '*',
      validate: (value: string, answers: any) => {
        if (value !== answers.password) {
          return 'Passwords do not match'
        }
        return true
      }
    })

    if (!options.company) {
      questions.push({
        type: 'input',
        name: 'company',
        message: 'Company name (optional):'
      })
    }

    questions.push({
      type: 'confirm',
      name: 'acceptTerms',
      message: 'Do you accept the Terms of Service and Privacy Policy?',
      default: false
    })

    questions.push({
      type: 'confirm',
      name: 'marketingEmails',
      message: 'Would you like to receive product updates and tips?',
      default: true
    })

    const answers = await inquirer.prompt(questions)
    
    if (!answers.acceptTerms) {
      console.error(chalk.red('❌ You must accept the Terms of Service to create an account'))
      process.exit(1)
    }

    return {
      email: options.email || answers.email,
      name: options.name || answers.name,
      password: answers.password,
      company: options.company || answers.company || undefined,
      acceptTerms: answers.acceptTerms,
      marketingEmails: answers.marketingEmails
    }
  }

  private validatePasswordStrength(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasMinLength = password.length >= 8
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasMinLength
  }

  private showPlanFeatures(plan: string) {
    console.log(chalk.cyan('\n✨ Your plan features:'))
    
    switch (plan?.toLowerCase()) {
      case 'pro':
        console.log(chalk.gray('  • Unlimited AI component generations'))
        console.log(chalk.gray('  • Priority support'))
        console.log(chalk.gray('  • Team collaboration (up to 5 members)'))
        console.log(chalk.gray('  • Private component registry'))
        console.log(chalk.gray('  • Advanced analytics'))
        break
      
      case 'enterprise':
        console.log(chalk.gray('  • Everything in Pro'))
        console.log(chalk.gray('  • Unlimited team members'))
        console.log(chalk.gray('  • Custom AI model training'))
        console.log(chalk.gray('  • SLA guarantee'))
        console.log(chalk.gray('  • Dedicated support'))
        break
      
      default: // Free plan
        console.log(chalk.gray('  • 100 AI generations per month'))
        console.log(chalk.gray('  • Component catalog access'))
        console.log(chalk.gray('  • Community support'))
        console.log(chalk.yellow('\n💡 Upgrade to Pro for unlimited AI generations!'))
        console.log(chalk.gray('   Visit https://revolutionary-ui.com/pricing'))
    }
  }

  private async sendWelcomeEmail(email: string) {
    try {
      await this.apiClient.post('/auth/welcome-email', { email })
    } catch (error) {
      // Silent fail - don't interrupt user flow
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }
}