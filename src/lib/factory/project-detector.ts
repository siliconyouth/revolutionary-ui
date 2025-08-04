/**
 * Revolutionary UI Factory - Project Detector
 * Analyzes project structure and detects installed frameworks, libraries, and tools
 */

import * as fs from 'fs'
import * as path from 'path'
import { ConfigDatabaseService } from '../../services/config-database-service'

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
  private configService: ConfigDatabaseService

  constructor(projectPath: string) {
    this.projectPath = projectPath
    this.configService = ConfigDatabaseService.getInstance()
  }

  /**
   * Analyze the project and return comprehensive results
   */
  async analyze(): Promise<ProjectAnalysis> {
    // Read package.json
    const packageJsonPath = path.join(this.projectPath, 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('No package.json found in the project directory')
    }

    this.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    
    const dependencies = { ...this.packageJson.dependencies, ...this.packageJson.devDependencies }

    // Get configurations from database
    const frameworkConfigs = await this.configService.getFrameworkConfigs()
    const uiLibraries = await this.configService.getUILibraries()
    const iconLibraries = await this.configService.getIconLibraries()
    const designTools = await this.configService.getDesignTools()
    const colorTools = await this.configService.getColorTools()
    const fonts = await this.configService.getFonts()

    const analysis: ProjectAnalysis = {
      projectName: this.packageJson.name || path.basename(this.projectPath),
      projectPath: this.projectPath,
      packageManager: this.detectPackageManager(),
      frameworks: this.detectPackages(dependencies, frameworkConfigs, 'framework'),
      uiLibraries: this.detectPackages(dependencies, uiLibraries, 'ui-library'),
      iconLibraries: this.detectPackages(dependencies, iconLibraries, 'icon-library'),
      designTools: this.detectPackages(dependencies, designTools, 'design-tool'),
      colorTools: this.detectPackages(dependencies, colorTools, 'color-tool'),
      fonts: this.detectPackages(dependencies, fonts, 'font'),
      utilities: this.detectUtilities(dependencies),
      buildTools: this.detectBuildTools(dependencies),
      hasTypeScript: this.hasTypeScript(dependencies),
      hasTailwind: this.hasTailwind(dependencies),
      hasESLint: this.hasESLint(dependencies),
      hasPrettier: this.hasPrettier(dependencies),
      testingFrameworks: this.detectTestingFrameworks(dependencies),
      recommendations: []
    }

    // Generate recommendations based on analysis
    analysis.recommendations = this.generateRecommendations(analysis)

    return analysis
  }

  /**
   * Detect which package manager is being used
   */
  private detectPackageManager(): 'npm' | 'yarn' | 'pnpm' | 'bun' {
    if (fs.existsSync(path.join(this.projectPath, 'bun.lockb'))) return 'bun'
    if (fs.existsSync(path.join(this.projectPath, 'pnpm-lock.yaml'))) return 'pnpm'
    if (fs.existsSync(path.join(this.projectPath, 'yarn.lock'))) return 'yarn'
    return 'npm'
  }

  /**
   * Detect packages based on configuration
   */
  private detectPackages(
    dependencies: Record<string, string>, 
    configs: any[], 
    type: DetectedPackage['type']
  ): DetectedPackage[] {
    return configs.map(config => {
      const installed = !!dependencies[config.packageName]
      const currentVersion = installed ? dependencies[config.packageName].replace(/[\^~]/, '') : undefined

      return {
        name: config.name,
        version: config.version || 'latest',
        type,
        installed,
        currentVersion,
        latestVersion: config.version || 'latest',
        needsUpdate: installed && currentVersion !== config.version
      }
    })
  }

  /**
   * Detect utility packages
   */
  private detectUtilities(dependencies: Record<string, string>): DetectedPackage[] {
    const utilityPackages = [
      { name: 'clsx', packageName: 'clsx' },
      { name: 'class-variance-authority', packageName: 'class-variance-authority' },
      { name: 'framer-motion', packageName: 'framer-motion' },
      { name: 'zod', packageName: 'zod' },
      { name: 'react-hook-form', packageName: 'react-hook-form' },
      { name: 'formik', packageName: 'formik' },
      { name: 'zustand', packageName: 'zustand' },
      { name: 'valtio', packageName: 'valtio' },
      { name: 'jotai', packageName: 'jotai' },
      { name: 'redux', packageName: 'redux' },
      { name: '@reduxjs/toolkit', packageName: '@reduxjs/toolkit' },
      { name: 'react-query', packageName: 'react-query' },
      { name: '@tanstack/react-query', packageName: '@tanstack/react-query' },
      { name: 'swr', packageName: 'swr' },
      { name: 'axios', packageName: 'axios' },
      { name: 'lodash', packageName: 'lodash' },
      { name: 'date-fns', packageName: 'date-fns' },
      { name: 'dayjs', packageName: 'dayjs' },
      { name: 'moment', packageName: 'moment' }
    ]

    return utilityPackages
      .filter(pkg => dependencies[pkg.packageName])
      .map(pkg => ({
        name: pkg.name,
        version: dependencies[pkg.packageName].replace(/[\^~]/, ''),
        type: 'utility' as const,
        installed: true,
        currentVersion: dependencies[pkg.packageName].replace(/[\^~]/, '')
      }))
  }

  /**
   * Detect build tools
   */
  private detectBuildTools(dependencies: Record<string, string>): string[] {
    const buildTools = []
    
    if (dependencies['vite']) buildTools.push('Vite')
    if (dependencies['webpack']) buildTools.push('Webpack')
    if (dependencies['parcel']) buildTools.push('Parcel')
    if (dependencies['rollup']) buildTools.push('Rollup')
    if (dependencies['esbuild']) buildTools.push('esbuild')
    if (dependencies['turbopack']) buildTools.push('Turbopack')
    if (dependencies['@swc/core']) buildTools.push('SWC')
    if (dependencies['babel-core'] || dependencies['@babel/core']) buildTools.push('Babel')

    return buildTools
  }

  /**
   * Check for TypeScript
   */
  private hasTypeScript(dependencies: Record<string, string>): boolean {
    return !!dependencies['typescript']
  }

  /**
   * Check for Tailwind CSS
   */
  private hasTailwind(dependencies: Record<string, string>): boolean {
    return !!dependencies['tailwindcss']
  }

  /**
   * Check for ESLint
   */
  private hasESLint(dependencies: Record<string, string>): boolean {
    return !!dependencies['eslint']
  }

  /**
   * Check for Prettier
   */
  private hasPrettier(dependencies: Record<string, string>): boolean {
    return !!dependencies['prettier']
  }

  /**
   * Detect testing frameworks
   */
  private detectTestingFrameworks(dependencies: Record<string, string>): string[] {
    const testingFrameworks = []

    if (dependencies['jest']) testingFrameworks.push('Jest')
    if (dependencies['vitest']) testingFrameworks.push('Vitest')
    if (dependencies['mocha']) testingFrameworks.push('Mocha')
    if (dependencies['cypress']) testingFrameworks.push('Cypress')
    if (dependencies['playwright']) testingFrameworks.push('Playwright')
    if (dependencies['@testing-library/react']) testingFrameworks.push('React Testing Library')
    if (dependencies['@testing-library/vue']) testingFrameworks.push('Vue Testing Library')
    if (dependencies['karma']) testingFrameworks.push('Karma')
    if (dependencies['jasmine']) testingFrameworks.push('Jasmine')

    return testingFrameworks
  }

  /**
   * Generate recommendations based on project analysis
   */
  private generateRecommendations(analysis: ProjectAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Framework recommendations
    if (!analysis.frameworks.some(f => f.installed)) {
      recommendations.push({
        type: 'framework',
        packages: ['react', 'vue', 'angular'],
        reason: 'No JavaScript framework detected. Consider adding one for better structure.',
        priority: 'high'
      })
    }

    // UI Library recommendations
    if (!analysis.uiLibraries.some(lib => lib.installed)) {
      const framework = analysis.frameworks.find(f => f.installed)
      let suggestedLibraries = ['@mui/material', 'antd', 'bootstrap']

      if (framework?.name === 'React') {
        suggestedLibraries = ['@mui/material', '@chakra-ui/react', 'antd']
      } else if (framework?.name === 'Vue') {
        suggestedLibraries = ['vuetify', 'element-plus', 'naive-ui']
      }

      recommendations.push({
        type: 'ui-library',
        packages: suggestedLibraries,
        reason: 'No UI component library detected. Adding one can speed up development.',
        priority: 'medium'
      })
    }

    // Icon library recommendations
    if (!analysis.iconLibraries.some(lib => lib.installed)) {
      recommendations.push({
        type: 'icon-library',
        packages: ['lucide-react', 'react-icons', '@heroicons/react'],
        reason: 'No icon library detected. Icons are essential for modern UI.',
        priority: 'medium'
      })
    }

    // TypeScript recommendation
    if (!analysis.hasTypeScript) {
      recommendations.push({
        type: 'development',
        packages: ['typescript'],
        reason: 'TypeScript not detected. Consider adding for better type safety.',
        priority: 'medium'
      })
    }

    // Styling recommendation
    if (!analysis.hasTailwind && !analysis.utilities.some(u => u.name.includes('styled-components'))) {
      recommendations.push({
        type: 'styling',
        packages: ['tailwindcss', 'styled-components', '@emotion/react'],
        reason: 'No modern CSS solution detected. Consider adding for better styling.',
        priority: 'medium'
      })
    }

    // Testing recommendation
    if (analysis.testingFrameworks.length === 0) {
      recommendations.push({
        type: 'testing',
        packages: ['vitest', 'jest', '@testing-library/react'],
        reason: 'No testing framework detected. Tests ensure code quality.',
        priority: 'low'
      })
    }

    return recommendations
  }
}