import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'
import chalk from 'chalk'
import crypto from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface AnalysisOptions {
  deep?: boolean
  includeNodeModules?: boolean
  analyzeGitHistory?: boolean
  detectPatterns?: boolean
  scanDependencies?: boolean
  checkEnvironment?: boolean
}

export interface ProjectAnalysis {
  id: string
  timestamp: Date
  workspace: string
  summary: {
    name: string
    type: string
    framework: string
    language: string
    packageManager: string
    hasTypeScript: boolean
    hasTailwind: boolean
    hasESLint: boolean
    hasPrettier: boolean
    hasTests: boolean
    hasCI: boolean
  }
  structure: {
    totalFiles: number
    totalDirectories: number
    fileTypes: Record<string, number>
    largestFiles: Array<{ path: string; size: number }>
    deepestNesting: number
    componentsCount: number
    pagesCount: number
  }
  dependencies: {
    production: Record<string, string>
    development: Record<string, string>
    frameworks: string[]
    uiLibraries: string[]
    buildTools: string[]
    testingLibraries: string[]
  }
  patterns: {
    componentPatterns: string[]
    stateManagement: string[]
    routingPattern: string
    apiPattern: string
    authPattern: string
    stylingPattern: string
  }
  metrics: {
    totalLinesOfCode: number
    codeByLanguage: Record<string, number>
    averageFileSize: number
    complexityScore: number
    testCoverage?: number
  }
  git?: {
    isRepository: boolean
    branch: string
    lastCommit: string
    uncommittedChanges: number
    contributors: number
    totalCommits: number
  }
  environment: {
    nodeVersion: string
    npmVersion: string
    platform: string
    cpus: number
    memory: number
  }
  recommendations: string[]
  warnings: string[]
  hasMultipleClaudeSessions?: boolean
  isEnterprise?: boolean
  frameworks: string[]
  contributors?: number
  hasGit?: boolean
}

export class ProjectAnalyzer {
  private cache: Map<string, any> = new Map()

  async analyzeProject(options: AnalysisOptions = {}): Promise<ProjectAnalysis> {
    const workspace = process.cwd()
    const analysisId = crypto.randomUUID()
    
    const analysis: ProjectAnalysis = {
      id: analysisId,
      timestamp: new Date(),
      workspace,
      summary: await this.analyzeSummary(workspace),
      structure: await this.analyzeStructure(workspace, options),
      dependencies: await this.analyzeDependencies(workspace),
      patterns: await this.detectPatterns(workspace, options),
      metrics: await this.calculateMetrics(workspace, options),
      environment: await this.analyzeEnvironment(),
      recommendations: [],
      warnings: [],
      frameworks: [],
      hasGit: false
    }

    // Git analysis
    if (options.analyzeGitHistory) {
      analysis.git = await this.analyzeGit(workspace)
      analysis.hasGit = analysis.git.isRepository
      analysis.contributors = analysis.git.contributors
    }

    // Detect multiple Claude sessions
    analysis.hasMultipleClaudeSessions = await this.detectClaudeSessions(workspace)

    // Detect enterprise features
    analysis.isEnterprise = this.detectEnterpriseFeatures(analysis)

    // Extract frameworks
    console.log(chalk.gray('  Extracting frameworks...'))
    analysis.frameworks = this.extractFrameworks(analysis.dependencies)

    // Generate recommendations
    console.log(chalk.gray('  Generating recommendations...'))
    analysis.recommendations = await this.generateRecommendations(analysis)
    
    console.log(chalk.gray('  Generating warnings...'))
    analysis.warnings = this.generateWarnings(analysis)

    console.log(chalk.green('  ✓ Analysis complete!'))
    return analysis
  }

  private async analyzeSummary(workspace: string): Promise<ProjectAnalysis['summary']> {
    const packageJsonPath = path.join(workspace, 'package.json')
    let packageJson: any = {}

    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      packageJson = JSON.parse(content)
    } catch {
      // No package.json
    }

    // Detect framework
    const framework = await this.detectFramework(workspace, packageJson)
    
    // Detect language
    const hasTypeScript = await this.fileExists(path.join(workspace, 'tsconfig.json'))
    const language = hasTypeScript ? 'TypeScript' : 'JavaScript'

