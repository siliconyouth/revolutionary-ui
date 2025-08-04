import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { glob } from 'glob'

export interface ChangeDetectionResult {
  hasChanges: boolean
  summary: string[]
  details: {
    filesAdded: string[]
    filesModified: string[]
    filesDeleted: string[]
    dependenciesAdded: string[]
    dependenciesRemoved: string[]
    dependenciesUpdated: string[]
    configChanges: string[]
    structuralChanges: string[]
  }
}

export class ChangeDetector {
  async detectChanges(previousConfig: any): Promise<ChangeDetectionResult> {
    const result: ChangeDetectionResult = {
      hasChanges: false,
      summary: [],
      details: {
        filesAdded: [],
        filesModified: [],
        filesDeleted: [],
        dependenciesAdded: [],
        dependenciesRemoved: [],
        dependenciesUpdated: [],
        configChanges: [],
        structuralChanges: []
      }
    }

    // Compare file structure
    const fileChanges = await this.detectFileChanges(previousConfig)
    result.details.filesAdded = fileChanges.added
    result.details.filesModified = fileChanges.modified
    result.details.filesDeleted = fileChanges.deleted

    // Compare dependencies
    const depChanges = await this.detectDependencyChanges(previousConfig)
    result.details.dependenciesAdded = depChanges.added
    result.details.dependenciesRemoved = depChanges.removed
    result.details.dependenciesUpdated = depChanges.updated

    // Compare configuration
    const configChanges = await this.detectConfigChanges(previousConfig)
    result.details.configChanges = configChanges

    // Detect structural changes
    const structuralChanges = await this.detectStructuralChanges(previousConfig)
    result.details.structuralChanges = structuralChanges

    // Generate summary
    result.hasChanges = this.hasAnyChanges(result.details)
    result.summary = this.generateChangeSummary(result.details)

    return result
  }

  async applyChanges(config: any, changes: ChangeDetectionResult): Promise<any> {
    const updatedConfig = { ...config }

    // Update file tracking
    if (changes.details.filesAdded.length > 0 || 
        changes.details.filesModified.length > 0 ||
        changes.details.filesDeleted.length > 0) {
      updatedConfig.lastFileSnapshot = await this.createFileSnapshot()
    }

    // Update dependency tracking
    if (changes.details.dependenciesAdded.length > 0 ||
        changes.details.dependenciesRemoved.length > 0 ||
        changes.details.dependenciesUpdated.length > 0) {
      updatedConfig.lastDependencySnapshot = await this.createDependencySnapshot()
    }

    // Update timestamp
    updatedConfig.lastChangeDetection = new Date().toISOString()
    updatedConfig.changeHistory = updatedConfig.changeHistory || []
    updatedConfig.changeHistory.push({
      timestamp: new Date().toISOString(),
      changes: changes.summary
    })

    return updatedConfig
  }

  private async detectFileChanges(previousConfig: any): Promise<{
    added: string[]
    modified: string[]
    deleted: string[]
  }> {
    const currentSnapshot = await this.createFileSnapshot()
    const previousSnapshot = previousConfig.lastFileSnapshot || {}

    const added: string[] = []
    const modified: string[] = []
    const deleted: string[] = []

    // Check for added and modified files
    for (const [file, currentHash] of Object.entries(currentSnapshot)) {
      if (!previousSnapshot[file]) {
        added.push(file)
      } else if (previousSnapshot[file] !== currentHash) {
        modified.push(file)
      }
    }

    // Check for deleted files
    for (const file of Object.keys(previousSnapshot)) {
      if (!currentSnapshot[file]) {
        deleted.push(file)
      }
    }

    return { added, modified, deleted }
  }

  private async detectDependencyChanges(previousConfig: any): Promise<{
    added: string[]
    removed: string[]
    updated: string[]
  }> {
    const currentDeps = await this.createDependencySnapshot()
    const previousDeps = previousConfig.lastDependencySnapshot || {}

    const added: string[] = []
    const removed: string[] = []
    const updated: string[] = []

    // Check for added and updated dependencies
    for (const [dep, currentVersion] of Object.entries(currentDeps)) {
      if (!previousDeps[dep]) {
        added.push(`${dep}@${currentVersion}`)
      } else if (previousDeps[dep] !== currentVersion) {
        updated.push(`${dep}: ${previousDeps[dep]} → ${currentVersion}`)
      }
    }

    // Check for removed dependencies
    for (const dep of Object.keys(previousDeps)) {
      if (!currentDeps[dep]) {
        removed.push(dep)
      }
    }

    return { added, removed, updated }
  }

