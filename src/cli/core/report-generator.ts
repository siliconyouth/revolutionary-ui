import chalk from 'chalk'
import fs from 'fs/promises'
import path from 'path'
import { ProjectAnalysis } from './project-analyzer'
import { FeatureSetupResult } from './feature-manager'
import { ChangeDetectionResult } from './change-detector'

export interface AnalysisReport {
  projectOverview: {
    name: string
    framework: string
    language: string
    size: string
    complexity: string
    codeReduction: string
  }
  recommendations: string[]
  opportunities: {
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'low' | 'medium' | 'high'
  }[]
  nextSteps: string[]
}

export class ReportGenerator {
  async generateAnalysisReport(analysis: ProjectAnalysis): Promise<AnalysisReport> {
    const report: AnalysisReport = {
      projectOverview: {
        name: analysis.summary.name,
        framework: analysis.summary.framework,
        language: analysis.summary.language,
        size: this.getProjectSize(analysis),
        complexity: this.getProjectComplexity(analysis),
        codeReduction: this.estimateCodeReduction(analysis)
      },
      recommendations: this.generateRecommendations(analysis),
      opportunities: this.identifyOpportunities(analysis),
      nextSteps: this.generateNextSteps(analysis)
    }

    return report
  }

  async displayReport(report: AnalysisReport): Promise<void> {
    console.log(chalk.bold.cyan('\n📊 Project Analysis Report\n'))

    // Project Overview
    console.log(chalk.yellow('📁 Project Overview'))
    console.log(`  Name: ${chalk.white(report.projectOverview.name)}`)
    console.log(`  Framework: ${chalk.white(report.projectOverview.framework)}`)
    console.log(`  Language: ${chalk.white(report.projectOverview.language)}`)
    console.log(`  Size: ${chalk.white(report.projectOverview.size)}`)
    console.log(`  Complexity: ${chalk.white(report.projectOverview.complexity)}`)
    console.log(`  Potential Code Reduction: ${chalk.green(report.projectOverview.codeReduction)}`)

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(chalk.yellow('\n💡 Recommendations'))
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec}`)
      })
    }

    // Opportunities
    if (report.opportunities.length > 0) {
      console.log(chalk.yellow('\n🎯 Improvement Opportunities'))
      report.opportunities.forEach(opp => {
        const impactColor = opp.impact === 'high' ? chalk.red : 
                          opp.impact === 'medium' ? chalk.yellow : chalk.gray
        const effortColor = opp.effort === 'low' ? chalk.green :
                          opp.effort === 'medium' ? chalk.yellow : chalk.red
        
        console.log(`\n  ${chalk.bold(opp.title)}`)
        console.log(`  ${opp.description}`)
        console.log(`  Impact: ${impactColor(opp.impact.toUpperCase())} | Effort: ${effortColor(opp.effort.toUpperCase())}`)
      })
    }

    // Next Steps
    if (report.nextSteps.length > 0) {
      console.log(chalk.yellow('\n🚀 Suggested Next Steps'))
      report.nextSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`)
      })
    }
  }

  async generateSetupSummary(
    features: FeatureSetupResult[],
    config: any,
    sessionId: string
  ): Promise<void> {
    console.log(chalk.bold.cyan('\n✅ Setup Complete!\n'))

    // Session Info
    console.log(chalk.yellow('📋 Session Information'))
    console.log(`  Session ID: ${chalk.gray(sessionId)}`)
    console.log(`  Config File: ${chalk.gray('.revolutionary-ui.config.json')}`)

    // Feature Status
    console.log(chalk.yellow('\n✨ Features Status'))
    features.forEach(result => {
      const statusIcon = result.status === 'success' ? '✓' :
                        result.status === 'skipped' ? '○' : '✗'
      const statusColor = result.status === 'success' ? chalk.green :
                         result.status === 'skipped' ? chalk.gray : chalk.red
      
      console.log(`  ${statusColor(statusIcon)} ${this.getFeatureDisplayName(result.feature)}`)
      if (result.message) {
        console.log(`    ${chalk.gray(result.message)}`)
      }
    })

    // Quick Commands
    console.log(chalk.yellow('\n🎯 Quick Commands'))
    console.log(`  ${chalk.cyan('rui generate')}     - Generate AI-powered components`)
    console.log(`  ${chalk.cyan('rui catalog')}      - Browse component catalog`)
    console.log(`  ${chalk.cyan('rui analyze')}      - Analyze your project`)
    console.log(`  ${chalk.cyan('rui monitor')}      - Manage session monitoring`)
    console.log(`  ${chalk.cyan('rui help')}         - Show all commands`)

    // Tips
    console.log(chalk.yellow('\n💡 Pro Tips'))
    console.log(`  • Use ${chalk.cyan('rui -i')} for interactive mode`)
    console.log(`  • Components are saved to ${chalk.gray(config.project?.outputDir || './components/generated')}`)
    console.log(`  • View your config with ${chalk.cyan('rui config show')}`)
    console.log(`  • Update settings anytime with ${chalk.cyan('rui config')}`)
  }

  async generateChangeReport(changes: ChangeDetectionResult): Promise<void> {
    console.log(chalk.bold.cyan('\n🔍 Changes Detected Since Last Session\n'))

    if (!changes.hasChanges) {
      console.log(chalk.gray('No changes detected since last session.'))
      return
    }

    // Summary
    console.log(chalk.yellow('📊 Change Summary'))
    changes.summary.forEach(item => {
      console.log(`  • ${item}`)
    })

    // File Changes
    if (changes.details.filesAdded.length > 0) {
      console.log(chalk.yellow('\n➕ New Files'))
      changes.details.filesAdded.slice(0, 5).forEach(file => {
        console.log(`  • ${chalk.green(file)}`)
      })
      if (changes.details.filesAdded.length > 5) {
        console.log(`  ${chalk.gray(`... and ${changes.details.filesAdded.length - 5} more`)}`)
      }
    }

    if (changes.details.filesModified.length > 0) {
      console.log(chalk.yellow('\n📝 Modified Files'))
      changes.details.filesModified.slice(0, 5).forEach(file => {
        console.log(`  • ${chalk.yellow(file)}`)
      })
      if (changes.details.filesModified.length > 5) {
        console.log(`  ${chalk.gray(`... and ${changes.details.filesModified.length - 5} more`)}`)
      }
    }

    // Dependency Changes
    if (changes.details.dependenciesAdded.length > 0 ||
        changes.details.dependenciesRemoved.length > 0 ||
        changes.details.dependenciesUpdated.length > 0) {
      console.log(chalk.yellow('\n📦 Dependency Changes'))
      
      changes.details.dependenciesAdded.forEach(dep => {
        console.log(`  ${chalk.green('+')} ${dep}`)
      })
      
      changes.details.dependenciesRemoved.forEach(dep => {
        console.log(`  ${chalk.red('-')} ${dep}`)
      })
      
      changes.details.dependenciesUpdated.forEach(dep => {
        console.log(`  ${chalk.yellow('~')} ${dep}`)
      })
    }

    // Structural Changes
    if (changes.details.structuralChanges.length > 0) {
      console.log(chalk.yellow('\n🏗️  Structural Changes'))
      changes.details.structuralChanges.forEach(change => {
        console.log(`  • ${change}`)
      })
    }

    // Configuration Changes
    if (changes.details.configChanges.length > 0) {
      console.log(chalk.yellow('\n⚙️  Configuration Changes'))
      changes.details.configChanges.forEach(change => {
        console.log(`  • ${change}`)
      })
    }
  }

  async saveReportToFile(report: AnalysisReport, outputPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = outputPath || path.join(process.cwd(), `rui-analysis-${timestamp}.json`)
    
    await fs.writeFile(filename, JSON.stringify(report, null, 2), 'utf-8')
    
    return filename
  }

  private getProjectSize(analysis: ProjectAnalysis): string {
    const totalFiles = analysis.metrics.totalFiles
    
    if (totalFiles < 50) return 'Small'
    if (totalFiles < 200) return 'Medium'
    if (totalFiles < 500) return 'Large'
    return 'Extra Large'
  }

  private getProjectComplexity(analysis: ProjectAnalysis): string {
    const deps = analysis.metrics.dependencies
    const patterns = Object.keys(analysis.patterns).length
    
    const score = deps * 0.3 + patterns * 10
    
    if (score < 20) return 'Low'
    if (score < 50) return 'Medium'
    if (score < 100) return 'High'
    return 'Very High'
  }

  private estimateCodeReduction(analysis: ProjectAnalysis): string {
    // Estimate based on identified patterns and component types
    let reductionPercentage = 30 // Base reduction

    // Add reduction based on patterns
    if (analysis.patterns.componentPattern === 'Repetitive') reductionPercentage += 15
    if (analysis.patterns.statePattern === 'Redux' || analysis.patterns.statePattern === 'Zustand') reductionPercentage += 10
    if (analysis.patterns.stylingPattern === 'Tailwind CSS') reductionPercentage += 10
    if (analysis.patterns.formPattern === 'React Hook Form') reductionPercentage += 15

    // Add reduction for common UI patterns
    if (analysis.structure.directories?.includes('components/forms')) reductionPercentage += 10
    if (analysis.structure.directories?.includes('components/tables')) reductionPercentage += 10
    if (analysis.structure.directories?.includes('components/dashboard')) reductionPercentage += 15

    // Cap at realistic maximum
    reductionPercentage = Math.min(reductionPercentage, 85)

    return `${reductionPercentage}%`
  }

  private generateRecommendations(analysis: ProjectAnalysis): string[] {
    const recommendations: string[] = []

    // Framework-specific recommendations
    if (analysis.summary.framework === 'React' && !analysis.summary.hasTypeScript) {
      recommendations.push('Consider migrating to TypeScript for better type safety and IDE support')
    }

    // Pattern recommendations
    if (!analysis.patterns.formPattern) {
      recommendations.push('Use FormFactory to generate consistent, validated forms with 70% less code')
    }

    if (analysis.structure.directories?.includes('components/tables')) {
      recommendations.push('Replace manual table implementations with TableFactory for automatic sorting, filtering, and pagination')
    }

    // Performance recommendations
    if (analysis.metrics.dependencies > 50) {
      recommendations.push('High dependency count detected. Consider using Revolutionary UI\'s built-in components to reduce bundle size')
    }

    // Testing recommendations
    if (!analysis.patterns.testingFramework) {
      recommendations.push('Add automated testing with Revolutionary UI\'s test generation features')
    }

    return recommendations
  }

  private identifyOpportunities(analysis: ProjectAnalysis): AnalysisReport['opportunities'] {
    const opportunities: AnalysisReport['opportunities'] = []

    // Form optimization
    if (analysis.structure.files?.some(f => f.includes('form') || f.includes('Form'))) {
      opportunities.push({
        title: 'Form Generation Optimization',
        description: 'Replace manual form implementations with AI-powered FormFactory',
        impact: 'high',
        effort: 'low'
      })
    }

    // Dashboard optimization
    if (analysis.structure.directories?.includes('dashboard') || 
        analysis.structure.directories?.includes('admin')) {
      opportunities.push({
        title: 'Dashboard Modernization',
        description: 'Use DashboardFactory to create responsive, data-driven dashboards',
        impact: 'high',
        effort: 'medium'
      })
    }

    // Component library
    if (analysis.metrics.components < 20) {
      opportunities.push({
        title: 'Component Library Expansion',
        description: 'Browse 10,000+ components in the catalog to accelerate development',
        impact: 'medium',
        effort: 'low'
      })
    }

    // AI integration
    if (!analysis.environment.AI_PROVIDER) {
      opportunities.push({
        title: 'AI-Powered Development',
        description: 'Enable AI features to generate components from natural language',
        impact: 'high',
        effort: 'low'
      })
    }

    return opportunities
  }

  private generateNextSteps(analysis: ProjectAnalysis): string[] {
    const steps: string[] = []

    // Priority 1: Quick wins
    if (!analysis.environment.AI_PROVIDER) {
      steps.push('Set up AI provider keys with: rui config ai')
    }

    // Priority 2: High-impact features
    steps.push('Generate your first component: rui generate form')
    steps.push('Explore the component catalog: rui catalog browse')

    // Priority 3: Advanced features
    if (analysis.git?.contributors && analysis.git.contributors > 1) {
      steps.push('Set up team collaboration: rui team create')
    }

    steps.push('Enable session monitoring: rui monitor start')

    return steps.slice(0, 5) // Limit to 5 steps
  }

  private getFeatureDisplayName(feature: string): string {
    const names: Record<string, string> = {
      authentication: 'Authentication',
      ai: 'AI Integration',
      catalog: 'Component Catalog',
      marketplace: 'Marketplace',
      monitoring: 'Session Monitoring',
      team: 'Team Collaboration',
      cloud: 'Cloud Sync',
      analytics: 'Analytics',
      visualBuilder: 'Visual Builder'
    }
    return names[feature] || feature
  }
}