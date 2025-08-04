/**
 * Revolutionary UI Factory - Interactive Setup Wizard
 * Guides users through package selection and configuration
 */

import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import { ProjectAnalysis } from './project-detector'
import { AnalysisReport } from './project-analyzer'
import { AIAnalysisResult } from './ai-analyzer'
import { FRAMEWORK_CONFIGS } from '../../config/frameworks'
import { UI_LIBRARIES } from '../../config/ui-libraries'
import { ICON_LIBRARIES } from '../../config/icon-libraries'
import { DESIGN_TOOLS, COLOR_TOOLS, FONTS } from '../../config/design-tools'

export interface WizardOptions {
  interactive: boolean
  autoInstall: boolean
  updateExisting: boolean
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
}

export interface SelectionResult {
  frameworks: string[]
  uiLibraries: string[]
  iconLibraries: string[]
  designTools: string[]
  colorTools: string[]
  fonts: string[]
  utilities: string[]
  devTools: string[]
}

export interface WizardResult {
  selections: SelectionResult
  installCommands: string[]
  configFiles: ConfigFile[]
  nextSteps: string[]
}

export interface ConfigFile {
  filename: string
  content: string
  description: string
}

export class SetupWizard {
  private analysis: ProjectAnalysis
  private report: AnalysisReport
  private options: Partial<WizardOptions>
  private aiResults: AIAnalysisResult | null

  constructor(
    analysis: ProjectAnalysis, 
    report: AnalysisReport, 
    options: Partial<WizardOptions>,
    aiResults: AIAnalysisResult | null
  ) {
    this.analysis = analysis
    this.report = report
    this.options = options
    this.aiResults = aiResults
  }

  /**
   * Run the interactive setup wizard
   */
  async run(): Promise<WizardResult> {
    console.clear()
    this.printWelcome()
    this.printAnalysisSummary()

    let selections: SelectionResult

    if (this.options.interactive) {
      selections = await this.interactiveSelection()
    } else {
      selections = await this.automaticSelection()
    }

    const installCommands = this.generateInstallCommands(selections)
    const configFiles = this.generateConfigFiles(selections)
    const nextSteps = this.generateNextSteps(selections)

    return {
      selections,
      installCommands,
      configFiles,
      nextSteps
    }
  }

  /**
   * Print welcome message
   */
  private printWelcome(): void {
    console.log(chalk.bold.magenta('\n🏭 Revolutionary UI Factory Setup Wizard\n'))
    console.log(chalk.gray('Transform your development with 60-95% less code!\n'))
  }

  /**
   * Print analysis summary
   */
  private printAnalysisSummary(): void {
    const { summary } = this.report

    console.log(chalk.bold('📊 Project Analysis Summary:\n'))
    console.log(chalk.cyan('Project:'), this.analysis.projectName)
    console.log(chalk.cyan('Package Manager:'), this.analysis.packageManager)
    console.log(chalk.cyan('TypeScript:'), this.analysis.hasTypeScript ? '✅' : '❌')
    console.log(chalk.cyan('Tailwind CSS:'), this.analysis.hasTailwind ? '✅' : '❌')
    
    console.log(chalk.cyan('\nCurrent Stack:'))
    if (summary.frameworkStack.length > 0) {
      console.log('  Frameworks:', summary.frameworkStack.join(', '))
    }
    if (summary.uiStack.length > 0) {
      console.log('  UI Libraries:', summary.uiStack.join(', '))
    }
    
    console.log(chalk.cyan('\nCoverage:'))
    console.log(`  Overall: ${summary.coverage.overall}%`)
    console.log(`  Frameworks: ${summary.coverage.frameworks}%`)
    console.log(`  UI Libraries: ${summary.coverage.uiLibraries}%`)
    console.log(`  Icons: ${summary.coverage.icons}%`)
    console.log(`  Design Tools: ${summary.coverage.designTools}%`)
    
    if (this.report.compatibility.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'))
      this.report.compatibility.warnings.forEach(warning => {
        console.log(`  - ${warning}`)
      })
    }
    
    console.log('')
  }

