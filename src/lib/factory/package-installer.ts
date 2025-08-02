/**
 * Revolutionary UI Factory - Package Installer
 * Handles package installation, updates, and configuration
 */

import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import chalk from 'chalk'
import ora, { Ora } from 'ora'
import { WizardResult, ConfigFile } from './setup-wizard'

const execAsync = promisify(exec)

export interface InstallOptions {
  dryRun: boolean
  verbose: boolean
  force: boolean
  skipConfigFiles: boolean
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
}

export interface InstallResult {
  success: boolean
  installedPackages: string[]
  failedPackages: string[]
  configFilesCreated: string[]
  errors: string[]
  warnings: string[]
}

export class PackageInstaller {
  private options: InstallOptions
  private projectPath: string
  private spinner: Ora

  constructor(projectPath: string, options: InstallOptions) {
    this.projectPath = projectPath
    this.options = options
    this.spinner = ora()
  }

  /**
   * Install packages based on wizard results
   */
  async install(wizardResult: WizardResult): Promise<InstallResult> {
    const result: InstallResult = {
      success: true,
      installedPackages: [],
      failedPackages: [],
      configFilesCreated: [],
      errors: [],
      warnings: []
    }

    console.log(chalk.bold.blue('\n📦 Installing packages...\n'))

    // Install packages
    for (const command of wizardResult.installCommands) {
      const success = await this.runInstallCommand(command, result)
      if (!success && !this.options.force) {
        result.success = false
        break
      }
    }

    // Create config files
    if (!this.options.skipConfigFiles && result.success) {
      await this.createConfigFiles(wizardResult.configFiles, result)
    }

    // Run post-install tasks
    if (result.success) {
      await this.runPostInstallTasks(wizardResult, result)
    }

    return result
  }

  /**
   * Run a single install command
   */
  private async runInstallCommand(command: string, result: InstallResult): Promise<boolean> {
    if (this.options.dryRun) {
      console.log(chalk.gray(`[DRY RUN] Would run: ${command}`))
      return true
    }

    this.spinner.start(chalk.cyan(`Running: ${command}`))

    try {
      if (this.options.verbose) {
        // Use spawn for real-time output
        await this.runCommandWithOutput(command)
      } else {
        // Use exec for silent execution
        await execAsync(command, { cwd: this.projectPath })
      }

      this.spinner.succeed(chalk.green(`✅ ${command}`))
      
      // Extract package names from command
      const packages = this.extractPackagesFromCommand(command)
      result.installedPackages.push(...packages)
      
      return true
    } catch (error: any) {
      this.spinner.fail(chalk.red(`❌ Failed: ${command}`))
      result.errors.push(`Failed to run: ${command}\nError: ${error.message}`)
      
      const packages = this.extractPackagesFromCommand(command)
      result.failedPackages.push(...packages)
      
      // Check for common errors
      if (error.message.includes('peer dep')) {
        result.warnings.push('Peer dependency issues detected. You may need to use --legacy-peer-deps')
      }
      
      return false
    }
  }