  private async detectConfigChanges(previousConfig: any): Promise<string[]> {
    const changes: string[] = []
    const currentConfig = await this.loadProjectConfig()

    // Compare key configuration fields
    if (currentConfig.framework !== previousConfig.project?.framework) {
      changes.push(`Framework changed: ${previousConfig.project?.framework} → ${currentConfig.framework}`)
    }

    if (currentConfig.typescript !== previousConfig.project?.typescript) {
      changes.push(`TypeScript ${currentConfig.typescript ? 'enabled' : 'disabled'}`)
    }

    // Check for new configuration files
    const configFiles = [
      'tsconfig.json',
      'tailwind.config.js',
      '.eslintrc.js',
      '.prettierrc',
      'vite.config.js',
      'webpack.config.js'
    ]

    for (const file of configFiles) {
      const exists = await this.fileExists(file)
      const previouslyExisted = previousConfig.configFiles?.[file]
      
      if (exists && !previouslyExisted) {
        changes.push(`New configuration file: ${file}`)
      } else if (!exists && previouslyExisted) {
        changes.push(`Configuration file removed: ${file}`)
      }
    }

    return changes
  }

  private async detectStructuralChanges(previousConfig: any): Promise<string[]> {
    const changes: string[] = []

    // Detect new directories
    const importantDirs = [
      'src/components',
      'src/pages',
      'src/app',
      'src/api',
      'src/lib',
      'src/utils',
      'src/hooks',
      'src/store',
      'src/styles',
      'tests',
      '__tests__',
      '.github/workflows'
    ]

    for (const dir of importantDirs) {
      const exists = await this.dirExists(dir)
      const previouslyExisted = previousConfig.directories?.[dir]
      
      if (exists && !previouslyExisted) {
        changes.push(`New directory created: ${dir}`)
      }
    }

    // Detect framework migrations
    if (await this.dirExists('app') && !previousConfig.directories?.['app']) {
      changes.push('Migrated to Next.js App Router')
    }

    return changes
  }

  private async createFileSnapshot(): Promise<Record<string, string>> {
    const snapshot: Record<string, string> = {}
    
    const files = await glob('**/*.{js,jsx,ts,tsx,json,css,scss}', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
      cwd: process.cwd()
    })

    for (const file of files.slice(0, 100)) { // Limit to 100 files for performance
      try {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8')
        snapshot[file] = crypto.createHash('md5').update(content).digest('hex')
      } catch {
        // File might have been deleted during scan
      }
    }

    return snapshot
  }

  private async createDependencySnapshot(): Promise<Record<string, string>> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(content)
      
      return {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }
    } catch {
      return {}
    }
  }

  private async loadProjectConfig(): Promise<any> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(content)
      
      const hasTypeScript = await this.fileExists('tsconfig.json')
      
      return {
        framework: this.detectFramework(packageJson),
        typescript: hasTypeScript,
        ...packageJson
      }
    } catch {
      return {}
    }
  }

  private detectFramework(packageJson: any): string {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    if (deps['next']) return 'Next.js'
    if (deps['nuxt']) return 'Nuxt'
    if (deps['@angular/core']) return 'Angular'
    if (deps['vue']) return 'Vue'
    if (deps['svelte']) return 'Svelte'
    if (deps['react']) return 'React'
    
    return 'Unknown'
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(process.cwd(), filePath))
      return true
    } catch {
      return false
    }
  }

  private async dirExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path.join(process.cwd(), dirPath))
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  private hasAnyChanges(details: ChangeDetectionResult['details']): boolean {
    return details.filesAdded.length > 0 ||
           details.filesModified.length > 0 ||
           details.filesDeleted.length > 0 ||
           details.dependenciesAdded.length > 0 ||
           details.dependenciesRemoved.length > 0 ||
           details.dependenciesUpdated.length > 0 ||
           details.configChanges.length > 0 ||
           details.structuralChanges.length > 0
  }

  private generateChangeSummary(details: ChangeDetectionResult['details']): string[] {
    const summary: string[] = []

    if (details.filesAdded.length > 0) {
      summary.push(`${details.filesAdded.length} new files added`)
    }

    if (details.filesModified.length > 0) {
      summary.push(`${details.filesModified.length} files modified`)
    }

    if (details.filesDeleted.length > 0) {
      summary.push(`${details.filesDeleted.length} files deleted`)
    }

    if (details.dependenciesAdded.length > 0) {
      summary.push(`${details.dependenciesAdded.length} dependencies added`)
    }

    if (details.dependenciesRemoved.length > 0) {
      summary.push(`${details.dependenciesRemoved.length} dependencies removed`)
    }

    if (details.dependenciesUpdated.length > 0) {
      summary.push(`${details.dependenciesUpdated.length} dependencies updated`)
    }

    if (details.configChanges.length > 0) {
      summary.push(`${details.configChanges.length} configuration changes`)
    }

    if (details.structuralChanges.length > 0) {
      summary.push(`${details.structuralChanges.length} structural changes`)
    }

    return summary
  }
}