  /**
   * Interactive package selection
   */
  private async interactiveSelection(): Promise<SelectionResult> {
    const selections: SelectionResult = {
      frameworks: [],
      uiLibraries: [],
      iconLibraries: [],
      designTools: [],
      colorTools: [],
      fonts: [],
      utilities: [],
      devTools: []
    }

    // Ask about missing features first
    if (this.report.missingFeatures.length > 0) {
      const { addMissing } = await inquirer.prompt([{
        type: 'confirm',
        name: 'addMissing',
        message: 'Would you like to add the recommended missing features?',
        default: true
      }])

      if (addMissing) {
        for (const feature of this.report.missingFeatures) {
          const { addFeature } = await inquirer.prompt([{
            type: 'confirm',
            name: 'addFeature',
            message: `Add ${feature.feature}? (${feature.description})`,
            default: feature.impact !== 'nice-to-have'
          }])

          if (addFeature) {
            const { selected } = await inquirer.prompt({
              type: 'checkbox',
              name: 'selected',
              message: `Select ${feature.feature} packages:`,
              choices: feature.suggestedPackages.map(pkg => ({
                name: pkg,
                checked: feature.suggestedPackages.indexOf(pkg) === 0
              }))
            } as any)

            // Add to appropriate category
            this.categorizePackages(selected, selections)
          }
        }
      }
    }

    // Ask about updates
    const needsUpdate = [
      ...this.analysis.frameworks,
      ...this.analysis.uiLibraries,
      ...this.analysis.iconLibraries
    ].filter(pkg => pkg.needsUpdate)

    if (needsUpdate.length > 0 && this.options.updateExisting) {
      const { updatePackages } = await inquirer.prompt([{
        type: 'confirm',
        name: 'updatePackages',
        message: `${needsUpdate.length} packages have updates available. Update them?`,
        default: true
      }])

      if (updatePackages) {
        const { packagesToUpdate } = await inquirer.prompt([{
          type: 'checkbox',
          name: 'packagesToUpdate',
          message: 'Select packages to update:',
          choices: needsUpdate.map(pkg => ({
            name: `${pkg.name} (${pkg.currentVersion} → ${pkg.latestVersion})`,
            value: pkg.name,
            checked: true
          }))
        }])

        // Add update commands will be handled in generateInstallCommands
        selections.frameworks.push(...packagesToUpdate.filter((p: string) => 
          this.analysis.frameworks.some(f => f.name === p)
        ))
      }
    }

    // Browse additional packages
    const { browseMore } = await inquirer.prompt([{
      type: 'confirm',
      name: 'browseMore',
      message: 'Would you like to browse additional packages?',
      default: false
    }])

    if (browseMore) {
      await this.browsePackages(selections)
    }

    // Development tools
    const { addDevTools } = await inquirer.prompt([{
      type: 'confirm',
      name: 'addDevTools',
      message: 'Configure development tools (TypeScript, ESLint, Prettier)?',
      default: !this.analysis.hasTypeScript || !this.analysis.hasESLint
    }])

    if (addDevTools) {
      const devToolChoices = []
      
      if (!this.analysis.hasTypeScript) {
        devToolChoices.push({ name: 'TypeScript', value: 'typescript', checked: true })
      }
      if (!this.analysis.hasESLint) {
        devToolChoices.push({ name: 'ESLint', value: 'eslint', checked: true })
      }
      if (!this.analysis.hasPrettier) {
        devToolChoices.push({ name: 'Prettier', value: 'prettier', checked: true })
      }
      
      if (devToolChoices.length > 0) {
        const { selectedDevTools } = await inquirer.prompt([{
          type: 'checkbox',
          name: 'selectedDevTools',
          message: 'Select development tools:',
          choices: devToolChoices
        }])

        selections.devTools = selectedDevTools
      }
    }

    return selections
  }

