/**
 * Smart Project Analyzer with Database Integration
 * Analyzes projects using framework/library data from the database instead of static files
 */

import { join, basename } from 'path'
import { readFile, access } from 'fs/promises'
import { constants } from 'fs'
import { glob } from 'glob'
import chalk from 'chalk'
import ora from 'ora'
import { DatabaseResourceService } from '../../services/database-resource-service'

export interface SmartProjectAnalysis {
  projectName: string
  projectType: 'monorepo' | 'single' | 'workspace'
  detectedFrameworks: string[]
  detectedUILibraries: string[]
  detectedIconLibraries: string[]
  detectedPackages: string[]
  hasTypeScript: boolean
  cssFramework: string | null
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
  isMonorepo: boolean
  workspaces?: string[]
  subProjects?: SubProject[]
  structure: {
    hasSourceFolder: boolean
    componentsPath: string | null
    pagesPath: string | null
    apiPath: string | null
    stylesPath: string | null
    publicPath: string | null
    testsPath: string | null
  }
  dependencies: {
    production: Record<string, string>
    development: Record<string, string>
    all: Record<string, string>
  }
  scripts: Record<string, string>
  components: {
    count: number
    types: string[]
    uiLibraries: string[]
  }
  features: {
    hasTests: boolean
    hasLinting: boolean
    hasFormatting: boolean
    hasCI: boolean
    hasDocker: boolean
    hasAuth: boolean
    hasDatabase: boolean
    hasAPI: boolean
    hasInternationalization: boolean
    hasAnalytics: boolean
    hasPayments: boolean
    hasEmail: boolean
    hasWebSockets: boolean
    hasSSR: boolean
    hasSSG: boolean
    hasISR: boolean
    hasPWA: boolean
    hasGraphQL: boolean
    hasREST: boolean
    hasWebpack: boolean
    hasVite: boolean
    hasEsbuild: boolean
    hasSWC: boolean
    hasBabel: boolean
    hasTurbopack: boolean
    hasClerk: boolean
    hasStripe: boolean
  }
  recommendations: string[]
}

export interface SubProject {
  name: string
  path: string
  type: string
  framework?: string
  hasPackageJson: boolean
  description?: string
}

export class SmartProjectAnalyzerDB {
  private workspace: string
  private dbService: DatabaseResourceService
  private frameworksCache?: Map<string, any>
  private uiLibrariesCache?: Map<string, any>
  private iconLibrariesCache?: Map<string, any>

  constructor(workspace: string = process.cwd()) {
    this.workspace = workspace
    try {
      this.dbService = DatabaseResourceService.getInstance()
    } catch (error) {
      console.warn('Database service not available, using fallback analyzer')
      // Create a mock service for fallback
      this.dbService = {
        getFrameworks: async () => [],
        getUILibraries: async () => [],
        getIconLibraries: async () => [],
        searchResources: async () => []
      } as any
    }
  }

