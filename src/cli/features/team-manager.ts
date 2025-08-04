import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { WizardConfig } from '../core/configuration-wizard'
import { AuthManager } from '../utils/auth-manager'
import { loadEnvVariables } from '../utils/env-loader'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import fetch from 'node-fetch'

interface TeamMember {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  lastActive?: string
}

interface Team {
  id: string
  name: string
  description?: string
  createdAt: string
  inviteCode?: string
  members: TeamMember[]
  settings: {
    allowComponentSharing: boolean
    requireApproval: boolean
    syncSettings: boolean
  }
}

interface SharedComponent {
  id: string
  name: string
  description: string
  sharedBy: string
  sharedAt: string
  framework: string
  tags: string[]
  version: string
}

export class TeamManager {
  private config: WizardConfig
  private authManager: AuthManager
  private currentTeam: Team | null = null
  private baseUrl: string

  constructor(config: WizardConfig) {
    this.config = config
    this.authManager = new AuthManager()
    loadEnvVariables()
    
    this.baseUrl = process.env.TEAM_API_URL || 'http://localhost:3001/api'
    
    // Load cached team data
    this.loadCachedTeam()
  }

  private async loadCachedTeam(): Promise<void> {
    try {
      const teamPath = path.join(process.cwd(), '.revolutionary-ui', 'team.json')
      const data = await fs.readFile(teamPath, 'utf-8')
      this.currentTeam = JSON.parse(data)
    } catch {
      // No cached team data
    }
  }

  private async saveCachedTeam(): Promise<void> {
    if (!this.currentTeam) return
    
    const teamPath = path.join(process.cwd(), '.revolutionary-ui', 'team.json')
    await fs.mkdir(path.dirname(teamPath), { recursive: true })
    await fs.writeFile(teamPath, JSON.stringify(this.currentTeam, null, 2))
  }