    // Detect tools
    const hasTailwind = await this.detectTailwind(workspace, packageJson)
    const hasESLint = await this.fileExists(path.join(workspace, '.eslintrc.js')) ||
                      await this.fileExists(path.join(workspace, '.eslintrc.json'))
    const hasPrettier = await this.fileExists(path.join(workspace, '.prettierrc'))
    
    // Detect tests
    const hasTests = await this.detectTests(workspace, packageJson)
    
    // Detect CI
    const hasCI = await this.detectCI(workspace)

    // Detect package manager
    const packageManager = await this.detectPackageManager(workspace)

    return {
      name: packageJson.name || path.basename(workspace),
      type: this.detectProjectType(packageJson, framework),
      framework,
      language,
      packageManager,
      hasTypeScript,
      hasTailwind,
      hasESLint,
      hasPrettier,
      hasTests,
      hasCI
    }
  }

  private async analyzeStructure(workspace: string, options: AnalysisOptions): Promise<ProjectAnalysis['structure']> {
    const ignorePatterns = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**'
    ]

    if (!options.includeNodeModules) {
      ignorePatterns.push('**/node_modules/**')
    }

    // Get all files
    console.log(chalk.gray('  Scanning project structure...'))
    const files = await glob('**/*', {
      cwd: workspace,
      ignore: ignorePatterns,
      dot: true,
      nodir: true
    })
    console.log(chalk.gray(`  Found ${files.length} files`))

    // Get all directories
    const directories = await glob('**/', {
      cwd: workspace,
      ignore: ignorePatterns,
      dot: true
    })

    // Analyze file types
    const fileTypes: Record<string, number> = {}
    const fileSizes: Array<{ path: string; size: number }> = []
    
    // Limit file stat operations to prevent hanging
    const maxFilesToStat = 1000
    const filesToAnalyze = files.slice(0, maxFilesToStat)
    
    if (files.length > maxFilesToStat) {
      console.log(chalk.yellow(`  Analyzing first ${maxFilesToStat} files for size (${files.length - maxFilesToStat} skipped)`))
    }
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase()
      fileTypes[ext] = (fileTypes[ext] || 0) + 1
    }
    
    // Only get stats for limited files
    for (const file of filesToAnalyze) {
      try {
        const stats = await fs.stat(path.join(workspace, file))
        fileSizes.push({ path: file, size: stats.size })
      } catch {
        // Skip files that can't be accessed
      }
    }

    // Sort by size
    fileSizes.sort((a, b) => b.size - a.size)

    // Count components and pages
    const componentsCount = files.filter(f => 
      f.includes('component') || f.includes('Component')
    ).length

    const pagesCount = files.filter(f => 
      f.includes('pages/') || f.includes('app/') && f.endsWith('.tsx') || f.endsWith('.jsx')
    ).length

    // Calculate deepest nesting
    const deepestNesting = Math.max(...files.map(f => f.split('/').length))

    return {
      totalFiles: files.length,
      totalDirectories: directories.length,
      fileTypes,
      largestFiles: fileSizes.slice(0, 10),
      deepestNesting,
      componentsCount,
      pagesCount
    }
  }

  private async analyzeDependencies(workspace: string): Promise<ProjectAnalysis['dependencies']> {
    const packageJsonPath = path.join(workspace, 'package.json')
    
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(content)
      
      const deps = packageJson.dependencies || {}
      const devDeps = packageJson.devDependencies || {}
      
      // Categorize dependencies
      const frameworks = this.categorizeFrameworks(deps)
      const uiLibraries = this.categorizeUILibraries({ ...deps, ...devDeps })
      const buildTools = this.categorizeBuildTools(devDeps)
      const testingLibraries = this.categorizeTestingLibraries(devDeps)
      
      return {
        production: deps,
        development: devDeps,
        frameworks,
        uiLibraries,
        buildTools,
        testingLibraries
      }
    } catch {
      return {
        production: {},
        development: {},
        frameworks: [],
        uiLibraries: [],
        buildTools: [],
        testingLibraries: []
      }
    }
  }

  private async detectPatterns(workspace: string, options: AnalysisOptions): Promise<ProjectAnalysis['patterns']> {
    if (!options.detectPatterns) {
      return {
        componentPatterns: [],
        stateManagement: [],
        routingPattern: 'unknown',
        apiPattern: 'unknown',
        authPattern: 'unknown',
        stylingPattern: 'unknown'
      }
    }

    // Detect component patterns
    const componentPatterns = await this.detectComponentPatterns(workspace)
    
    // Detect state management
    const stateManagement = await this.detectStateManagement(workspace)
    
    // Detect routing pattern
    const routingPattern = await this.detectRoutingPattern(workspace)
    
    // Detect API pattern
    const apiPattern = await this.detectAPIPattern(workspace)
    
    // Detect auth pattern
    const authPattern = await this.detectAuthPattern(workspace)
    
    // Detect styling pattern
    const stylingPattern = await this.detectStylingPattern(workspace)
    
    return {
      componentPatterns,
      stateManagement,
      routingPattern,
      apiPattern,
      authPattern,
      stylingPattern
    }
  }

  private async calculateMetrics(workspace: string, options: AnalysisOptions): Promise<ProjectAnalysis['metrics']> {
    console.log(chalk.gray('  Scanning for source files...'))
    const files = await glob('**/*.{js,jsx,ts,tsx,vue,svelte}', {
      cwd: workspace,
      ignore: [
        '**/node_modules/**', 
        '**/dist/**', 
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/.cache/**',
        '**/tmp/**',
        '**/temp/**'
      ]
    })
    console.log(chalk.gray(`  Found ${files.length} source files to analyze`))

    let totalLines = 0
    const codeByLanguage: Record<string, number> = {}
    
    // Limit analysis to prevent hanging on large projects
    const filesToAnalyze = files.slice(0, 500)
    if (files.length > 500) {
      console.log(chalk.yellow(`  Analyzing first 500 files (${files.length - 500} files skipped for performance)`))
    }
    
    let filesProcessed = 0
    for (const file of filesToAnalyze) {
      const filePath = path.join(workspace, file)
      try {
        const stat = await fs.stat(filePath)
        if (stat.isFile()) {
          const content = await fs.readFile(filePath, 'utf-8')
          const lines = content.split('\n').length
          totalLines += lines
          
          const ext = path.extname(file)
          codeByLanguage[ext] = (codeByLanguage[ext] || 0) + lines
          
          filesProcessed++
          if (filesProcessed % 50 === 0) {
            process.stdout.write('.')
          }
        }
      } catch (error) {
        // Skip files that can't be read
        continue
      }
    }
    if (filesProcessed > 0) {
      console.log('') // New line after dots
    }
    
    console.log(chalk.gray(`  Analyzed ${filesProcessed} files, ${totalLines} total lines of code`))

    const averageFileSize = files.length > 0 ? Math.round(totalLines / files.length) : 0
    
    // Simple complexity score based on file count and nesting
    const complexityScore = Math.round(
      (files.length * 0.1) + 
      (totalLines * 0.001) +
      (Object.keys(codeByLanguage).length * 10)
    )

    return {
      totalLinesOfCode: totalLines,
      codeByLanguage,
      averageFileSize,
      complexityScore
    }
  }

  private async analyzeGit(workspace: string): Promise<ProjectAnalysis['git']> {
    console.log(chalk.gray('  Analyzing Git repository...'))
    try {
      // Check if git repo
      await execAsync('git rev-parse --git-dir', { cwd: workspace })
      
      // Get current branch
      const { stdout: branch } = await execAsync('git branch --show-current', { cwd: workspace })
      
      // Get last commit
      const { stdout: lastCommit } = await execAsync('git log -1 --oneline', { cwd: workspace })
      
      // Count uncommitted changes
      const { stdout: status } = await execAsync('git status --porcelain', { cwd: workspace })
      const uncommittedChanges = status.split('\n').filter(line => line.trim()).length
      
      // Count contributors - this can be slow on large repos, so limit it
      let contributorCount = 0
      try {
        const { stdout: contributors } = await execAsync('git shortlog -sn HEAD', { cwd: workspace })
        contributorCount = contributors.split('\n').filter(line => line.trim()).length
      } catch {
        contributorCount = 1 // Default to 1 if command fails
      }
      
      // Total commits - also can be slow
      let totalCommits = 0
      try {
        const { stdout: commits } = await execAsync('git rev-list HEAD --count', { cwd: workspace })
        totalCommits = parseInt(commits.trim()) || 0
      } catch {
        totalCommits = 0
      }
      
      return {
        isRepository: true,
        branch: branch.trim(),
        lastCommit: lastCommit.trim(),
        uncommittedChanges,
        contributors: contributorCount,
        totalCommits
      }
    } catch {
      return {
        isRepository: false,
        branch: '',
        lastCommit: '',
        uncommittedChanges: 0,
        contributors: 0,
        totalCommits: 0
      }
    }
  }

  private async analyzeEnvironment(): Promise<ProjectAnalysis['environment']> {
    const os = require('os')
    
    // Get Node version
    const { stdout: nodeVersion } = await execAsync('node --version')
    
    // Get npm version
    let npmVersion = 'unknown'
    try {
      const { stdout } = await execAsync('npm --version')
      npmVersion = stdout.trim()
    } catch {
      // npm not available
    }
    
    return {
      nodeVersion: nodeVersion.trim(),
      npmVersion,
      platform: os.platform(),
      cpus: os.cpus().length,
      memory: Math.round(os.totalmem() / (1024 * 1024 * 1024)) // GB
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

  private async detectFramework(workspace: string, packageJson: any): Promise<string> {
    // Check dependencies
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    if (deps['next']) return 'Next.js'
    if (deps['nuxt']) return 'Nuxt'
    if (deps['@angular/core']) return 'Angular'
    if (deps['vue']) return 'Vue'
    if (deps['svelte']) return 'Svelte'
    if (deps['solid-js']) return 'Solid'
    if (deps['gatsby']) return 'Gatsby'
    if (deps['@remix-run/react']) return 'Remix'
    if (deps['react']) return 'React'
    
    // Check for framework config files
    if (await this.fileExists(path.join(workspace, 'next.config.js'))) return 'Next.js'
    if (await this.fileExists(path.join(workspace, 'nuxt.config.js'))) return 'Nuxt'
    if (await this.fileExists(path.join(workspace, 'angular.json'))) return 'Angular'
    if (await this.fileExists(path.join(workspace, 'vue.config.js'))) return 'Vue'
    
    return 'Unknown'
  }

  private detectProjectType(packageJson: any, framework: string): string {
    if (framework === 'Next.js' || framework === 'Nuxt' || framework === 'Gatsby') {
      return 'Web Application'
    }
    
    if (packageJson.scripts?.build?.includes('electron')) {
      return 'Desktop Application'
    }
    
    if (packageJson.dependencies?.['react-native']) {
      return 'Mobile Application'
    }
    
    if (packageJson.main && !packageJson.scripts?.start) {
      return 'Library'
    }
    
    return 'Web Application'
  }

  private async detectTailwind(workspace: string, packageJson: any): Promise<boolean> {
    if (packageJson.dependencies?.['tailwindcss'] || packageJson.devDependencies?.['tailwindcss']) {
      return true
    }
    
    return await this.fileExists(path.join(workspace, 'tailwind.config.js')) ||
           await this.fileExists(path.join(workspace, 'tailwind.config.ts'))
  }

  private async detectTests(workspace: string, packageJson: any): Promise<boolean> {
    const hasTestScript = packageJson.scripts?.test && packageJson.scripts.test !== 'echo "Error: no test specified" && exit 1'
    const hasTestDir = await this.fileExists(path.join(workspace, '__tests__')) ||
                      await this.fileExists(path.join(workspace, 'test')) ||
                      await this.fileExists(path.join(workspace, 'tests'))
    
    return hasTestScript || hasTestDir
  }

  private async detectCI(workspace: string): Promise<boolean> {
    return await this.fileExists(path.join(workspace, '.github/workflows')) ||
           await this.fileExists(path.join(workspace, '.gitlab-ci.yml')) ||
           await this.fileExists(path.join(workspace, '.circleci')) ||
           await this.fileExists(path.join(workspace, 'Jenkinsfile'))
  }

  private async detectPackageManager(workspace: string): Promise<string> {
    if (await this.fileExists(path.join(workspace, 'pnpm-lock.yaml'))) return 'pnpm'
    if (await this.fileExists(path.join(workspace, 'yarn.lock'))) return 'yarn'
    if (await this.fileExists(path.join(workspace, 'package-lock.json'))) return 'npm'
    if (await this.fileExists(path.join(workspace, 'bun.lockb'))) return 'bun'
    return 'npm' // default
  }

  private async detectClaudeSessions(workspace: string): Promise<boolean> {
    const claudeFiles = [
      '.claude-session-monitor.js',
      '.parallel-session-monitor.js',
      '.enhanced-session-monitor.js',
      'CLAUDE.md',
      'CLAUDE_CONTEXT.md'
    ]
    
    for (const file of claudeFiles) {
      if (await this.fileExists(path.join(workspace, file))) {
        return true
      }
    }
    
    return false
  }

  private detectEnterpriseFeatures(analysis: ProjectAnalysis): boolean {
    return analysis.dependencies.production['@enterprise'] !== undefined ||
           analysis.structure.totalFiles > 1000 ||
           (analysis.git?.contributors || 0) > 10
  }

  private extractFrameworks(dependencies: ProjectAnalysis['dependencies']): string[] {
    return [...dependencies.frameworks, ...dependencies.uiLibraries]
  }

  private categorizeFrameworks(deps: Record<string, string>): string[] {
    const frameworks = []
    
    if (deps['react']) frameworks.push('React')
    if (deps['vue']) frameworks.push('Vue')
    if (deps['@angular/core']) frameworks.push('Angular')
    if (deps['svelte']) frameworks.push('Svelte')
    if (deps['solid-js']) frameworks.push('Solid')
    if (deps['next']) frameworks.push('Next.js')
    if (deps['nuxt']) frameworks.push('Nuxt')
    if (deps['gatsby']) frameworks.push('Gatsby')
    if (deps['@remix-run/react']) frameworks.push('Remix')
    
    return frameworks
  }

  private categorizeUILibraries(deps: Record<string, string>): string[] {
    const uiLibs = []
    
    if (deps['@mui/material']) uiLibs.push('Material-UI')
    if (deps['antd']) uiLibs.push('Ant Design')
    if (deps['@chakra-ui/react']) uiLibs.push('Chakra UI')
    if (deps['tailwindcss']) uiLibs.push('Tailwind CSS')
    if (deps['bootstrap']) uiLibs.push('Bootstrap')
    if (deps['semantic-ui-react']) uiLibs.push('Semantic UI')
    if (deps['@headlessui/react']) uiLibs.push('Headless UI')
    if (deps['@radix-ui/themes']) uiLibs.push('Radix UI')
    
    return uiLibs
  }

  private categorizeBuildTools(devDeps: Record<string, string>): string[] {
    const buildTools = []
    
    if (devDeps['webpack']) buildTools.push('Webpack')
    if (devDeps['vite']) buildTools.push('Vite')
    if (devDeps['parcel']) buildTools.push('Parcel')
    if (devDeps['rollup']) buildTools.push('Rollup')
    if (devDeps['esbuild']) buildTools.push('ESBuild')
    if (devDeps['@swc/core']) buildTools.push('SWC')
    
    return buildTools
  }

  private categorizeTestingLibraries(devDeps: Record<string, string>): string[] {
    const testLibs = []
    
    if (devDeps['jest']) testLibs.push('Jest')
    if (devDeps['vitest']) testLibs.push('Vitest')
    if (devDeps['mocha']) testLibs.push('Mocha')
    if (devDeps['@testing-library/react']) testLibs.push('Testing Library')
    if (devDeps['cypress']) testLibs.push('Cypress')
    if (devDeps['@playwright/test']) testLibs.push('Playwright')
    if (devDeps['puppeteer']) testLibs.push('Puppeteer')
    
    return testLibs
  }

  private async detectComponentPatterns(workspace: string): Promise<string[]> {
    const patterns = []
    
    // Check for common component patterns
    const files = await glob('**/*.{jsx,tsx}', {
      cwd: workspace,
      ignore: ['**/node_modules/**']
    })
    
    const sampleFiles = files.slice(0, 20)
    for (const file of sampleFiles) {
      const content = await fs.readFile(path.join(workspace, file), 'utf-8')
      
      if (content.includes('function') && content.includes('return')) {
        patterns.push('Functional Components')
        break
      }
      if (content.includes('class') && content.includes('extends Component')) {
        patterns.push('Class Components')
        break
      }
    }
    
    // Check for hooks
    if (files.some(f => f.includes('hooks/') || f.includes('use'))) {
      patterns.push('Custom Hooks')
    }
    
    // Check for HOCs
    if (files.some(f => f.toLowerCase().includes('hoc') || f.includes('with'))) {
      patterns.push('Higher-Order Components')
    }
    
    return patterns
  }

  private async detectStateManagement(workspace: string): Promise<string[]> {
    const packageJsonPath = path.join(workspace, 'package.json')
    const stateLibs = []
    
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const { dependencies = {} } = JSON.parse(content)
      
      if (dependencies['redux']) stateLibs.push('Redux')
      if (dependencies['mobx']) stateLibs.push('MobX')
      if (dependencies['zustand']) stateLibs.push('Zustand')
      if (dependencies['recoil']) stateLibs.push('Recoil')
      if (dependencies['jotai']) stateLibs.push('Jotai')
      if (dependencies['valtio']) stateLibs.push('Valtio')
      if (dependencies['@reduxjs/toolkit']) stateLibs.push('Redux Toolkit')
    } catch {
      // No package.json
    }
    
    // Check for Context API usage
    const files = await glob('**/*.{jsx,tsx}', {
      cwd: workspace,
      ignore: ['**/node_modules/**']
    })
    
    for (const file of files.slice(0, 10)) {
      const content = await fs.readFile(path.join(workspace, file), 'utf-8')
      if (content.includes('createContext') || content.includes('useContext')) {
        stateLibs.push('Context API')
        break
      }
    }
    
    return stateLibs
  }

  private async detectRoutingPattern(workspace: string): Promise<string> {
    // Check for Next.js app router
    if (await this.fileExists(path.join(workspace, 'app'))) {
      return 'Next.js App Router'
    }
    
    // Check for Next.js pages router
    if (await this.fileExists(path.join(workspace, 'pages'))) {
      return 'Next.js Pages Router'
    }
    
    // Check for React Router
    const packageJsonPath = path.join(workspace, 'package.json')
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const { dependencies = {} } = JSON.parse(content)
      
      if (dependencies['react-router-dom']) return 'React Router'
      if (dependencies['@reach/router']) return 'Reach Router'
      if (dependencies['vue-router']) return 'Vue Router'
    } catch {
      // No package.json
    }
    
    return 'File-based routing'
  }

  private async detectAPIPattern(workspace: string): Promise<string> {
    // Check for API routes
    if (await this.fileExists(path.join(workspace, 'pages/api')) ||
        await this.fileExists(path.join(workspace, 'app/api'))) {
      return 'API Routes'
    }
    
    // Check for GraphQL
    const files = await glob('**/*.{graphql,gql}', {
      cwd: workspace,
      ignore: ['**/node_modules/**']
    })
    
    if (files.length > 0) {
      return 'GraphQL'
    }
    
    // Check for tRPC
    const packageJsonPath = path.join(workspace, 'package.json')
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const { dependencies = {} } = JSON.parse(content)
      
      if (dependencies['@trpc/server']) return 'tRPC'
      if (dependencies['axios'] || dependencies['fetch']) return 'REST API'
    } catch {
      // No package.json
    }
    
    return 'REST API'
  }

  private async detectAuthPattern(workspace: string): Promise<string> {
    const packageJsonPath = path.join(workspace, 'package.json')
    
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const { dependencies = {} } = JSON.parse(content)
      
      if (dependencies['next-auth']) return 'NextAuth.js'
      if (dependencies['@auth0/nextjs-auth0']) return 'Auth0'
      if (dependencies['@clerk/nextjs']) return 'Clerk'
      if (dependencies['@supabase/supabase-js']) return 'Supabase Auth'
      if (dependencies['firebase']) return 'Firebase Auth'
    } catch {
      // No package.json
    }
    
    // Check for custom auth
    const authFiles = await glob('**/*{auth,login,signin}*.{js,jsx,ts,tsx}', {
      cwd: workspace,
      ignore: ['**/node_modules/**']
    })
    
    if (authFiles.length > 0) {
      return 'Custom Authentication'
    }
    
    return 'None detected'
  }

  private async detectStylingPattern(workspace: string): Promise<string> {
    const packageJsonPath = path.join(workspace, 'package.json')
    
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const { dependencies = {}, devDependencies = {} } = JSON.parse(content)
      const allDeps = { ...dependencies, ...devDependencies }
      
      if (allDeps['tailwindcss']) return 'Tailwind CSS'
      if (allDeps['styled-components']) return 'Styled Components'
      if (allDeps['@emotion/react']) return 'Emotion'
      if (allDeps['sass'] || allDeps['node-sass']) return 'Sass/SCSS'
      if (allDeps['less']) return 'Less'
      if (allDeps['stylus']) return 'Stylus'
      if (allDeps['@stitches/react']) return 'Stitches'
      if (allDeps['@vanilla-extract/css']) return 'Vanilla Extract'
    } catch {
      // No package.json
    }
    
    // Check for CSS modules
    const cssModules = await glob('**/*.module.{css,scss,sass}', {
      cwd: workspace,
      ignore: ['**/node_modules/**']
    })
    
    if (cssModules.length > 0) {
      return 'CSS Modules'
    }
    
    return 'Plain CSS'
  }

  private async generateRecommendations(analysis: ProjectAnalysis): Promise<string[]> {
    const recommendations = []
    
    // TypeScript recommendation
    if (!analysis.summary.hasTypeScript) {
      recommendations.push('Consider adding TypeScript for better type safety and developer experience')
    }
    
    // Testing recommendation
    if (!analysis.summary.hasTests) {
      recommendations.push('Add a testing framework like Jest or Vitest to ensure code quality')
    }
    
    // Linting recommendation
    if (!analysis.summary.hasESLint) {
      recommendations.push('Set up ESLint for consistent code style and error prevention')
    }
    
    // CI/CD recommendation
    if (!analysis.summary.hasCI) {
      recommendations.push('Implement CI/CD with GitHub Actions or similar for automated testing and deployment')
    }
    
    // Component organization
    if (analysis.structure.componentsCount > 20 && !analysis.patterns.componentPatterns.includes('Compound Components')) {
      recommendations.push('Consider organizing components using compound component patterns')
    }
    
    // State management
    if (analysis.structure.componentsCount > 50 && analysis.patterns.stateManagement.length === 0) {
      recommendations.push('Consider adding a state management solution like Zustand or Redux Toolkit')
    }
    
    // Performance
    if (analysis.structure.largestFiles.some(f => f.size > 1000000)) {
      recommendations.push('Some files are very large - consider code splitting and lazy loading')
    }
    
    // Documentation
    const readmePath = path.join(analysis.workspace, 'README.md')
    try {
      await fs.access(readmePath)
    } catch {
      recommendations.push('Add a README.md file to document your project')
    }
    
    return recommendations
  }

  private generateWarnings(analysis: ProjectAnalysis): string[] {
    const warnings = []
    
    // Security warnings
    if (analysis.dependencies.production['eval'] || analysis.dependencies.production['vm2']) {
      warnings.push('Potentially dangerous packages detected - review security implications')
    }
    
    // Outdated dependencies
    // This would need actual version checking in production
    
    // Large bundle warnings
    if (analysis.metrics.totalLinesOfCode > 100000) {
      warnings.push('Large codebase detected - ensure proper code splitting is implemented')
    }
    
    // Deep nesting warning
    if (analysis.structure.deepestNesting > 10) {
      warnings.push('Very deep folder nesting detected - consider flattening structure')
    }
    
    // Git warnings
    if (analysis.git && analysis.git.uncommittedChanges > 50) {
      warnings.push('Many uncommitted changes detected - consider committing your work')
    }
    
    return warnings
  }
}