  async analyze(): Promise<SmartProjectAnalysis> {
    const spinner = ora({
      text: 'Analyzing project structure...',
      spinner: 'dots'
    }).start()

    try {
      console.log(chalk.blue('\n🔍 Smart Project Analysis with Database\n'))

      // Step 1: Read package.json
      spinner.text = 'Reading package.json...'
      const packageJson = await this.readPackageJson()
      if (!packageJson) {
        throw new Error('No package.json found in the current directory')
      }

      // Initialize analysis object
      const analysis: SmartProjectAnalysis = {
        projectName: packageJson.name || basename(this.workspace),
        projectType: 'single',
        detectedFrameworks: [],
        detectedUILibraries: [],
        detectedIconLibraries: [],
        detectedPackages: [],
        hasTypeScript: false,
        cssFramework: null,
        packageManager: 'npm',
        isMonorepo: false,
        structure: {
          hasSourceFolder: false,
          componentsPath: null,
          pagesPath: null,
          apiPath: null,
          stylesPath: null,
          publicPath: null,
          testsPath: null
        },
        dependencies: {
          production: packageJson.dependencies || {},
          development: packageJson.devDependencies || {},
          all: {}
        },
        scripts: packageJson.scripts || {},
        components: {
          count: 0,
          types: [],
          uiLibraries: []
        },
        features: {
          hasTests: false,
          hasLinting: false,
          hasFormatting: false,
          hasCI: false,
          hasDocker: false,
          hasAuth: false,
          hasDatabase: false,
          hasAPI: false,
          hasInternationalization: false,
          hasAnalytics: false,
          hasPayments: false,
          hasEmail: false,
          hasWebSockets: false,
          hasSSR: false,
          hasSSG: false,
          hasISR: false,
          hasPWA: false,
          hasGraphQL: false,
          hasREST: false,
          hasWebpack: false,
          hasVite: false,
          hasEsbuild: false,
          hasSWC: false,
          hasBabel: false,
          hasTurbopack: false,
          hasClerk: false,
          hasStripe: false
        },
        recommendations: []
      }

      // Combine all dependencies
      analysis.dependencies.all = { ...analysis.dependencies.production, ...analysis.dependencies.development }
      analysis.detectedPackages = Object.keys(analysis.dependencies.all)

      // Step 2: Detect package manager
      spinner.text = 'Detecting package manager...'
      analysis.packageManager = await this.detectPackageManager()

      // Step 3: Detect TypeScript
      analysis.hasTypeScript = this.hasPackage(analysis.dependencies, 'typescript') || 
                               await this.fileExists('tsconfig.json')

      // Step 4: Detect CSS framework
      spinner.text = 'Detecting CSS framework...'
      analysis.cssFramework = await this.detectCSSFramework(analysis.dependencies)

      // Step 5: Detect frameworks from database
      spinner.text = 'Detecting frameworks from database...'
      analysis.detectedFrameworks = await this.detectFrameworksFromDB(
        analysis.dependencies.production,
        analysis.dependencies.development
      )

      // Step 6: Detect UI libraries from database
      spinner.text = 'Detecting UI libraries from database...'
      analysis.detectedUILibraries = await this.detectUILibrariesFromDB(
        analysis.dependencies.production,
        analysis.dependencies.development
      )

      // Step 7: Detect icon libraries from database
      spinner.text = 'Detecting icon libraries from database...'
      analysis.detectedIconLibraries = await this.detectIconLibrariesFromDB(
        analysis.dependencies.production,
        analysis.dependencies.development
      )

      // Step 8: Detect monorepo
      analysis.isMonorepo = this.detectMonorepo(packageJson)
      if (analysis.isMonorepo) {
        analysis.projectType = 'monorepo'
        analysis.workspaces = this.getWorkspaces(packageJson)
      }

      // Step 9: Analyze project structure
      spinner.text = 'Analyzing project structure...'
      analysis.structure = await this.analyzeProjectStructure()

      // Step 10: Detect features
      spinner.text = 'Detecting project features...'
      this.detectFeatures(analysis)

      // Step 11: Count components
      spinner.text = 'Counting components...'
      analysis.components.count = await this.countComponents(analysis.structure.componentsPath)
      analysis.components.types = await this.getComponentTypes(analysis.structure.componentsPath)
      analysis.components.uiLibraries = analysis.detectedUILibraries

      // Step 12: Detect sub-projects
      if (analysis.isMonorepo) {
        spinner.text = 'Detecting sub-projects...'
        analysis.subProjects = await this.detectSubProjects()
      }

      // Step 13: Generate recommendations
      spinner.text = 'Generating recommendations...'
      analysis.recommendations = await this.generateRecommendations(analysis)

      spinner.succeed('Analysis complete!')
      
      return analysis
    } catch (error) {
      spinner.fail('Analysis failed')
      throw error
    } finally {
      // Don't disconnect here as other parts of the app might still need the connection
      // await this.dbService.disconnect()
    }
  }

  private async detectFrameworksFromDB(deps: Record<string, string>, devDeps: Record<string, string>): Promise<string[]> {
    const allDeps = { ...deps, ...devDeps }
    const packageNames = Object.keys(allDeps)
    
    // Get frameworks from database that match installed packages
    const frameworkMap = await this.dbService.getFrameworksByPackages(packageNames)
    
    const detectedFrameworks: string[] = []
    
    // Check each installed package against database frameworks
    for (const [packageName, frameworkInfo] of frameworkMap) {
      if (allDeps[packageName]) {
        detectedFrameworks.push(frameworkInfo.name)
      }
    }
    
    return detectedFrameworks
  }