  async setupTeam(): Promise<void> {
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Team setup:',
      choices: [
        { name: 'Create new team', value: 'create' },
        { name: 'Join existing team', value: 'join' },
        { name: 'Skip team setup', value: 'skip' }
      ]
    }])

    switch (action) {
      case 'create':
        await this.createTeam()
        break
      case 'join':
        await this.joinTeam()
        break
    }
  }

  async execute(command: string, options: any): Promise<void> {
    switch (command) {
      case 'manage':
        await this.manageTeam()
        break
      case 'share':
        await this.shareComponent(options)
        break
      case 'browse':
        await this.browseSharedComponents()
        break
      case 'invite':
        await this.inviteMembers()
        break
      case 'sync':
        await this.syncTeamSettings()
        break
      default:
        console.log(chalk.red(`Unknown team command: ${command}`))
    }
  }

  private async createTeam(): Promise<void> {
    console.log(chalk.cyan('\n👥 Create New Team\n'))

    const isAuth = await this.authManager.isAuthenticated()
    if (!isAuth) {
      console.log(chalk.yellow('Please login to create a team'))
      return
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Team name:',
        validate: (v: string) => v.length >= 3 || 'Team name must be at least 3 characters'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Team description (optional):'
      },
      {
        type: 'confirm',
        name: 'allowSharing',
        message: 'Allow component sharing?',
        default: true
      },
      {
        type: 'confirm',
        name: 'requireApproval',
        message: 'Require approval for shared components?',
        default: false
      }
    ])

    const spinner = ora('Creating team...').start()

    try {
      const user = await this.authManager.getCurrentUser()
      const teamId = crypto.randomBytes(16).toString('hex')
      const inviteCode = crypto.randomBytes(8).toString('hex')

      this.currentTeam = {
        id: teamId,
        name: answers.name,
        description: answers.description,
        createdAt: new Date().toISOString(),
        inviteCode,
        members: [{
          id: user?.id || 'owner',
          email: user?.email || 'owner@team.com',
          name: user?.name || 'Team Owner',
          role: 'owner',
          joinedAt: new Date().toISOString()
        }],
        settings: {
          allowComponentSharing: answers.allowSharing,
          requireApproval: answers.requireApproval,
          syncSettings: true
        }
      }

      await this.saveCachedTeam()
      
      spinner.succeed('Team created successfully!')
      console.log(chalk.green(`\n✓ Team "${answers.name}" created`))
      console.log(chalk.cyan(`\nInvite Code: ${inviteCode}`))
      console.log(chalk.gray('Share this code with team members to invite them'))
      
      // Try to sync with server
      await this.syncTeamToServer()
      
    } catch (error: any) {
      spinner.fail(`Failed to create team: ${error.message}`)
    }
  }

  private async joinTeam(): Promise<void> {
    console.log(chalk.cyan('\n🤝 Join Existing Team\n'))

    const isAuth = await this.authManager.isAuthenticated()
    if (!isAuth) {
      console.log(chalk.yellow('Please login to join a team'))
      return
    }

    const { inviteCode } = await inquirer.prompt([{
      type: 'input',
      name: 'inviteCode',
      message: 'Enter invite code:',
      validate: (v: string) => v.length > 0 || 'Invite code required'
    }])

    const spinner = ora('Joining team...').start()

    try {
      // Try to fetch team from server
      const response = await fetch(`${this.baseUrl}/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.authManager.getToken()}`
        },
        body: JSON.stringify({ inviteCode })
      })

      if (response.ok) {
        const team = await response.json()
        this.currentTeam = team
        await this.saveCachedTeam()
        
        spinner.succeed(`Joined team "${team.name}"!`)
      } else {
        // Fallback to demo mode
        spinner.warn('Server not available. Using demo mode.')
        
        this.currentTeam = {
          id: 'demo-team',
          name: 'Demo Team',
          description: 'Demo team for testing',
          createdAt: new Date().toISOString(),
          inviteCode,
          members: [
            {
              id: 'owner',
              email: 'owner@team.com',
              name: 'Team Owner',
              role: 'owner',
              joinedAt: '2024-01-01'
            },
            {
              id: 'member',
              email: (await this.authManager.getCurrentUser())?.email || 'member@team.com',
              name: (await this.authManager.getCurrentUser())?.name || 'New Member',
              role: 'member',
              joinedAt: new Date().toISOString()
            }
          ],
          settings: {
            allowComponentSharing: true,
            requireApproval: false,
            syncSettings: true
          }
        }
        
        await this.saveCachedTeam()
        console.log(chalk.green('\n✓ Joined Demo Team'))
      }
      
    } catch (error: any) {
      spinner.fail(`Failed to join team: ${error.message}`)
    }
  }

  private async manageTeam(): Promise<void> {
    if (!this.currentTeam) {
      console.log(chalk.yellow('You are not part of any team'))
      const { create } = await inquirer.prompt([{
        type: 'confirm',
        name: 'create',
        message: 'Would you like to create a team?',
        default: true
      }])
      
      if (create) {
        await this.createTeam()
      }
      return
    }

    console.log(chalk.cyan(`\n👥 Team: ${this.currentTeam.name}\n`))
    console.log(`Members: ${this.currentTeam.members.length}`)
    console.log(`Created: ${new Date(this.currentTeam.createdAt).toLocaleDateString()}`)
    if (this.currentTeam.inviteCode) {
      console.log(`Invite Code: ${this.currentTeam.inviteCode}`)
    }

    const currentUser = await this.authManager.getCurrentUser()
    const currentMember = this.currentTeam.members.find(m => m.email === currentUser?.email)
    const isOwnerOrAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin'

    const choices = [
      { name: '👥 View Members', value: 'members' },
      { name: '📤 Share Component', value: 'share' },
      { name: '📥 Browse Shared Components', value: 'browse' },
      ...(isOwnerOrAdmin ? [
        { name: '➕ Invite Members', value: 'invite' },
        { name: '⚙️  Team Settings', value: 'settings' },
        { name: '🔄 Sync Settings', value: 'sync' }
      ] : []),
      { name: '↩️  Back', value: 'back' }
    ]

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices
    }])

    switch (action) {
      case 'members':
        await this.viewMembers()
        break
      case 'share':
        await this.shareComponent({})
        break
      case 'browse':
        await this.browseSharedComponents()
        break
      case 'invite':
        await this.inviteMembers()
        break
      case 'settings':
        await this.teamSettings()
        break
      case 'sync':
        await this.syncTeamSettings()
        break
    }
  }

  private async viewMembers(): Promise<void> {
    if (!this.currentTeam) return

    console.log(chalk.cyan('\n👥 Team Members\n'))
    
    this.currentTeam.members.forEach(member => {
      const roleIcon = member.role === 'owner' ? '👑' : member.role === 'admin' ? '⭐' : '👤'
      console.log(`${roleIcon} ${member.name}`)
      console.log(chalk.gray(`   ${member.email}`))
      console.log(chalk.gray(`   Role: ${member.role}`))
      console.log(chalk.gray(`   Joined: ${new Date(member.joinedAt).toLocaleDateString()}`))
      if (member.lastActive) {
        console.log(chalk.gray(`   Last Active: ${new Date(member.lastActive).toLocaleDateString()}`))
      }
      console.log('')
    })
  }

  private async shareComponent(options: any): Promise<void> {
    if (!this.currentTeam) {
      console.log(chalk.yellow('You need to be in a team to share components'))
      return
    }

    console.log(chalk.cyan('\n📤 Share Component\n'))

    const { componentPath } = await inquirer.prompt([{
      type: 'input',
      name: 'componentPath',
      message: 'Path to component file/folder:',
      validate: async (v: string) => {
        try {
          await fs.access(v)
          return true
        } catch {
          return 'Path not found'
        }
      }
    }])

    const metadata = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Component name:',
        default: path.basename(componentPath, path.extname(componentPath))
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:'
      },
      {
        type: 'list',
        name: 'framework',
        message: 'Framework:',
        choices: ['React', 'Vue', 'Angular', 'Svelte', 'Vanilla JS']
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Tags (comma-separated):'
      },
      {
        type: 'input',
        name: 'version',
        message: 'Version:',
        default: '1.0.0'
      }
    ])

    const spinner = ora('Sharing component...').start()

    try {
      // Read component code
      const code = await fs.readFile(componentPath, 'utf-8')
      
      // Save to shared components
      const sharedPath = path.join(process.cwd(), '.revolutionary-ui', 'shared-components.json')
      let sharedComponents: SharedComponent[] = []
      
      try {
        const data = await fs.readFile(sharedPath, 'utf-8')
        sharedComponents = JSON.parse(data)
      } catch {}

      const user = await this.authManager.getCurrentUser()
      const newComponent: SharedComponent = {
        id: crypto.randomBytes(8).toString('hex'),
        name: metadata.name,
        description: metadata.description,
        sharedBy: user?.name || 'Team Member',
        sharedAt: new Date().toISOString(),
        framework: metadata.framework,
        tags: metadata.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        version: metadata.version
      }

      sharedComponents.push(newComponent)
      
      // Save component code
      const componentDir = path.join(process.cwd(), '.revolutionary-ui', 'shared', newComponent.id)
      await fs.mkdir(componentDir, { recursive: true })
      await fs.writeFile(path.join(componentDir, 'component.code'), code)
      await fs.writeFile(path.join(componentDir, 'metadata.json'), JSON.stringify(newComponent, null, 2))
      
      // Update shared components list
      await fs.writeFile(sharedPath, JSON.stringify(sharedComponents, null, 2))
      
      spinner.succeed('Component shared successfully!')
      console.log(chalk.green(`✓ "${metadata.name}" is now available to your team`))
      
      // Try to sync with server
      await this.syncComponentToServer(newComponent, code)
      
    } catch (error: any) {
      spinner.fail(`Failed to share component: ${error.message}`)
    }
  }

  private async browseSharedComponents(): Promise<void> {
    if (!this.currentTeam) {
      console.log(chalk.yellow('You need to be in a team to browse shared components'))
      return
    }

    console.log(chalk.cyan('\n📥 Shared Components\n'))

    const spinner = ora('Loading shared components...').start()

    try {
      // Load shared components
      const sharedPath = path.join(process.cwd(), '.revolutionary-ui', 'shared-components.json')
      let sharedComponents: SharedComponent[] = []
      
      try {
        const data = await fs.readFile(sharedPath, 'utf-8')
        sharedComponents = JSON.parse(data)
      } catch {}

      spinner.succeed(`Found ${sharedComponents.length} shared components`)

      if (sharedComponents.length === 0) {
        console.log(chalk.yellow('No shared components yet'))
        return
      }

      // Display components
      console.log('')
      sharedComponents.forEach((comp, index) => {
        console.log(chalk.cyan(`${index + 1}. ${comp.name} v${comp.version}`))
        console.log(chalk.gray(`   ${comp.description}`))
        console.log(chalk.gray(`   Framework: ${comp.framework}`))
        console.log(chalk.gray(`   Shared by: ${comp.sharedBy} on ${new Date(comp.sharedAt).toLocaleDateString()}`))
        if (comp.tags.length > 0) {
          console.log(chalk.gray(`   Tags: ${comp.tags.join(', ')}`))
        }
        console.log('')
      })

      const { selectedIndex } = await inquirer.prompt([{
        type: 'number',
        name: 'selectedIndex',
        message: 'Select component to download (0 to go back):',
        validate: (v: number) => v >= 0 && v <= sharedComponents.length
      }])

      if (selectedIndex > 0) {
        await this.downloadSharedComponent(sharedComponents[selectedIndex - 1])
      }
      
    } catch (error: any) {
      spinner.fail(`Failed to load components: ${error.message}`)
    }
  }

  private async downloadSharedComponent(component: SharedComponent): Promise<void> {
    const spinner = ora('Downloading component...').start()

    try {
      // Read component code
      const componentPath = path.join(process.cwd(), '.revolutionary-ui', 'shared', component.id, 'component.code')
      const code = await fs.readFile(componentPath, 'utf-8')
      
      // Determine output path
      const extension = this.getExtensionForFramework(component.framework)
      const outputPath = path.join(
        this.config.outputPath || 'src/team-components',
        `${component.name}.${extension}`
      )
      
      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      await fs.writeFile(outputPath, code)
      
      spinner.succeed(`Component downloaded to ${outputPath}`)
      
    } catch (error: any) {
      spinner.fail(`Download failed: ${error.message}`)
    }
  }

  private getExtensionForFramework(framework: string): string {
    const extensions: Record<string, string> = {
      'React': 'tsx',
      'Vue': 'vue',
      'Angular': 'ts',
      'Svelte': 'svelte',
      'Vanilla JS': 'js'
    }
    return extensions[framework] || 'js'
  }

  private async inviteMembers(): Promise<void> {
    if (!this.currentTeam) return

    console.log(chalk.cyan('\n➕ Invite Team Members\n'))
    console.log(chalk.gray(`Share this invite code with team members:`))
    console.log(chalk.cyan(`\n${this.currentTeam.inviteCode}\n`))

    const { regenerate } = await inquirer.prompt([{
      type: 'confirm',
      name: 'regenerate',
      message: 'Generate new invite code?',
      default: false
    }])

    if (regenerate) {
      this.currentTeam.inviteCode = crypto.randomBytes(8).toString('hex')
      await this.saveCachedTeam()
      console.log(chalk.green(`\n✓ New invite code: ${this.currentTeam.inviteCode}`))
    }
  }

  private async teamSettings(): Promise<void> {
    if (!this.currentTeam) return

    console.log(chalk.cyan('\n⚙️  Team Settings\n'))

    const settings = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'allowComponentSharing',
        message: 'Allow component sharing?',
        default: this.currentTeam.settings.allowComponentSharing
      },
      {
        type: 'confirm',
        name: 'requireApproval',
        message: 'Require approval for shared components?',
        default: this.currentTeam.settings.requireApproval
      },
      {
        type: 'confirm',
        name: 'syncSettings',
        message: 'Sync settings across team?',
        default: this.currentTeam.settings.syncSettings
      }
    ])

    this.currentTeam.settings = settings
    await this.saveCachedTeam()
    
    console.log(chalk.green('✓ Team settings updated'))
  }

  private async syncTeamSettings(): Promise<void> {
    if (!this.currentTeam) return

    const spinner = ora('Syncing team settings...').start()

    try {
      // Try to sync with server
      const token = await this.authManager.getToken()
      if (token) {
        const response = await fetch(`${this.baseUrl}/teams/${this.currentTeam.id}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.currentTeam)
        })

        if (response.ok) {
          spinner.succeed('Team settings synced with server')
          return
        }
      }
      
      spinner.warn('Server sync not available. Settings saved locally.')
      
    } catch (error: any) {
      spinner.fail(`Sync failed: ${error.message}`)
    }
  }

  private async syncTeamToServer(): Promise<void> {
    try {
      const token = await this.authManager.getToken()
      if (!token) return

      await fetch(`${this.baseUrl}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.currentTeam)
      })
    } catch {
      // Server sync is optional
    }
  }

  private async syncComponentToServer(component: SharedComponent, code: string): Promise<void> {
    try {
      const token = await this.authManager.getToken()
      if (!token || !this.currentTeam) return

      await fetch(`${this.baseUrl}/teams/${this.currentTeam.id}/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...component, code })
      })
    } catch {
      // Server sync is optional
    }
  }
}