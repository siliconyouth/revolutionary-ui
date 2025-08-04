/**
 * Revolutionary UI Factory - Project Analyzer
 * Provides intelligent recommendations based on project analysis
 */

import { ProjectAnalysis, DetectedPackage, Recommendation } from './project-detector'
import { ConfigDatabaseService } from '../../services/config-database-service'

export interface AnalysisReport {
  summary: ProjectSummary
  compatibility: CompatibilityReport
  recommendations: EnhancedRecommendation[]
  missingFeatures: MissingFeature[]
  optimizations: Optimization[]
  setupPlan: SetupPlan
}

export interface ProjectSummary {
  frameworkStack: string[]
  uiStack: string[]
  designCapabilities: string[]
  developmentTools: string[]
  coverage: {
    frameworks: number
    uiLibraries: number
    icons: number
    designTools: number
    overall: number
  }
}

export interface CompatibilityReport {
  compatible: string[]
  incompatible: string[]
  warnings: string[]
}

export interface EnhancedRecommendation extends Recommendation {
  benefits: string[]
  installCommand: string
  configExample?: string
  alternativePackages?: string[]
}

export interface MissingFeature {
  feature: string
  impact: 'critical' | 'important' | 'nice-to-have'
  suggestedPackages: string[]
  description: string
}

export interface Optimization {
  type: string
  description: string
  action: string
  impact: string
}

export interface SetupPlan {
  steps: SetupStep[]
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface SetupStep {
  order: number
  title: string
  description: string
  packages: string[]
  command: string
  optional: boolean
}

export class ProjectAnalyzer {
  private analysis: ProjectAnalysis
  private configService: ConfigDatabaseService

  constructor(analysis: ProjectAnalysis) {
    this.analysis = analysis
    this.configService = ConfigDatabaseService.getInstance()
  }

  /**
   * Generate comprehensive analysis report
   */
  async generateReport(): Promise<AnalysisReport> {
    const summary = await this.generateSummary()
    const compatibility = this.checkCompatibility()
    const recommendations = this.enhanceRecommendations()
    const missingFeatures = this.identifyMissingFeatures()
    const optimizations = this.suggestOptimizations()
    const setupPlan = this.createSetupPlan(recommendations)

    return {
      summary,
      compatibility,
      recommendations,
      missingFeatures,
      optimizations,
      setupPlan
    }
  }

  /**
   * Generate project summary
   */
  private async generateSummary(): Promise<ProjectSummary> {
    const frameworkStack = this.analysis.frameworks
      .filter(f => f.installed)
      .map(f => f.name)

    const uiStack = this.analysis.uiLibraries
      .filter(lib => lib.installed)
      .map(lib => lib.name)

    const designCapabilities = [
      ...this.analysis.designTools.filter(t => t.installed).map(t => t.name),
      ...this.analysis.colorTools.filter(t => t.installed).map(t => t.name)
    ]

    const developmentTools = []
    if (this.analysis.hasTypeScript) developmentTools.push('TypeScript')
    if (this.analysis.hasTailwind) developmentTools.push('Tailwind CSS')
    if (this.analysis.hasESLint) developmentTools.push('ESLint')
    if (this.analysis.hasPrettier) developmentTools.push('Prettier')
    developmentTools.push(...this.analysis.buildTools)

    // Get counts from database
    const frameworkConfigs = await this.configService.getFrameworkConfigs()
    const uiLibraries = await this.configService.getUILibraries()
    const iconLibraries = await this.configService.getIconLibraries()
    const designTools = await this.configService.getDesignTools()

    const totalPossible = 
      frameworkConfigs.length + 
      uiLibraries.length + 
      iconLibraries.length + 
      designTools.length

    const totalInstalled = 
      this.analysis.frameworks.filter(f => f.installed).length +
      this.analysis.uiLibraries.filter(l => l.installed).length +
      this.analysis.iconLibraries.filter(l => l.installed).length +
      this.analysis.designTools.filter(t => t.installed).length

    return {
      frameworkStack,
      uiStack,
      designCapabilities,
      developmentTools,
      coverage: {
        frameworks: Math.round((this.analysis.frameworks.filter(f => f.installed).length / frameworkConfigs.length) * 100),
        uiLibraries: Math.round((this.analysis.uiLibraries.filter(l => l.installed).length / uiLibraries.length) * 100),
        icons: Math.round((this.analysis.iconLibraries.filter(l => l.installed).length / iconLibraries.length) * 100),
        designTools: Math.round((this.analysis.designTools.filter(t => t.installed).length / designTools.length) * 100),
        overall: Math.round((totalInstalled / totalPossible) * 100)
      }
    }
  }

