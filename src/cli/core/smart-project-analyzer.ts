import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import { glob } from 'glob'
import inquirer from 'inquirer'

export interface SubProject {
  name: string
  path: string
  type: 'nextjs' | 'react' | 'vue' | 'angular' | 'node' | 'unknown'
  framework?: string
  hasPackageJson: boolean
  description?: string
}

export interface SmartProjectAnalysis {
  // Basic info
  name: string
  rootPath: string
  
  // Framework detection
  framework: string
  frameworks: string[] // All detected frameworks
  isMonorepo: boolean
  
  // Subprojects
  subProjects?: SubProject[]
  
  // Language and tools
  language: 'TypeScript' | 'JavaScript'
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
  buildTool: string
  
  // Dependencies
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  
  // Project structure
  structure: {
    hasSourceFolder: boolean
    componentsPath: string | null
    pagesPath: string | null
    apiPath: string | null
    stylesPath: string | null
    publicPath: string | null
    testsPath: string | null
  }
  
  // Styling
  styling: {
    system: string
    preprocessor: string | null
    hasGlobalStyles: boolean
    hasCSSModules: boolean
  }
  
  // Features detected
  features: {
    hasTypeScript: boolean
    hasESLint: boolean
    hasPrettier: boolean
    hasTests: boolean
    hasDocker: boolean
    hasCI: boolean
    hasPrisma: boolean
    hasSupabase: boolean
    hasAuth: boolean
    hasStripe: boolean
  }
  
  // Component analysis
  components: {
    estimatedCount: number
    patterns: string[]
    uiLibraries: string[]
  }
  
  // Recommendations
  recommendations: string[]
}

export class SmartProjectAnalyzer {
  private workspace: string

  constructor(workspace: string = process.cwd()) {
    this.workspace = workspace
  }

  async analyze(targetPath?: string): Promise<SmartProjectAnalysis> {
    // If targetPath is provided, analyze that specific path
    const analyzePath = targetPath || this.workspace
    
    console.log(chalk.cyan('\n🔍 Smart Project Analysis\n'))
    
    // First, detect if there are subprojects
    const subProjects = await this.detectSubProjects()
    
    // If subprojects exist and no target path specified, ask user which to analyze
    if (subProjects.length > 0 && !targetPath) {
      const selectedPath = await this.selectProjectToAnalyze(subProjects)
      if (selectedPath !== this.workspace) {
        // Recursively analyze the selected subproject
        const subAnalyzer = new SmartProjectAnalyzer(selectedPath)
        return await subAnalyzer.analyze(selectedPath)
      }
    }
    
    const analysis: SmartProjectAnalysis = {
      name: path.basename(analyzePath),
      rootPath: analyzePath,
      framework: 'Unknown',
      frameworks: [],
      isMonorepo: false,
      subProjects: subProjects.length > 0 ? subProjects : undefined,
      language: 'JavaScript',
      packageManager: 'npm',
      buildTool: 'Unknown',
      dependencies: {},
      devDependencies: {},
      structure: {
        hasSourceFolder: false,
        componentsPath: null,
        pagesPath: null,
        apiPath: null,
        stylesPath: null,
        publicPath: null,
        testsPath: null
      },
      styling: {
        system: 'Plain CSS',
        preprocessor: null,
        hasGlobalStyles: false,
        hasCSSModules: false
      },
      features: {
        hasTypeScript: false,
        hasESLint: false,
        hasPrettier: false,
        hasTests: false,
        hasDocker: false,
        hasCI: false,
        hasPrisma: false,
        hasSupabase: false,
        hasAuth: false,
        hasStripe: false
      },
      components: {
        estimatedCount: 0,
        patterns: [],
        uiLibraries: []
      },
      recommendations: []
    }

    // Step 1: Read package.json
    console.log(chalk.gray('  Reading package.json...'))
    const packageInfo = await this.readPackageJson(analyzePath)
    if (packageInfo) {
      analysis.name = packageInfo.name || analysis.name
      analysis.dependencies = packageInfo.dependencies || {}
      analysis.devDependencies = packageInfo.devDependencies || {}
      
      // Detect package manager
      analysis.packageManager = await this.detectPackageManager(analyzePath)
      
      // Detect frameworks
      const frameworks = this.detectFrameworks(analysis.dependencies, analysis.devDependencies)
      analysis.frameworks = frameworks
      analysis.framework = frameworks[0] || 'Unknown'
      
      // Detect monorepo
      analysis.isMonorepo = this.detectMonorepo(packageInfo, analyzePath)
    }

    // Step 2: Check key configuration files
    console.log(chalk.gray('  Checking configuration files...'))
    analysis.features.hasTypeScript = await this.fileExists('tsconfig.json', analyzePath)
    analysis.language = analysis.features.hasTypeScript ? 'TypeScript' : 'JavaScript'
    analysis.features.hasESLint = await this.fileExists('.eslintrc.js', analyzePath) || await this.fileExists('.eslintrc.json', analyzePath)
    analysis.features.hasPrettier = await this.fileExists('.prettierrc', analyzePath) || await this.fileExists('.prettierrc.json', analyzePath)
    analysis.features.hasDocker = await this.fileExists('Dockerfile', analyzePath) || await this.fileExists('docker-compose.yml', analyzePath)
    analysis.features.hasPrisma = await this.fileExists('prisma/schema.prisma', analyzePath)
    
    // Check for CI
    analysis.features.hasCI = await this.fileExists('.github/workflows', analyzePath) || 
                              await this.fileExists('.gitlab-ci.yml', analyzePath) || 
                              await this.fileExists('.circleci', analyzePath)

    // Step 3: Analyze project structure
    console.log(chalk.gray('  Analyzing project structure...'))
    analysis.structure = await this.analyzeProjectStructure(analyzePath)
    
    // Step 4: Detect styling system
    console.log(chalk.gray('  Detecting styling system...'))
    analysis.styling = await this.detectStyling(analysis.dependencies, analysis.devDependencies, analyzePath)
    
    // Step 5: Detect build tools
    console.log(chalk.gray('  Detecting build tools...'))
    analysis.buildTool = await this.detectBuildTool(analyzePath)
    
    // Step 6: Analyze components (smart detection)
    console.log(chalk.gray('  Analyzing components...'))
    analysis.components = await this.analyzeComponents(analysis.structure.componentsPath, analyzePath)
    
    // Step 7: Detect special features
    console.log(chalk.gray('  Detecting features...'))
    analysis.features.hasSupabase = this.hasPackage(analysis.dependencies, '@supabase/supabase-js')
    analysis.features.hasAuth = this.hasPackage(analysis.dependencies, 'next-auth') || 
                               this.hasPackage(analysis.dependencies, '@auth0/nextjs-auth0') ||
                               this.hasPackage(analysis.dependencies, '@clerk/nextjs')
    analysis.features.hasStripe = this.hasPackage(analysis.dependencies, 'stripe') || 
                                 this.hasPackage(analysis.dependencies, '@stripe/stripe-js')
    
    // Step 8: Detect UI libraries
    analysis.components.uiLibraries = this.detectUILibraries(analysis.dependencies)
    
    // Step 9: Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis)
    
    console.log(chalk.green('  ✓ Analysis complete!\n'))
    
    return analysis
  }

