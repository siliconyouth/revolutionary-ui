/**
 * Revolutionary UI Factory - Project Detector
 * Analyzes project structure and detects installed frameworks, libraries, and tools
 */

import * as fs from 'fs'
import * as path from 'path'
import { FRAMEWORK_CONFIGS } from '../../config/frameworks'
import { UI_LIBRARIES } from '../../config/ui-libraries'
import { ICON_LIBRARIES } from '../../config/icon-libraries'
import { DESIGN_TOOLS, COLOR_TOOLS, FONTS } from '../../config/design-tools'

export interface DetectedPackage {
  name: string
  version: string
  type: 'framework' | 'ui-library' | 'icon-library' | 'design-tool' | 'color-tool' | 'font' | 'utility'
  installed: boolean
  currentVersion?: string
  latestVersion?: string
  needsUpdate?: boolean
}

export interface ProjectAnalysis {
  projectName: string
  projectPath: string
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
  frameworks: DetectedPackage[]
  uiLibraries: DetectedPackage[]
  iconLibraries: DetectedPackage[]
  designTools: DetectedPackage[]
  colorTools: DetectedPackage[]
  fonts: DetectedPackage[]
  utilities: DetectedPackage[]
  buildTools: string[]
  hasTypeScript: boolean
  hasTailwind: boolean
  hasESLint: boolean
  hasPrettier: boolean
  testingFrameworks: string[]
  recommendations: Recommendation[]
}

export interface Recommendation {
  type: string
  packages: string[]
  reason: string
  priority: 'high' | 'medium' | 'low'
}