  /**
   * Automatic package selection based on recommendations
   */
  private async automaticSelection(): Promise<SelectionResult> {
    console.log(chalk.yellow('\n🤖 Running in automatic mode...\n'))

    const selections: SelectionResult = {
      frameworks: [],
      uiLibraries: [],
      iconLibraries: [],
      designTools: [],
      colorTools: [],
      fonts: [],
      utilities: [],
      devTools: []
    }

    // Add all critical and important missing features
    for (const feature of this.report.missingFeatures) {
      if (feature.impact !== 'nice-to-have') {
        const packages = feature.suggestedPackages.slice(0, 1) // Just the first suggestion
        this.categorizePackages(packages, selections)
      }
    }

    // Add recommended packages
    for (const rec of this.report.recommendations) {
      if (rec.priority === 'high') {
        const packages = rec.packages.slice(0, 1) // Just the first suggestion
        this.categorizePackages(packages, selections)
      }
    }

    // Add essential dev tools if missing
    if (!this.analysis.hasTypeScript) selections.devTools.push('typescript')
    if (!this.analysis.hasESLint) selections.devTools.push('eslint')
    if (!this.analysis.hasPrettier) selections.devTools.push('prettier')

    return selections
  }

  /**
   * Browse additional packages
   */
  private async browsePackages(selections: SelectionResult): Promise<void> {
    const categories = [
      { name: 'UI Component Libraries', value: 'ui' },
      { name: 'Icon Libraries', value: 'icons' },
      { name: 'Design Tools', value: 'design' },
      { name: 'Color & Styling Tools', value: 'color' },
      { name: 'Fonts', value: 'fonts' },
      { name: 'Done browsing', value: 'done' }
    ]

    let browsing = true
    while (browsing) {
      const { category } = await inquirer.prompt([{
        type: 'list',
        name: 'category',
        message: 'Browse packages by category:',
        choices: categories
      }])

      if (category === 'done') {
        browsing = false
        continue
      }

      const packages = this.getPackagesByCategory(category)
      const installed = this.getInstalledPackages(category)

      const { selected } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'selected',
        message: `Select ${categories.find(c => c.value === category)?.name}:`,
        choices: packages.map(pkg => ({
          name: `${pkg.name} - ${pkg.description}`,
          value: pkg.packageName,
          checked: false,
          disabled: installed.includes(pkg.packageName) ? '(Already installed)' : false
        }))
      }])

      this.categorizePackages(selected, selections)
    }
  }

  /**
   * Generate install commands
   */
  private generateInstallCommands(selections: SelectionResult): string[] {
    const commands: string[] = []
    const pm = this.options.packageManager
    const installCmd = pm === 'npm' ? 'install' : 'add'

    // Group packages by type
    const allPackages = [
      ...selections.frameworks,
      ...selections.uiLibraries,
      ...selections.iconLibraries,
      ...selections.designTools,
      ...selections.colorTools,
      ...selections.fonts,
      ...selections.utilities
    ]

    const devPackages = [...selections.devTools]
    
    // Add TypeScript types if TypeScript is selected
    if (selections.devTools.includes('typescript')) {
      devPackages.push('@types/node', '@types/react', '@types/react-dom')
    }

    if (allPackages.length > 0) {
      commands.push(`${pm} ${installCmd} ${allPackages.join(' ')}`)
    }

    if (devPackages.length > 0) {
      commands.push(`${pm} ${installCmd} ${pm === 'npm' ? '--save-dev' : '-D'} ${devPackages.join(' ')}`)
    }

    // Add initialization commands
    if (selections.devTools.includes('typescript') && !this.analysis.hasTypeScript) {
      commands.push('npx tsc --init')
    }

    if (selections.devTools.includes('eslint') && !this.analysis.hasESLint) {
      commands.push('npx eslint --init')
    }

    if (selections.uiLibraries.includes('tailwindcss') && !this.analysis.hasTailwind) {
      commands.push('npx tailwindcss init -p')
    }

    return commands
  }

  /**
   * Generate configuration files
   */
  private generateConfigFiles(selections: SelectionResult): ConfigFile[] {
    const configs: ConfigFile[] = []

    // TypeScript config
    if (selections.devTools.includes('typescript') && !this.analysis.hasTypeScript) {
      configs.push({
        filename: 'tsconfig.json',
        description: 'TypeScript configuration',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            paths: {
              '@/*': ['./src/*']
            }
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
          exclude: ['node_modules']
        }, null, 2)
      })
    }

    // Tailwind config
    if (selections.uiLibraries.includes('tailwindcss') && !this.analysis.hasTailwind) {
      configs.push({
        filename: 'tailwind.config.js',
        description: 'Tailwind CSS configuration',
        content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    ${selections.utilities.includes('@tailwindcss/forms') ? "require('@tailwindcss/forms')," : ''}
    ${selections.utilities.includes('@tailwindcss/typography') ? "require('@tailwindcss/typography')," : ''}
  ],
}`
      })
    }

    // Prettier config
    if (selections.devTools.includes('prettier') && !this.analysis.hasPrettier) {
      configs.push({
        filename: '.prettierrc',
        description: 'Prettier configuration',
        content: JSON.stringify({
          semi: false,
          trailingComma: 'es5',
          singleQuote: true,
          tabWidth: 2,
          useTabs: false
        }, null, 2)
      })
    }

    // Revolutionary UI Factory config
    configs.push({
      filename: 'revolutionary-ui.config.js',
      description: 'Revolutionary UI Factory configuration',
      content: `module.exports = {
  frameworks: [${selections.frameworks.map(f => `'${f}'`).join(', ')}],
  uiLibraries: [${selections.uiLibraries.map(l => `'${l}'`).join(', ')}],
  iconLibraries: [${selections.iconLibraries.map(i => `'${i}'`).join(', ')}],
  theme: {
    // Add your custom theme configuration here
  },
  components: {
    // Component-specific configurations
  }
}`
    })

    return configs
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(selections: SelectionResult): string[] {
    const steps: string[] = []

    steps.push('Run the install commands to add selected packages')
    
    if (selections.devTools.includes('typescript')) {
      steps.push('Update your file extensions from .js/.jsx to .ts/.tsx')
    }

    if (selections.uiLibraries.length > 0) {
      steps.push('Import and start using UI components in your project')
    }

    if (selections.iconLibraries.length > 0) {
      steps.push('Replace existing icons with your new icon library')
    }

    steps.push('Run "npx revolutionary-ui generate" to create your first component')
    steps.push('Visit https://revolutionary-ui.com/docs for documentation')

    return steps
  }

  // Helper methods

  private categorizePackages(packages: string[], selections: SelectionResult): void {
    for (const pkg of packages) {
      if (FRAMEWORK_CONFIGS.some(f => f.packageName === pkg)) {
        selections.frameworks.push(pkg)
      } else if (UI_LIBRARIES.some(l => l.packageName === pkg)) {
        selections.uiLibraries.push(pkg)
      } else if (ICON_LIBRARIES.some(i => i.packageName === pkg)) {
        selections.iconLibraries.push(pkg)
      } else if (DESIGN_TOOLS.some(d => d.packageName === pkg)) {
        selections.designTools.push(pkg)
      } else if (COLOR_TOOLS.some(c => c.packageName === pkg)) {
        selections.colorTools.push(pkg)
      } else if (FONTS.some(f => f.packageName === pkg)) {
        selections.fonts.push(pkg)
      } else {
        selections.utilities.push(pkg)
      }
    }
  }

  private getPackagesByCategory(category: string): any[] {
    switch (category) {
      case 'ui': return UI_LIBRARIES
      case 'icons': return ICON_LIBRARIES
      case 'design': return DESIGN_TOOLS
      case 'color': return COLOR_TOOLS
      case 'fonts': return FONTS
      default: return []
    }
  }

  private getInstalledPackages(category: string): string[] {
    switch (category) {
      case 'ui': return this.analysis.uiLibraries.filter(l => l.installed).map(l => l.name)
      case 'icons': return this.analysis.iconLibraries.filter(l => l.installed).map(l => l.name)
      case 'design': return this.analysis.designTools.filter(t => t.installed).map(t => t.name)
      case 'color': return this.analysis.colorTools.filter(t => t.installed).map(t => t.name)
      case 'fonts': return this.analysis.fonts.filter(f => f.installed).map(f => f.name)
      default: return []
    }
  }
}