  /**
   * Check compatibility between installed packages
   */
  private checkCompatibility(): CompatibilityReport {
    const compatible: string[] = []
    const incompatible: string[] = []
    const warnings: string[] = []

    // Check React version compatibility
    const react = this.analysis.frameworks.find(f => f.name === 'React' && f.installed)
    if (react && react.currentVersion?.startsWith('19')) {
      // Check for libraries that might not support React 19 yet
      const mui = this.analysis.uiLibraries.find(lib => lib.name.includes('MUI') && lib.installed)
      if (mui) {
        compatible.push('Material-UI (MUI) supports React 19')
      }

      // Some libraries might need --legacy-peer-deps
      const semanticUI = this.analysis.uiLibraries.find(lib => lib.name.includes('Semantic') && lib.installed)
      if (semanticUI) {
        warnings.push('Semantic UI React may require --legacy-peer-deps with React 19')
      }
    }

    // Check Tailwind v4 compatibility
    if (this.analysis.hasTailwind) {
      const tailwindPlugins = [
        '@tailwindcss/forms',
        '@tailwindcss/typography',
        '@tailwindcss/aspect-ratio'
      ]
      
      tailwindPlugins.forEach(plugin => {
        if (this.isPackageInstalled(plugin)) {
          compatible.push(`${plugin} is compatible with Tailwind CSS v4`)
        }
      })
    }

    // Check for known incompatibilities
    const vue = this.analysis.frameworks.find(f => f.name === 'Vue' && f.installed)
    const reactFramework = this.analysis.frameworks.find(f => f.name === 'React' && f.installed)
    
    if (vue && reactFramework) {
      warnings.push('Both Vue and React detected. Consider using one primary framework.')
    }

    return { compatible, incompatible, warnings }
  }

  /**
   * Enhance recommendations with additional context
   */
  private enhanceRecommendations(): EnhancedRecommendation[] {
    return this.analysis.recommendations.map(rec => {
      const enhanced: EnhancedRecommendation = {
        ...rec,
        benefits: this.getPackageBenefits(rec.type, rec.packages),
        installCommand: this.getInstallCommand(rec.packages),
        alternativePackages: this.getAlternatives(rec.type, rec.packages)
      }

      // Add config examples for certain types
      if (rec.type === 'styling' && rec.packages.includes('tailwindcss')) {
        enhanced.configExample = `// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: []
}`
      }

      return enhanced
    })
  }

  /**
   * Identify missing features
   */
  private identifyMissingFeatures(): MissingFeature[] {
    const features: MissingFeature[] = []

    // Check for component library
    if (!this.analysis.uiLibraries.some(lib => lib.installed)) {
      features.push({
        feature: 'Component Library',
        impact: 'important',
        suggestedPackages: this.getSuggestedUILibraries(),
        description: 'A component library accelerates development with pre-built, tested components.'
      })
    }

    // Check for icon library
    if (!this.analysis.iconLibraries.some(lib => lib.installed)) {
      features.push({
        feature: 'Icon Library',
        impact: 'important',
        suggestedPackages: ['lucide-react', 'react-icons', '@heroicons/react'],
        description: 'Icons are essential for modern UI. Choose from 75,000+ icons.'
      })
    }

    // Check for animation library
    const hasAnimation = this.isPackageInstalled('framer-motion') || 
                        this.isPackageInstalled('react-spring') ||
                        this.isPackageInstalled('@react-spring/web')
    
    if (!hasAnimation) {
      features.push({
        feature: 'Animation Library',
        impact: 'nice-to-have',
        suggestedPackages: ['framer-motion', '@react-spring/web', 'auto-animate'],
        description: 'Animations enhance user experience and make interfaces feel more responsive.'
      })
    }

    // Check for form handling
    const hasFormLibrary = this.isPackageInstalled('react-hook-form') || 
                          this.isPackageInstalled('formik') ||
                          this.isPackageInstalled('@mantine/form')
    
    if (!hasFormLibrary && this.hasReact()) {
      features.push({
        feature: 'Form Management',
        impact: 'important',
        suggestedPackages: ['react-hook-form', 'formik', '@mantine/form'],
        description: 'Form libraries simplify validation, error handling, and state management.'
      })
    }

    // Check for state management
    const hasStateManagement = this.isPackageInstalled('zustand') || 
                              this.isPackageInstalled('redux') ||
                              this.isPackageInstalled('@reduxjs/toolkit') ||
                              this.isPackageInstalled('valtio') ||
                              this.isPackageInstalled('jotai')
    
    if (!hasStateManagement && this.hasReact()) {
      features.push({
        feature: 'State Management',
        impact: 'nice-to-have',
        suggestedPackages: ['zustand', '@reduxjs/toolkit', 'valtio', 'jotai'],
        description: 'State management libraries help manage complex application state.'
      })
    }

    // Check for design tools integration
    if (!this.analysis.designTools.some(tool => tool.installed)) {
      features.push({
        feature: 'Design Tools Integration',
        impact: 'nice-to-have',
        suggestedPackages: ['figma-js', '@figma/code-connect', 'figma-to-react'],
        description: 'Import designs directly from Figma or Sketch to accelerate development.'
      })
    }

    return features
  }