  private async detectUILibrariesFromDB(deps: Record<string, string>, devDeps: Record<string, string>): Promise<string[]> {
    const allDeps = { ...deps, ...devDeps }
    const packageNames = Object.keys(allDeps)
    
    // Get UI libraries from database that match installed packages
    const libraryMap = await this.dbService.getUILibrariesByPackages(packageNames)
    
    const detectedLibraries: string[] = []
    
    // Check each installed package against database UI libraries
    for (const [packageName, libraryInfo] of libraryMap) {
      if (allDeps[packageName]) {
        detectedLibraries.push(libraryInfo.name)
      }
    }
    
    return detectedLibraries
  }

  private async detectIconLibrariesFromDB(deps: Record<string, string>, devDeps: Record<string, string>): Promise<string[]> {
    const allDeps = { ...deps, ...devDeps }
    const detectedLibraries: string[] = []
    
    // Get all icon libraries from database
    const iconLibraries = await this.dbService.getIconLibraries()
    
    // Check each icon library
    for (const library of iconLibraries) {
      if (library.packageName && allDeps[library.packageName]) {
        detectedLibraries.push(library.name)
      }
    }
    
    return detectedLibraries
  }

  private async detectCSSFramework(deps: Record<string, string>): Promise<string | null> {
    const allDeps = { ...deps.production, ...deps.development }
    
    // First check for CSS frameworks from database
    const cssFrameworks = await this.dbService.getCSSFrameworks()
    for (const framework of cssFrameworks) {
      if (framework.npmPackage && allDeps[framework.npmPackage]) {
        return framework.name
      }
    }
    
    // Fallback to common CSS frameworks
    if (allDeps['tailwindcss']) return 'Tailwind CSS'
    if (allDeps['bootstrap']) return 'Bootstrap'
    if (allDeps['bulma']) return 'Bulma'
    if (allDeps['foundation-sites']) return 'Foundation'
    if (allDeps['unocss']) return 'UnoCSS'
    if (allDeps['windicss']) return 'Windi CSS'
    
    // Check for CSS-in-JS
    if (allDeps['styled-components']) return 'Styled Components'
    if (allDeps['@emotion/react'] || allDeps['@emotion/styled']) return 'Emotion'
    if (allDeps['@stitches/react']) return 'Stitches'
    if (allDeps['styled-jsx']) return 'Styled JSX'
    if (allDeps['@vanilla-extract/css']) return 'Vanilla Extract'
    
    // Check for CSS modules in config
    if (await this.fileExists('postcss.config.js') || await this.fileExists('postcss.config.cjs')) {
      const content = await this.readFile('postcss.config.js') || await this.readFile('postcss.config.cjs')
      if (content && content.includes('postcss-modules')) return 'CSS Modules'
    }
    
    return null
  }

  // Helper methods (same as original but with minor adjustments)
  