  private async detectSubProjects(): Promise<SubProject[]> {
    const subProjects: SubProject[] = []
    
    try {
      // Look for directories with package.json files
      const packageJsonFiles = await glob('*/package.json', {
        cwd: this.workspace,
        ignore: ['node_modules/**', '**/node_modules/**']
      })
      
      for (const file of packageJsonFiles) {
        const dir = path.dirname(file)
        const fullPath = path.join(this.workspace, dir)
        
        try {
          const packageJson = await this.readPackageJson(fullPath)
          if (packageJson) {
            const subProject: SubProject = {
              name: packageJson.name || dir,
              path: fullPath,
              type: 'unknown',
              hasPackageJson: true,
              description: packageJson.description
            }
            
            // Detect type based on dependencies
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
            
            if (deps['next']) {
              subProject.type = 'nextjs'
              subProject.framework = 'Next.js'
            } else if (deps['react']) {
              subProject.type = 'react'
              subProject.framework = 'React'
            } else if (deps['vue']) {
              subProject.type = 'vue'
              subProject.framework = 'Vue'
            } else if (deps['@angular/core']) {
              subProject.type = 'angular'
              subProject.framework = 'Angular'
            } else if (!deps['react'] && !deps['vue'] && !deps['@angular/core']) {
              subProject.type = 'node'
              subProject.framework = 'Node.js'
            }
            
            subProjects.push(subProject)
          }
        } catch {
          // Ignore errors reading individual package.json files
        }
      }
    } catch {
      // Ignore glob errors
    }
    
    return subProjects
  }