  /**
   * Run command with real-time output
   */
  private runCommandWithOutput(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ')
      const child = spawn(cmd, args, {
        cwd: this.projectPath,
        shell: true,
        stdio: 'inherit'
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Command failed with exit code ${code}`))
        }
      })

      child.on('error', reject)
    })
  }

  /**
   * Create configuration files
   */
  private async createConfigFiles(configFiles: ConfigFile[], result: InstallResult): Promise<void> {
    console.log(chalk.bold.blue('\n📝 Creating configuration files...\n'))

    for (const file of configFiles) {
      const filePath = path.join(this.projectPath, file.filename)
      
      try {
        // Check if file already exists
        const exists = await this.fileExists(filePath)
        
        if (exists && !this.options.force) {
          const backupPath = `${filePath}.backup`
          
          if (this.options.dryRun) {
            console.log(chalk.gray(`[DRY RUN] Would backup: ${file.filename} to ${path.basename(backupPath)}`))
          } else {
            await fs.copyFile(filePath, backupPath)
            result.warnings.push(`Backed up existing ${file.filename} to ${path.basename(backupPath)}`)
          }
        }

        if (this.options.dryRun) {
          console.log(chalk.gray(`[DRY RUN] Would create: ${file.filename}`))
          console.log(chalk.gray(`Content preview:\n${file.content.substring(0, 200)}...`))
        } else {
          await fs.writeFile(filePath, file.content, 'utf-8')
          result.configFilesCreated.push(file.filename)
          console.log(chalk.green(`✅ Created ${file.filename} - ${file.description}`))
        }
      } catch (error: any) {
        result.errors.push(`Failed to create ${file.filename}: ${error.message}`)
        console.log(chalk.red(`❌ Failed to create ${file.filename}`))
      }
    }
  }

  /**
   * Run post-install tasks
   */
  private async runPostInstallTasks(wizardResult: WizardResult, result: InstallResult): Promise<void> {
    console.log(chalk.bold.blue('\n🔧 Running post-install tasks...\n'))

    // Update package.json scripts
    await this.updatePackageJsonScripts(wizardResult, result)

    // Create example components
    if (wizardResult.selections.uiLibraries.length > 0) {
      await this.createExampleComponents(wizardResult, result)
    }

    // Set up git hooks if needed
    if (wizardResult.selections.devTools.includes('eslint') || 
        wizardResult.selections.devTools.includes('prettier')) {
      await this.setupGitHooks(result)
    }
  }

  /**
   * Update package.json scripts
   */
  private async updatePackageJsonScripts(wizardResult: WizardResult, result: InstallResult): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json')
    
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(content)
      
      const newScripts: Record<string, string> = {}

      // Add TypeScript scripts
      if (wizardResult.selections.devTools.includes('typescript')) {
        newScripts['type-check'] = 'tsc --noEmit'
        newScripts['type-check:watch'] = 'tsc --noEmit --watch'
      }

      // Add linting scripts
      if (wizardResult.selections.devTools.includes('eslint')) {
        newScripts['lint'] = 'eslint . --ext .js,.jsx,.ts,.tsx'
        newScripts['lint:fix'] = 'eslint . --ext .js,.jsx,.ts,.tsx --fix'
      }

      // Add formatting scripts
      if (wizardResult.selections.devTools.includes('prettier')) {
        newScripts['format'] = 'prettier --write .'
        newScripts['format:check'] = 'prettier --check .'
      }

      // Add Revolutionary UI scripts
      newScripts['ui:generate'] = 'revolutionary-ui generate'
      newScripts['ui:analyze'] = 'revolutionary-ui analyze'
      newScripts['ui:setup'] = 'revolutionary-ui setup'

      // Merge scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        ...newScripts
      }

      if (this.options.dryRun) {
        console.log(chalk.gray('[DRY RUN] Would add scripts to package.json:'))
        Object.entries(newScripts).forEach(([key, value]) => {
          console.log(chalk.gray(`  ${key}: ${value}`))
        })
      } else {
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')
        console.log(chalk.green('✅ Updated package.json scripts'))
      }
    } catch (error: any) {
      result.warnings.push(`Could not update package.json scripts: ${error.message}`)
    }
  }

  /**
   * Create example components
   */
  private async createExampleComponents(wizardResult: WizardResult, result: InstallResult): Promise<void> {
    const componentsDir = path.join(this.projectPath, 'src', 'components', 'examples')
    
    if (this.options.dryRun) {
      console.log(chalk.gray(`[DRY RUN] Would create example components in ${componentsDir}`))
      return
    }

    try {
      await fs.mkdir(componentsDir, { recursive: true })

      // Create a simple example component
      const exampleComponent = `import React from 'react'
${wizardResult.selections.uiLibraries.includes('@mui/material') ? "import { Button } from '@mui/material'" : ''}
${wizardResult.selections.uiLibraries.includes('antd') ? "import { Button } from 'antd'" : ''}
${wizardResult.selections.iconLibraries.includes('lucide-react') ? "import { Sparkles } from 'lucide-react'" : ''}

export const ExampleComponent = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Welcome to Revolutionary UI Factory! 
        ${wizardResult.selections.iconLibraries.includes('lucide-react') ? '<Sparkles className="inline w-6 h-6 ml-2" />' : ''}
      </h2>
      <p className="mb-4">
        You've successfully set up your project with Revolutionary UI Factory.
        Start building amazing components with 60-95% less code!
      </p>
      ${wizardResult.selections.uiLibraries.length > 0 ? 
        '<Button variant="contained" color="primary">Get Started</Button>' : 
        '<button className="px-4 py-2 bg-blue-500 text-white rounded">Get Started</button>'
      }
    </div>
  )
}
`

      await fs.writeFile(
        path.join(componentsDir, 'ExampleComponent.tsx'),
        exampleComponent,
        'utf-8'
      )

      console.log(chalk.green('✅ Created example components'))
    } catch (error: any) {
      result.warnings.push(`Could not create example components: ${error.message}`)
    }
  }

  /**
   * Set up git hooks
   */
  private async setupGitHooks(result: InstallResult): Promise<void> {
    if (this.options.dryRun) {
      console.log(chalk.gray('[DRY RUN] Would set up git hooks for linting and formatting'))
      return
    }

    try {
      // Check if husky is installed
      const huskyInstalled = await this.isPackageInstalled('husky')
      
      if (!huskyInstalled) {
        console.log(chalk.yellow('ℹ️  Consider installing husky for git hooks:'))
        console.log(chalk.gray(`  ${this.options.packageManager} ${this.options.packageManager === 'npm' ? 'install' : 'add'} -D husky lint-staged`))
        console.log(chalk.gray('  npx husky install'))
      }
    } catch (error: any) {
      // Git hooks are optional, so just log a warning
      result.warnings.push('Could not set up git hooks')
    }
  }

  // Helper methods

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private async isPackageInstalled(packageName: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json')
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(content)
      
      return (
        packageName in (packageJson.dependencies || {}) ||
        packageName in (packageJson.devDependencies || {})
      )
    } catch {
      return false
    }
  }

  private extractPackagesFromCommand(command: string): string[] {
    // Remove the package manager command and flags
    const parts = command.split(' ')
    const packages: string[] = []
    
    let skipNext = false
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      
      if (skipNext) {
        skipNext = false
        continue
      }
      
      if (part.startsWith('-')) {
        // Skip flags and their values
        if (part === '-D' || part === '--save-dev') continue
        if (part === '-g' || part === '--global') continue
        skipNext = true
        continue
      }
      
      if (part === 'install' || part === 'add') continue
      
      packages.push(part)
    }
    
    return packages
  }
}