  /**
   * Suggest optimizations
   */
  private suggestOptimizations(): Optimization[] {
    const optimizations: Optimization[] = []

    // Bundle size optimization
    if (this.analysis.uiLibraries.filter(lib => lib.installed).length > 3) {
      optimizations.push({
        type: 'bundle-size',
        description: 'Multiple UI libraries detected',
        action: 'Consider using tree-shaking or removing unused libraries',
        impact: 'Can reduce bundle size by 30-50%'
      })
    }

    // TypeScript adoption
    if (!this.analysis.hasTypeScript) {
      optimizations.push({
        type: 'type-safety',
        description: 'TypeScript not detected',
        action: 'Add TypeScript for better type safety and IDE support',
        impact: 'Reduces bugs by 15-20% according to studies'
      })
    }

    // CSS optimization
    if (!this.analysis.hasTailwind && !this.isPackageInstalled('styled-components')) {
      optimizations.push({
        type: 'styling',
        description: 'No modern CSS solution detected',
        action: 'Consider Tailwind CSS or CSS-in-JS for better maintainability',
        impact: 'Can reduce CSS size by 70% with Tailwind'
      })
    }

    // Development experience
    if (!this.analysis.hasESLint || !this.analysis.hasPrettier) {
      optimizations.push({
        type: 'code-quality',
        description: 'Code quality tools missing',
        action: 'Add ESLint and Prettier for consistent code style',
        impact: 'Improves team collaboration and reduces review time'
      })
    }

    // Performance monitoring
    if (!this.isPackageInstalled('@vercel/analytics') && this.hasNext()) {
      optimizations.push({
        type: 'performance',
        description: 'No analytics/monitoring detected',
        action: 'Add performance monitoring to track user experience',
        impact: 'Helps identify and fix performance issues'
      })
    }

    return optimizations
  }