  private async selectProjectToAnalyze(subProjects: SubProject[]): Promise<string> {
    console.log(chalk.yellow('\n🏗️  Multiple projects detected:\n'))
    
    const choices = [
      {
        name: `📦 Root Project (${path.basename(this.workspace)})`,
        value: this.workspace,
        short: 'Root'
      }
    ]
    
    // Filter out duplicate paths
    const uniqueProjects = subProjects.filter((project, index, self) =>
      index === self.findIndex((p) => p.path === project.path)
    )
    
    for (const project of uniqueProjects) {
      const icon = project.type === 'nextjs' ? '⚡' : 
                   project.type === 'react' ? '⚛️' :
                   project.type === 'vue' ? '🟢' :
                   project.type === 'angular' ? '🔺' : '📁'
      
      choices.push({
        name: `${icon} ${path.basename(project.path)} (${project.framework || project.type})${project.description ? ` - ${project.description.substring(0, 50)}${project.description.length > 50 ? '...' : ''}` : ''}`,
        value: project.path,
        short: path.basename(project.path)
      })
    }
    
    if (uniqueProjects.length > 1) {
      choices.push({
        name: '🔍 Analyze All Projects',
        value: 'all',
        short: 'All'
      })
    }
    
    const { selectedPath } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedPath',
      message: 'Which project would you like to analyze?',
      choices,
      pageSize: 10
    }])
    
    return selectedPath
  }

  private async readPackageJson(workspace?: string): Promise<any> {
    const targetPath = workspace || this.workspace
    try {
      const content = await fs.readFile(path.join(targetPath, 'package.json'), 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  private async detectPackageManager(workspace?: string): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'> {
    if (await this.fileExists('bun.lockb', workspace)) return 'bun'
    if (await this.fileExists('pnpm-lock.yaml', workspace)) return 'pnpm'
    if (await this.fileExists('yarn.lock', workspace)) return 'yarn'
    return 'npm'
  }

  private detectFrameworks(deps: Record<string, string>, devDeps: Record<string, string>): string[] {
    const allDeps = { ...deps, ...devDeps }
    const frameworks: string[] = []
    
    // Import framework configs
    const { FRAMEWORK_CONFIGS } = require('../../../config/frameworks')
    
    // Check each framework from our comprehensive list
    for (const framework of FRAMEWORK_CONFIGS) {
      if (framework.packageName && framework.packageName !== 'none') {
        if (allDeps[framework.packageName]) {
          frameworks.push(framework.name)
        }
      }
    }
    
    // Check for additional meta-frameworks
    const additionalChecks = [
      { package: 'gatsby', name: 'Gatsby' },
      { package: 'remix', name: 'Remix' },
      { package: '@remix-run/react', name: 'Remix' },
      { package: 'astro', name: 'Astro' },
      { package: 'vitepress', name: 'VitePress' },
      { package: 'docusaurus', name: 'Docusaurus' },
      { package: 'expo', name: 'Expo' },
      { package: 'react-native', name: 'React Native' },
      { package: 'electron', name: 'Electron' },
      { package: 'tauri', name: 'Tauri' }
    ]
    
    for (const check of additionalChecks) {
      if (allDeps[check.package] && !frameworks.includes(check.name)) {
        frameworks.push(check.name)
      }
    }
    
    // If no frameworks detected but has common build tools
    if (frameworks.length === 0) {
      if (allDeps['vite']) frameworks.push('Vite Project')
      else if (allDeps['webpack']) frameworks.push('Webpack Project')
      else if (allDeps['rollup']) frameworks.push('Rollup Project')
      else if (allDeps['parcel']) frameworks.push('Parcel Project')
    }
    
    return frameworks
  }

  private detectMonorepo(packageJson: any, workspace?: string): boolean {
    return !!(packageJson.workspaces || 
              packageJson.bolt?.workspaces ||
              this.fileExists('lerna.json', workspace) ||
              this.fileExists('rush.json', workspace) ||
              this.fileExists('pnpm-workspace.yaml', workspace))
  }

  private async analyzeProjectStructure(workspace?: string): Promise<SmartProjectAnalysis['structure']> {
    const structure: SmartProjectAnalysis['structure'] = {
      hasSourceFolder: false,
      componentsPath: null,
      pagesPath: null,
      apiPath: null,
      stylesPath: null,
      publicPath: null,
      testsPath: null
    }

    // Check for src folder
    structure.hasSourceFolder = await this.fileExists('src', workspace)
    const base = structure.hasSourceFolder ? 'src' : ''

    // Common component paths
    const componentPaths = [
      'components',
      'ui',
      'shared/components',
      'common/components',
      'lib/components'
    ]
    
    for (const compPath of componentPaths) {
      const fullPath = path.join(base, compPath)
      if (await this.fileExists(fullPath, workspace)) {
        structure.componentsPath = fullPath
        break
      }
    }

    // Pages/routes
    const pagePaths = ['pages', 'app', 'routes', 'views']
    for (const pagePath of pagePaths) {
      const fullPath = path.join(base, pagePath)
      if (await this.fileExists(fullPath, workspace)) {
        structure.pagesPath = fullPath
        break
      }
    }

    // API routes
    const apiPaths = ['api', 'pages/api', 'app/api', 'server/api']
    for (const apiPath of apiPaths) {
      if (await this.fileExists(apiPath, workspace)) {
        structure.apiPath = apiPath
        break
      }
    }

    // Styles
    const stylePaths = ['styles', 'css', 'scss', 'sass']
    for (const stylePath of stylePaths) {
      const fullPath = path.join(base, stylePath)
      if (await this.fileExists(fullPath, workspace)) {
        structure.stylesPath = fullPath
        break
      }
    }

    // Public assets
    if (await this.fileExists('public', workspace)) {
      structure.publicPath = 'public'
    } else if (await this.fileExists('static', workspace)) {
      structure.publicPath = 'static'
    }

    // Tests
    const testPaths = ['tests', 'test', '__tests__', 'spec']
    for (const testPath of testPaths) {
      if (await this.fileExists(testPath, workspace)) {
        structure.testsPath = testPath
        structure.hasTests = true
        break
      }
    }

    return structure
  }

  private async detectStyling(deps: Record<string, string>, devDeps: Record<string, string>, workspace?: string): Promise<SmartProjectAnalysis['styling']> {
    const allDeps = { ...deps, ...devDeps }
    
    const styling: SmartProjectAnalysis['styling'] = {
      system: 'Plain CSS',
      preprocessor: null,
      hasGlobalStyles: false,
      hasCSSModules: false
    }

    // Tailwind CSS
    if (allDeps['tailwindcss'] || await this.fileExists('tailwind.config.js', workspace)) {
      styling.system = 'Tailwind CSS'
    }
    // CSS-in-JS libraries
    else if (allDeps['styled-components']) {
      styling.system = 'Styled Components'
    }
    else if (allDeps['@emotion/react'] || allDeps['@emotion/styled']) {
      styling.system = 'Emotion'
    }
    else if (allDeps['@stitches/react']) {
      styling.system = 'Stitches'
    }
    else if (allDeps['styled-jsx']) {
      styling.system = 'Styled JSX'
    }
    else if (allDeps['@vanilla-extract/css']) {
      styling.system = 'Vanilla Extract'
    }
    // CSS Modules
    else if (await this.hasFilePattern('**/*.module.css', workspace) || await this.hasFilePattern('**/*.module.scss', workspace)) {
      styling.system = 'CSS Modules'
      styling.hasCSSModules = true
    }

    // Preprocessors
    if (allDeps['sass'] || allDeps['node-sass']) {
      styling.preprocessor = 'Sass/SCSS'
    } else if (allDeps['less']) {
      styling.preprocessor = 'Less'
    } else if (allDeps['stylus']) {
      styling.preprocessor = 'Stylus'
    }

    // Check for global styles
    const globalStylePaths = [
      'styles/globals.css',
      'styles/global.css',
      'src/styles/globals.css',
      'src/styles/global.css',
      'app/globals.css'
    ]
    
    for (const stylePath of globalStylePaths) {
      if (await this.fileExists(stylePath, workspace)) {
        styling.hasGlobalStyles = true
        break
      }
    }

    return styling
  }

  private async detectBuildTool(workspace?: string): Promise<string> {
    if (await this.fileExists('vite.config.js', workspace) || await this.fileExists('vite.config.ts', workspace)) {
      return 'Vite'
    }
    if (await this.fileExists('webpack.config.js', workspace)) {
      return 'Webpack'
    }
    if (await this.fileExists('rollup.config.js', workspace)) {
      return 'Rollup'
    }
    if (await this.fileExists('parcel.json', workspace) || await this.fileExists('.parcelrc', workspace)) {
      return 'Parcel'
    }
    if (await this.fileExists('esbuild.config.js', workspace)) {
      return 'esbuild'
    }
    if (await this.fileExists('next.config.js', workspace)) {
      return 'Next.js (Webpack/Turbopack)'
    }
    if (await this.fileExists('angular.json', workspace)) {
      return 'Angular CLI'
    }
    return 'Unknown'
  }

  private async analyzeComponents(componentsPath: string | null, workspace?: string): Promise<SmartProjectAnalysis['components']> {
    const components: SmartProjectAnalysis['components'] = {
      estimatedCount: 0,
      patterns: [],
      uiLibraries: []
    }

    if (!componentsPath) {
      return components
    }

    try {
      // Count component files (limit to prevent hanging)
      const componentFiles = await glob('**/*.{jsx,tsx,vue,svelte}', {
        cwd: path.join(workspace || this.workspace, componentsPath),
        ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'],
        nodir: true
      })
      
      components.estimatedCount = componentFiles.length

      // Detect patterns from filenames (sample first 50)
      const sampleFiles = componentFiles.slice(0, 50)
      const patterns = new Set<string>()
      
      sampleFiles.forEach(file => {
        if (file.includes('Button')) patterns.add('Buttons')
        if (file.includes('Form')) patterns.add('Forms')
        if (file.includes('Table')) patterns.add('Tables')
        if (file.includes('Modal')) patterns.add('Modals')
        if (file.includes('Card')) patterns.add('Cards')
        if (file.includes('Nav') || file.includes('Header')) patterns.add('Navigation')
        if (file.includes('Layout')) patterns.add('Layouts')
        if (file.includes('Chart') || file.includes('Graph')) patterns.add('Data Visualization')
      })
      
      components.patterns = Array.from(patterns)
    } catch {
      // Ignore errors
    }

    return components
  }

  private detectUILibraries(deps: Record<string, string>): string[] {
    const libraries: string[] = []
    
    const uiLibraryMap: Record<string, string> = {
      '@mui/material': 'Material-UI',
      '@chakra-ui/react': 'Chakra UI',
      'antd': 'Ant Design',
      '@mantine/core': 'Mantine',
      'react-bootstrap': 'React Bootstrap',
      '@headlessui/react': 'Headless UI',
      '@radix-ui/react-dialog': 'Radix UI',
      'primereact': 'PrimeReact',
      '@arco-design/web-react': 'Arco Design',
      'semantic-ui-react': 'Semantic UI',
      '@blueprintjs/core': 'Blueprint',
      'evergreen-ui': 'Evergreen',
      'grommet': 'Grommet',
      'rebass': 'Rebass',
      '@fluentui/react': 'Fluent UI'
    }
    
    for (const [pkg, name] of Object.entries(uiLibraryMap)) {
      if (deps[pkg]) {
        libraries.push(name)
      }
    }
    
    // Check for Tailwind UI, shadcn/ui indicators
    if (deps['tailwindcss'] && deps['class-variance-authority']) {
      libraries.push('shadcn/ui (likely)')
    }
    
    return libraries
  }

  private generateRecommendations(analysis: SmartProjectAnalysis): string[] {
    const recommendations: string[] = []
    
    // TypeScript recommendation
    if (!analysis.features.hasTypeScript) {
      recommendations.push('Consider adding TypeScript for better type safety and developer experience')
    }
    
    // Testing
    if (!analysis.features.hasTests) {
      recommendations.push('Add automated testing with Revolutionary UI\'s test generation features')
    }
    
    // Styling
    if (analysis.styling.system === 'Plain CSS') {
      recommendations.push('Consider using Tailwind CSS or CSS-in-JS for better component styling')
    }
    
    // Component optimization
    if (analysis.components.estimatedCount > 20) {
      recommendations.push('Use Revolutionary UI factories to reduce component code by 60-95%')
    }
    
    // Forms
    if (analysis.components.patterns.includes('Forms')) {
      recommendations.push('Replace manual form implementations with FormFactory for automatic validation')
    }
    
    // Tables
    if (analysis.components.patterns.includes('Tables')) {
      recommendations.push('Use TableFactory for automatic sorting, filtering, and pagination')
    }
    
    // Performance
    if (Object.keys(analysis.dependencies).length > 50) {
      recommendations.push('High dependency count - consider using Revolutionary UI\'s built-in components')
    }
    
    return recommendations
  }

  private hasPackage(deps: Record<string, string>, packageName: string): boolean {
    return !!deps[packageName]
  }

  private async fileExists(filePath: string, workspace?: string): Promise<boolean> {
    const targetPath = workspace || this.workspace
    try {
      await fs.access(path.join(targetPath, filePath))
      return true
    } catch {
      return false
    }
  }

  private async hasFilePattern(pattern: string, workspace?: string): Promise<boolean> {
    const targetPath = workspace || this.workspace
    try {
      const files = await glob(pattern, {
        cwd: targetPath,
        ignore: ['**/node_modules/**'],
        nodir: true
      })
      return files.length > 0
    } catch {
      return false
    }
  }

  async saveAnalysis(analysis: SmartProjectAnalysis, outputPath: string): Promise<void> {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const outputDir = path.dirname(outputPath)
    await fs.mkdir(outputDir, { recursive: true })
    
    await fs.writeFile(
      outputPath,
      JSON.stringify(analysis, null, 2),
      'utf-8'
    )
  }
}