export class ProjectDetector {
  private projectPath: string
  private packageJson: any
  private packageLockJson: any
  private dependencies: Record<string, string> = {}
  private devDependencies: Record<string, string> = {}

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath
  }

  /**
   * Main analysis function
   */
  async analyze(): Promise<ProjectAnalysis> {
    // Load package.json
    await this.loadPackageJson()
    
    // Detect package manager
    const packageManager = this.detectPackageManager()
    
    // Merge dependencies
    this.dependencies = { ...this.packageJson.dependencies || {} }
    this.devDependencies = { ...this.packageJson.devDependencies || {} }
    
    // Detect all components
    const frameworks = this.detectFrameworks()
    const uiLibraries = this.detectUILibraries()
    const iconLibraries = this.detectIconLibraries()
    const designTools = this.detectDesignTools()
    const colorTools = this.detectColorTools()
    const fonts = this.detectFonts()
    const utilities = this.detectUtilities()
    const buildTools = this.detectBuildTools()
    
    // Check for common tools
    const hasTypeScript = this.hasTypeScript()
    const hasTailwind = this.hasTailwind()
    const hasESLint = this.hasESLint()
    const hasPrettier = this.hasPrettier()
    const testingFrameworks = this.detectTestingFrameworks()
    
    // Generate recommendations
    const recommendations = this.generateRecommendations({
      frameworks,
      uiLibraries,
      iconLibraries,
      hasTypeScript,
      hasTailwind
    })

    return {
      projectName: this.packageJson.name || 'unknown',
      projectPath: this.projectPath,
      packageManager,
      frameworks,
      uiLibraries,
      iconLibraries,
      designTools,
      colorTools,
      fonts,
      utilities,
      buildTools,
      hasTypeScript,
      hasTailwind,
      hasESLint,
      hasPrettier,
      testingFrameworks,
      recommendations
    }
  }

  /**
   * Load package.json
   */
  private async loadPackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json')
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('No package.json found in the project directory')
    }
    
    const content = fs.readFileSync(packageJsonPath, 'utf-8')
    this.packageJson = JSON.parse(content)
  }

  /**
   * Detect package manager
   */
  private detectPackageManager(): 'npm' | 'yarn' | 'pnpm' | 'bun' {
    if (fs.existsSync(path.join(this.projectPath, 'bun.lockb'))) return 'bun'
    if (fs.existsSync(path.join(this.projectPath, 'pnpm-lock.yaml'))) return 'pnpm'
    if (fs.existsSync(path.join(this.projectPath, 'yarn.lock'))) return 'yarn'
    return 'npm'
  }

  /**
   * Detect installed frameworks
   */
  private detectFrameworks(): DetectedPackage[] {
    const detected: DetectedPackage[] = []
    
    for (const framework of FRAMEWORK_CONFIGS) {
      const isInstalled = this.isPackageInstalled(framework.packageName)
      const currentVersion = this.getPackageVersion(framework.packageName)
      
      detected.push({
        name: framework.name,
        version: framework.version,
        type: 'framework',
        installed: isInstalled,
        currentVersion,
        latestVersion: framework.version,
        needsUpdate: currentVersion ? this.needsUpdate(currentVersion, framework.version) : false
      })
    }
    
    // Also check for common frameworks not in our config
    const additionalFrameworks = [
      { name: 'gatsby', display: 'Gatsby' },
      { name: 'remix', display: 'Remix' },
      { name: 'astro', display: 'Astro' },
      { name: 'vitepress', display: 'VitePress' }
    ]
    
    for (const fw of additionalFrameworks) {
      if (this.isPackageInstalled(fw.name)) {
        detected.push({
          name: fw.display,
          version: this.getPackageVersion(fw.name) || 'unknown',
          type: 'framework',
          installed: true,
          currentVersion: this.getPackageVersion(fw.name)
        })
      }
    }
    
    return detected
  }

  /**
   * Detect UI libraries
   */
  private detectUILibraries(): DetectedPackage[] {
    const detected: DetectedPackage[] = []
    
    for (const lib of UI_LIBRARIES) {
      const isInstalled = this.isPackageInstalled(lib.packageName)
      const currentVersion = this.getPackageVersion(lib.packageName)
      
      detected.push({
        name: lib.name,
        version: lib.version,
        type: 'ui-library',
        installed: isInstalled,
        currentVersion,
        latestVersion: lib.version,
        needsUpdate: currentVersion ? this.needsUpdate(currentVersion, lib.version) : false
      })
    }
    
    return detected
  }

  /**
   * Detect icon libraries
   */
  private detectIconLibraries(): DetectedPackage[] {
    const detected: DetectedPackage[] = []
    
    for (const lib of ICON_LIBRARIES) {
      const isInstalled = this.isPackageInstalled(lib.packageName)
      const currentVersion = this.getPackageVersion(lib.packageName)
      
      detected.push({
        name: lib.name,
        version: lib.version,
        type: 'icon-library',
        installed: isInstalled,
        currentVersion,
        latestVersion: lib.version,
        needsUpdate: currentVersion ? this.needsUpdate(currentVersion, lib.version) : false
      })
    }
    
    return detected
  }

  /**
   * Detect design tools
   */
  private detectDesignTools(): DetectedPackage[] {
    const detected: DetectedPackage[] = []
    
    for (const tool of DESIGN_TOOLS) {
      const isInstalled = this.isPackageInstalled(tool.packageName)
      const currentVersion = this.getPackageVersion(tool.packageName)
      
      detected.push({
        name: tool.name,
        version: tool.version,
        type: 'design-tool',
        installed: isInstalled,
        currentVersion,
        latestVersion: tool.version,
        needsUpdate: currentVersion ? this.needsUpdate(currentVersion, tool.version) : false
      })
    }
    
    return detected
  }

  /**
   * Detect color tools
   */
  private detectColorTools(): DetectedPackage[] {
    const detected: DetectedPackage[] = []
    
    for (const tool of COLOR_TOOLS) {
      const isInstalled = this.isPackageInstalled(tool.packageName)
      const currentVersion = this.getPackageVersion(tool.packageName)
      
      detected.push({
        name: tool.name,
        version: tool.version,
        type: 'color-tool',
        installed: isInstalled,
        currentVersion,
        latestVersion: tool.version,
        needsUpdate: currentVersion ? this.needsUpdate(currentVersion, tool.version) : false
      })
    }
    
    return detected
  }

  /**
   * Detect fonts
   */
  private detectFonts(): DetectedPackage[] {
    const detected: DetectedPackage[] = []
    
    for (const font of FONTS) {
      const isInstalled = this.isPackageInstalled(font.packageName)
      const currentVersion = this.getPackageVersion(font.packageName)
      
      detected.push({
        name: font.name,
        version: font.version,
        type: 'font',
        installed: isInstalled,
        currentVersion,
        latestVersion: font.version,
        needsUpdate: currentVersion ? this.needsUpdate(currentVersion, font.version) : false
      })
    }
    
    return detected
  }

  /**
   * Detect common utilities
   */
  private detectUtilities(): DetectedPackage[] {
    const utilities = [
      { name: 'clsx', display: 'clsx' },
      { name: 'classnames', display: 'classnames' },
      { name: 'tailwind-merge', display: 'Tailwind Merge' },
      { name: 'class-variance-authority', display: 'CVA' },
      { name: 'framer-motion', display: 'Framer Motion' },
      { name: 'zod', display: 'Zod' },
      { name: 'react-hook-form', display: 'React Hook Form' },
      { name: 'axios', display: 'Axios' },
      { name: 'swr', display: 'SWR' },
      { name: '@tanstack/react-query', display: 'React Query' }
    ]
    
    return utilities
      .filter(util => this.isPackageInstalled(util.name))
      .map(util => ({
        name: util.display,
        version: this.getPackageVersion(util.name) || 'unknown',
        type: 'utility' as const,
        installed: true,
        currentVersion: this.getPackageVersion(util.name)
      }))
  }

  /**
   * Detect build tools
   */
  private detectBuildTools(): string[] {
    const tools: string[] = []
    
    const buildTools = [
      'webpack', 'vite', 'parcel', 'rollup', 'esbuild', 
      'turbo', 'nx', 'lerna', 'rush'
    ]
    
    for (const tool of buildTools) {
      if (this.isPackageInstalled(tool)) {
        tools.push(tool)
      }
    }
    
    return tools
  }

  /**
   * Detect testing frameworks
   */
  private detectTestingFrameworks(): string[] {
    const frameworks: string[] = []
    
    const testingTools = [
      'jest', 'vitest', 'mocha', 'jasmine',
      '@testing-library/react', '@testing-library/vue',
      'cypress', 'playwright', '@playwright/test',
      'puppeteer', 'karma'
    ]
    
    for (const tool of testingTools) {
      if (this.isPackageInstalled(tool)) {
        frameworks.push(tool)
      }
    }
    
    return frameworks
  }

  /**
   * Check if TypeScript is installed
   */
  private hasTypeScript(): boolean {
    return this.isPackageInstalled('typescript') || 
           fs.existsSync(path.join(this.projectPath, 'tsconfig.json'))
  }

  /**
   * Check if Tailwind is installed
   */
  private hasTailwind(): boolean {
    return this.isPackageInstalled('tailwindcss') || 
           fs.existsSync(path.join(this.projectPath, 'tailwind.config.js')) ||
           fs.existsSync(path.join(this.projectPath, 'tailwind.config.ts'))
  }

  /**
   * Check if ESLint is installed
   */
  private hasESLint(): boolean {
    return this.isPackageInstalled('eslint') || 
           fs.existsSync(path.join(this.projectPath, '.eslintrc.js')) ||
           fs.existsSync(path.join(this.projectPath, '.eslintrc.json'))
  }

  /**
   * Check if Prettier is installed
   */
  private hasPrettier(): boolean {
    return this.isPackageInstalled('prettier') || 
           fs.existsSync(path.join(this.projectPath, '.prettierrc'))
  }

  /**
   * Check if a package is installed
   */
  private isPackageInstalled(packageName: string): boolean {
    return packageName in this.dependencies || packageName in this.devDependencies
  }

  /**
   * Get package version
   */
  private getPackageVersion(packageName: string): string | undefined {
    return this.dependencies[packageName] || this.devDependencies[packageName]
  }

  /**
   * Check if package needs update
   */
  private needsUpdate(currentVersion: string, latestVersion: string): boolean {
    // Simple version comparison - in real app would use semver
    const current = currentVersion.replace(/[\^~]/, '').split('.').map(Number)
    const latest = latestVersion.split('.').map(Number)
    
    for (let i = 0; i < 3; i++) {
      if ((latest[i] || 0) > (current[i] || 0)) return true
      if ((latest[i] || 0) < (current[i] || 0)) return false
    }
    
    return false
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(analysis: {
    frameworks: DetectedPackage[]
    uiLibraries: DetectedPackage[]
    iconLibraries: DetectedPackage[]
    hasTypeScript: boolean
    hasTailwind: boolean
  }): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    // Check if any framework is installed
    const hasFramework = analysis.frameworks.some(f => f.installed)
    if (!hasFramework) {
      recommendations.push({
        type: 'framework',
        packages: ['react', 'vue', 'angular'],
        reason: 'No framework detected. Consider installing a modern framework.',
        priority: 'high'
      })
    }
    
    // Check for UI libraries
    const hasUILibrary = analysis.uiLibraries.some(lib => lib.installed)
    if (!hasUILibrary && hasFramework) {
      const framework = analysis.frameworks.find(f => f.installed)
      if (framework?.name.toLowerCase().includes('react')) {
        recommendations.push({
          type: 'ui-library',
          packages: ['@mui/material', '@chakra-ui/react', 'antd'],
          reason: 'No UI library detected. These libraries work great with React.',
          priority: 'medium'
        })
      }
    }
    
    // Check for icon libraries
    const hasIconLibrary = analysis.iconLibraries.some(lib => lib.installed)
    if (!hasIconLibrary) {
      recommendations.push({
        type: 'icon-library',
        packages: ['lucide-react', 'react-icons', '@heroicons/react'],
        reason: 'No icon library detected. Icons are essential for modern UIs.',
        priority: 'medium'
      })
    }
    
    // TypeScript recommendation
    if (!analysis.hasTypeScript) {
      recommendations.push({
        type: 'development',
        packages: ['typescript', '@types/react', '@types/node'],
        reason: 'TypeScript provides better type safety and developer experience.',
        priority: 'high'
      })
    }
    
    // Tailwind recommendation
    if (!analysis.hasTailwind) {
      recommendations.push({
        type: 'styling',
        packages: ['tailwindcss', '@tailwindcss/forms', '@tailwindcss/typography'],
        reason: 'Tailwind CSS enables rapid UI development with utility classes.',
        priority: 'medium'
      })
    }
    
    // Check for packages that need updates
    const needsUpdate = [
      ...analysis.frameworks,
      ...analysis.uiLibraries,
      ...analysis.iconLibraries
    ].filter(pkg => pkg.needsUpdate)
    
    if (needsUpdate.length > 0) {
      recommendations.push({
        type: 'updates',
        packages: needsUpdate.map(pkg => pkg.name),
        reason: `${needsUpdate.length} packages have newer versions available.`,
        priority: 'low'
      })
    }
    
    return recommendations
  }
}