  /**
   * Create setup plan
   */
  private createSetupPlan(recommendations: EnhancedRecommendation[]): SetupPlan {
    const steps: SetupStep[] = []
    let order = 1

    // Step 1: Core framework (if missing)
    const frameworkRec = recommendations.find(r => r.type === 'framework')
    if (frameworkRec) {
      steps.push({
        order: order++,
        title: 'Install Core Framework',
        description: 'Set up your primary JavaScript framework',
        packages: frameworkRec.packages.slice(0, 1), // Just first recommendation
        command: frameworkRec.installCommand,
        optional: false
      })
    }

    // Step 2: TypeScript (if recommended)
    const tsRec = recommendations.find(r => r.packages.includes('typescript'))
    if (tsRec) {
      steps.push({
        order: order++,
        title: 'Add TypeScript',
        description: 'Enable type safety and better IDE support',
        packages: ['typescript', '@types/react', '@types/node'],
        command: `${this.analysis.packageManager} ${this.analysis.packageManager === 'npm' ? 'install' : 'add'} -D typescript @types/react @types/node`,
        optional: false
      })
    }

    // Step 3: UI Library
    const uiRec = recommendations.find(r => r.type === 'ui-library')
    if (uiRec) {
      steps.push({
        order: order++,
        title: 'Install UI Component Library',
        description: 'Add pre-built components for rapid development',
        packages: uiRec.packages.slice(0, 1),
        command: uiRec.installCommand,
        optional: false
      })
    }

    // Step 4: Styling solution
    const styleRec = recommendations.find(r => r.type === 'styling')
    if (styleRec) {
      steps.push({
        order: order++,
        title: 'Set Up Styling',
        description: 'Configure your CSS/styling solution',
        packages: styleRec.packages,
        command: styleRec.installCommand,
        optional: false
      })
    }

    // Step 5: Icons
    const iconRec = recommendations.find(r => r.type === 'icon-library')
    if (iconRec) {
      steps.push({
        order: order++,
        title: 'Add Icon Library',
        description: 'Install icons for your UI',
        packages: iconRec.packages.slice(0, 1),
        command: iconRec.installCommand,
        optional: true
      })
    }

    // Step 6: Development tools
    steps.push({
      order: order++,
      title: 'Configure Development Tools',
      description: 'Set up linting, formatting, and other dev tools',
      packages: ['eslint', 'prettier'],
      command: `${this.analysis.packageManager} ${this.analysis.packageManager === 'npm' ? 'install' : 'add'} -D eslint prettier`,
      optional: true
    })

    // Calculate estimated time
    const estimatedMinutes = steps.length * 5 + (steps.filter(s => !s.optional).length * 10)
    const estimatedTime = estimatedMinutes < 60 
      ? `${estimatedMinutes} minutes` 
      : `${Math.round(estimatedMinutes / 60)} hours`

    // Determine difficulty
    const difficulty = steps.length <= 3 ? 'easy' : steps.length <= 5 ? 'medium' : 'hard'

    return {
      steps,
      estimatedTime,
      difficulty
    }
  }

  // Helper methods

  private isPackageInstalled(packageName: string): boolean {
    return this.analysis.frameworks.some(f => f.name === packageName && f.installed) ||
           this.analysis.uiLibraries.some(l => l.name === packageName && l.installed) ||
           this.analysis.utilities.some(u => u.name === packageName && u.installed) ||
           false
  }

  private hasReact(): boolean {
    return this.analysis.frameworks.some(f => f.name === 'React' && f.installed)
  }

  private hasNext(): boolean {
    return this.analysis.frameworks.some(f => f.name === 'Next.js' && f.installed)
  }

  private getPackageBenefits(type: string, packages: string[]): string[] {
    const benefitsMap: Record<string, string[]> = {
      'ui-library': [
        'Pre-built, tested components',
        'Consistent design system',
        'Accessibility built-in',
        'Responsive by default'
      ],
      'icon-library': [
        'Thousands of icons available',
        'Consistent icon style',
        'Tree-shakeable for small bundles',
        'Easy to customize'
      ],
      'styling': [
        'Utility-first CSS approach',
        'Smaller CSS bundles',
        'Rapid prototyping',
        'Design consistency'
      ],
      'framework': [
        'Modern development experience',
        'Large ecosystem',
        'Active community',
        'Regular updates'
      ]
    }

    return benefitsMap[type] || ['Improved developer experience']
  }

  private getInstallCommand(packages: string[]): string {
    const pm = this.analysis.packageManager
    const command = pm === 'npm' ? 'install' : 'add'
    return `${pm} ${command} ${packages.join(' ')}`
  }

  private getAlternatives(type: string, packages: string[]): string[] {
    const alternativesMap: Record<string, string[]> = {
      'ui-library': ['@mui/material', 'antd', '@chakra-ui/react', '@mantine/core'],
      'icon-library': ['lucide-react', 'react-icons', '@heroicons/react', '@tabler/icons-react'],
      'styling': ['tailwindcss', 'styled-components', '@emotion/react', 'stitches']
    }

    const alternatives = alternativesMap[type] || []
    return alternatives.filter(alt => !packages.includes(alt)).slice(0, 3)
  }

  private getSuggestedUILibraries(): string[] {
    if (this.hasReact()) {
      return ['@mui/material', '@chakra-ui/react', 'antd', '@mantine/core']
    }
    
    const vue = this.analysis.frameworks.find(f => f.name === 'Vue' && f.installed)
    if (vue) {
      return ['vuetify', 'element-plus', 'naive-ui', '@headlessui/vue']
    }

    return ['@mui/material', 'antd', 'bootstrap']
  }
}