  private async readPackageJson(subPath?: string): Promise<any> {
    try {
      const packagePath = subPath ? join(this.workspace, subPath, 'package.json') : join(this.workspace, 'package.json')
      const content = await readFile(packagePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  private async fileExists(filePath: string, workspace?: string): Promise<boolean> {
    try {
      const fullPath = workspace ? join(workspace, filePath) : join(this.workspace, filePath)
      await access(fullPath, constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  private async readFile(filePath: string, workspace?: string): Promise<string | null> {
    try {
      const fullPath = workspace ? join(workspace, filePath) : join(this.workspace, filePath)
      return await readFile(fullPath, 'utf-8')
    } catch {
      return null
    }
  }

  private hasPackage(deps: Record<string, Record<string, string>>, packageName: string): boolean {
    return !!(deps.production[packageName] || deps.development[packageName])
  }

  private async detectPackageManager(workspace?: string): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'> {
    if (await this.fileExists('bun.lockb', workspace)) return 'bun'
    if (await this.fileExists('pnpm-lock.yaml', workspace)) return 'pnpm'
    if (await this.fileExists('yarn.lock', workspace)) return 'yarn'
    return 'npm'
  }

  private detectMonorepo(packageJson: any): boolean {
    return !!(packageJson.workspaces || 
              packageJson.bolt?.workspaces ||
              this.fileExists('lerna.json') ||
              this.fileExists('rush.json') ||
              this.fileExists('pnpm-workspace.yaml'))
  }

  private getWorkspaces(packageJson: any): string[] | undefined {
    if (Array.isArray(packageJson.workspaces)) {
      return packageJson.workspaces
    }
    if (packageJson.workspaces?.packages) {
      return packageJson.workspaces.packages
    }
    return undefined
  }

  private async analyzeProjectStructure(): Promise<SmartProjectAnalysis['structure']> {
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
    structure.hasSourceFolder = await this.fileExists('src')
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
      const fullPath = join(base, compPath)
      if (await this.fileExists(fullPath)) {
        structure.componentsPath = fullPath
        break
      }
    }

    // Pages/routes
    const pagePaths = ['pages', 'app', 'routes', 'views']
    for (const pagePath of pagePaths) {
      const fullPath = join(base, pagePath)
      if (await this.fileExists(fullPath)) {
        structure.pagesPath = fullPath
        break
      }
    }

    // API routes
    const apiPaths = ['api', 'pages/api', 'app/api', 'server/api']
    for (const apiPath of apiPaths) {
      if (await this.fileExists(apiPath)) {
        structure.apiPath = apiPath
        break
      }
    }

    // Styles
    const stylePaths = ['styles', 'css', 'scss', 'sass']
    for (const stylePath of stylePaths) {
      const fullPath = join(base, stylePath)
      if (await this.fileExists(fullPath)) {
        structure.stylesPath = fullPath
        break
      }
    }

    // Public assets
    if (await this.fileExists('public')) {
      structure.publicPath = 'public'
    } else if (await this.fileExists('static')) {
      structure.publicPath = 'static'
    }

    // Tests
    const testPaths = ['tests', 'test', '__tests__', 'spec']
    for (const testPath of testPaths) {
      if (await this.fileExists(testPath)) {
        structure.testsPath = testPath
        break
      }
    }

    return structure
  }

  private detectFeatures(analysis: SmartProjectAnalysis): void {
    const deps = analysis.dependencies.all
    
    // Testing
    analysis.features.hasTests = !!(deps['jest'] || deps['vitest'] || deps['mocha'] || deps['@testing-library/react'])
    
    // Linting & Formatting
    analysis.features.hasLinting = !!(deps['eslint'] || analysis.scripts['lint'])
    analysis.features.hasFormatting = !!(deps['prettier'] || analysis.scripts['format'])
    
    // CI/CD
    analysis.features.hasCI = this.fileExists('.github/workflows') || this.fileExists('.circleci') || this.fileExists('.gitlab-ci.yml')
    analysis.features.hasDocker = this.fileExists('Dockerfile') || this.fileExists('docker-compose.yml')
    
    // Auth
    analysis.features.hasAuth = !!(deps['next-auth'] || deps['@clerk/nextjs'] || deps['@auth0/nextjs-auth0'])
    analysis.features.hasClerk = !!deps['@clerk/nextjs']
    
    // Database
    analysis.features.hasDatabase = !!(deps['prisma'] || deps['typeorm'] || deps['mongoose'] || deps['sequelize'])
    
    // API
    analysis.features.hasAPI = !!(analysis.structure.apiPath || deps['express'] || deps['fastify'] || deps['hono'])
    analysis.features.hasGraphQL = !!(deps['graphql'] || deps['apollo-server'] || deps['@apollo/client'])
    analysis.features.hasREST = !!(deps['express'] || deps['fastify'] || deps['hono'] || analysis.structure.apiPath)
    
    // Features
    analysis.features.hasInternationalization = !!(deps['next-i18next'] || deps['react-i18next'] || deps['vue-i18n'])
    analysis.features.hasAnalytics = !!(deps['@vercel/analytics'] || deps['@google-analytics/data'])
    analysis.features.hasPayments = !!(deps['stripe'] || deps['@stripe/stripe-js'])
    analysis.features.hasStripe = !!(deps['stripe'] || deps['@stripe/stripe-js'])
    analysis.features.hasEmail = !!(deps['nodemailer'] || deps['@sendgrid/mail'] || deps['resend'])
    analysis.features.hasWebSockets = !!(deps['socket.io'] || deps['ws'])
    
    // Rendering
    analysis.features.hasSSR = !!(deps['next'] || deps['nuxt'] || deps['@angular/universal'])
    analysis.features.hasSSG = !!(deps['gatsby'] || deps['@11ty/eleventy'] || deps['vitepress'])
    analysis.features.hasISR = !!deps['next'] // Next.js specific
    analysis.features.hasPWA = !!(deps['next-pwa'] || deps['workbox-webpack-plugin'])
    
    // Build tools
    analysis.features.hasWebpack = !!deps['webpack']
    analysis.features.hasVite = !!deps['vite']
    analysis.features.hasEsbuild = !!deps['esbuild']
    analysis.features.hasSWC = !!deps['@swc/core']
    analysis.features.hasBabel = !!deps['@babel/core']
    analysis.features.hasTurbopack = !!deps['turbopack']
  }

  private async countComponents(componentsPath: string | null): Promise<number> {
    if (!componentsPath) return 0
    
    try {
      const files = await glob('**/*.{jsx,tsx,js,ts,vue}', {
        cwd: join(this.workspace, componentsPath),
        ignore: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*']
      })
      return files.length
    } catch {
      return 0
    }
  }

  private async getComponentTypes(componentsPath: string | null): Promise<string[]> {
    if (!componentsPath) return []
    
    const types = new Set<string>()
    
    try {
      const files = await glob('**/*.{jsx,tsx,js,ts,vue}', {
        cwd: join(this.workspace, componentsPath),
        ignore: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*']
      })
      
      for (const file of files) {
        const parts = file.split('/')
        if (parts.length > 1) {
          types.add(parts[0])
        }
      }
    } catch {
      // Ignore errors
    }
    
    return Array.from(types)
  }

  private async detectSubProjects(): Promise<SubProject[]> {
    const subProjects: SubProject[] = []
    
    try {
      const packageJsonFiles = await glob('*/package.json', {
        cwd: this.workspace,
        ignore: ['node_modules/**', '**/node_modules/**']
      })
      
      for (const file of packageJsonFiles) {
        const dir = file.replace('/package.json', '')
        const fullPath = join(this.workspace, dir)
        
        try {
          const packageJson = await this.readPackageJson(dir)
          if (packageJson) {
            const subProject: SubProject = {
              name: packageJson.name || dir,
              path: fullPath,
              type: 'unknown',
              hasPackageJson: true,
              description: packageJson.description
            }
            
            // Detect type based on dependencies using database
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
            const frameworks = await this.detectFrameworksFromDB(packageJson.dependencies || {}, packageJson.devDependencies || {})
            
            if (frameworks.length > 0) {
              subProject.framework = frameworks[0]
              subProject.type = frameworks[0].toLowerCase().replace('.js', '').replace(/\s+/g, '-')
            } else if (!deps['react'] && !deps['vue'] && !deps['@angular/core']) {
              subProject.type = 'node'
              subProject.framework = 'Node.js'
            }
            
            subProjects.push(subProject)
          }
        } catch {
          // Ignore errors for individual sub-projects
        }
      }
    } catch {
      // Ignore glob errors
    }
    
    return subProjects
  }

  private async generateRecommendations(analysis: SmartProjectAnalysis): Promise<string[]> {
    const recommendations: string[] = []
    
    // Framework recommendations
    if (analysis.detectedFrameworks.length === 0) {
      recommendations.push('Consider using a modern framework like Next.js, Nuxt, or SvelteKit for better developer experience')
    }
    
    // UI library recommendations
    if (analysis.detectedUILibraries.length === 0) {
      recommendations.push('Add a UI component library like Material-UI, Ant Design, or Chakra UI to speed up development')
    }
    
    // Icon library recommendations
    if (analysis.detectedIconLibraries.length === 0) {
      recommendations.push('Consider adding an icon library like Lucide, React Icons, or Heroicons')
    }
    
    // TypeScript
    if (!analysis.hasTypeScript) {
      recommendations.push('Add TypeScript for better type safety and IDE support')
    }
    
    // CSS framework
    if (!analysis.cssFramework) {
      recommendations.push('Consider using a CSS framework like Tailwind CSS or a CSS-in-JS solution')
    }
    
    // Testing
    if (!analysis.features.hasTests) {
      recommendations.push('Set up a testing framework like Jest or Vitest')
    }
    
    // Linting & Formatting
    if (!analysis.features.hasLinting) {
      recommendations.push('Add ESLint for code quality')
    }
    if (!analysis.features.hasFormatting) {
      recommendations.push('Add Prettier for consistent code formatting')
    }
    
    // Auth
    if (!analysis.features.hasAuth && (analysis.features.hasAPI || analysis.structure.pagesPath)) {
      recommendations.push('Consider adding authentication with NextAuth.js, Clerk, or Auth0')
    }
    
    // Database
    if (!analysis.features.hasDatabase && analysis.features.hasAPI) {
      recommendations.push('Add a database with Prisma, TypeORM, or Mongoose')
    }
    
    return recommendations
  }
}