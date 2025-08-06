import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileExists, readJson } from './fs.js';

export interface WorkspaceInfo {
  type: 'single' | 'npm' | 'yarn' | 'pnpm' | 'lerna' | 'nx' | 'rush';
  root: string;
  packages: string[];
  currentPackage?: {
    name: string;
    path: string;
    type: 'app' | 'lib' | 'ui' | 'unknown';
  };
}

export class WorkspaceDetector {
  private cache: Map<string, WorkspaceInfo> = new Map();

  async detect(startPath: string = process.cwd()): Promise<WorkspaceInfo> {
    const cached = this.cache.get(startPath);
    if (cached) return cached;

    const info = await this.detectWorkspace(startPath);
    this.cache.set(startPath, info);
    return info;
  }

  private async detectWorkspace(startPath: string): Promise<WorkspaceInfo> {
    let currentPath = startPath;
    
    // Walk up directory tree to find workspace root
    while (currentPath !== '/' && currentPath !== dirname(currentPath)) {
      // Check for monorepo indicators
      if (await this.isPnpmWorkspace(currentPath)) {
        return this.analyzePnpmWorkspace(currentPath, startPath);
      }
      
      if (await this.isYarnWorkspace(currentPath)) {
        return this.analyzeYarnWorkspace(currentPath, startPath);
      }
      
      if (await this.isNxWorkspace(currentPath)) {
        return this.analyzeNxWorkspace(currentPath, startPath);
      }
      
      if (await this.isLernaWorkspace(currentPath)) {
        return this.analyzeLernaWorkspace(currentPath, startPath);
      }
      
      if (await this.isRushWorkspace(currentPath)) {
        return this.analyzeRushWorkspace(currentPath, startPath);
      }
      
      // Check if this is a regular npm package
      if (await fileExists(join(currentPath, 'package.json'))) {
        const pkg = await readJson(join(currentPath, 'package.json'));
        if (pkg.workspaces) {
          return this.analyzeNpmWorkspace(currentPath, startPath);
        }
      }
      
      currentPath = dirname(currentPath);
    }
    
    // Default to single package
    return {
      type: 'single',
      root: startPath,
      packages: ['.'],
      currentPackage: {
        name: 'app',
        path: startPath,
        type: 'app',
      },
    };
  }

  private async isPnpmWorkspace(path: string): Promise<boolean> {
    return fileExists(join(path, 'pnpm-workspace.yaml'));
  }

  private async isYarnWorkspace(path: string): Promise<boolean> {
    if (!await fileExists(join(path, 'yarn.lock'))) return false;
    
    const pkgPath = join(path, 'package.json');
    if (!await fileExists(pkgPath)) return false;
    
    const pkg = await readJson(pkgPath);
    return !!pkg.workspaces;
  }

  private async isNxWorkspace(path: string): Promise<boolean> {
    return fileExists(join(path, 'nx.json'));
  }

  private async isLernaWorkspace(path: string): Promise<boolean> {
    return fileExists(join(path, 'lerna.json'));
  }

  private async isRushWorkspace(path: string): Promise<boolean> {
    return fileExists(join(path, 'rush.json'));
  }

  private async analyzePnpmWorkspace(root: string, currentPath: string): Promise<WorkspaceInfo> {
    const workspaceFile = await fs.readFile(join(root, 'pnpm-workspace.yaml'), 'utf-8');
    const packages = this.parseYamlPackages(workspaceFile);
    
    return {
      type: 'pnpm',
      root,
      packages,
      currentPackage: await this.detectCurrentPackage(root, currentPath, packages),
    };
  }

  private async analyzeYarnWorkspace(root: string, currentPath: string): Promise<WorkspaceInfo> {
    const pkg = await readJson(join(root, 'package.json'));
    const packages = Array.isArray(pkg.workspaces) 
      ? pkg.workspaces 
      : pkg.workspaces?.packages || [];
    
    return {
      type: 'yarn',
      root,
      packages,
      currentPackage: await this.detectCurrentPackage(root, currentPath, packages),
    };
  }

  private async analyzeNpmWorkspace(root: string, currentPath: string): Promise<WorkspaceInfo> {
    const pkg = await readJson(join(root, 'package.json'));
    const packages = Array.isArray(pkg.workspaces) 
      ? pkg.workspaces 
      : pkg.workspaces?.packages || [];
    
    return {
      type: 'npm',
      root,
      packages,
      currentPackage: await this.detectCurrentPackage(root, currentPath, packages),
    };
  }

  private async analyzeNxWorkspace(root: string, currentPath: string): Promise<WorkspaceInfo> {
    const workspaceConfig = await this.findNxWorkspaceConfig(root);
    
    const packages = workspaceConfig?.projects 
      ? Object.keys(workspaceConfig.projects)
      : ['apps/*', 'libs/*', 'packages/*'];
    
    return {
      type: 'nx',
      root,
      packages,
      currentPackage: await this.detectCurrentPackage(root, currentPath, packages),
    };
  }

  private async analyzeLernaWorkspace(root: string, currentPath: string): Promise<WorkspaceInfo> {
    const lernaConfig = await readJson(join(root, 'lerna.json'));
    const packages = lernaConfig.packages || ['packages/*'];
    
    return {
      type: 'lerna',
      root,
      packages,
      currentPackage: await this.detectCurrentPackage(root, currentPath, packages),
    };
  }

  private async analyzeRushWorkspace(root: string, currentPath: string): Promise<WorkspaceInfo> {
    const rushConfig = await readJson(join(root, 'rush.json'));
    const packages = rushConfig.projects?.map((p: any) => p.projectFolder) || [];
    
    return {
      type: 'rush',
      root,
      packages,
      currentPackage: await this.detectCurrentPackage(root, currentPath, packages),
    };
  }

  private parseYamlPackages(yaml: string): string[] {
    const packages: string[] = [];
    const lines = yaml.split('\n');
    let inPackages = false;
    
    for (const line of lines) {
      if (line.trim() === 'packages:') {
        inPackages = true;
        continue;
      }
      
      if (inPackages && line.startsWith('  - ')) {
        const pkg = line.trim().replace(/^- /, '').replace(/['"]/g, '');
        packages.push(pkg);
      } else if (inPackages && !line.startsWith(' ')) {
        break;
      }
    }
    
    return packages;
  }

  private async detectCurrentPackage(
    root: string, 
    currentPath: string, 
    packages: string[]
  ): Promise<WorkspaceInfo['currentPackage']> {
    const relativePath = currentPath.replace(root + '/', '');
    
    // Check if we're in a workspace package
    for (const pattern of packages) {
      const regex = this.globToRegex(pattern);
      if (regex.test(relativePath)) {
        const pkgPath = join(currentPath, 'package.json');
        if (await fileExists(pkgPath)) {
          const pkg = await readJson(pkgPath);
          return {
            name: pkg.name || relativePath,
            path: currentPath,
            type: this.detectPackageType(pkg, relativePath),
          };
        }
      }
    }
    
    // Walk up to find nearest package.json
    let checkPath = currentPath;
    while (checkPath !== root && checkPath !== dirname(checkPath)) {
      const pkgPath = join(checkPath, 'package.json');
      if (await fileExists(pkgPath)) {
        const pkg = await readJson(pkgPath);
        return {
          name: pkg.name || 'app',
          path: checkPath,
          type: this.detectPackageType(pkg, checkPath.replace(root + '/', '')),
        };
      }
      checkPath = dirname(checkPath);
    }
    
    return undefined;
  }

  private detectPackageType(pkg: any, path: string): 'app' | 'lib' | 'ui' | 'unknown' {
    // Check by package name patterns
    if (pkg.name?.includes('ui') || pkg.name?.includes('components')) return 'ui';
    if (pkg.name?.includes('lib') || pkg.name?.includes('utils')) return 'lib';
    if (pkg.name?.includes('app') || pkg.name?.includes('web')) return 'app';
    
    // Check by path patterns
    if (path.includes('ui') || path.includes('components')) return 'ui';
    if (path.includes('lib') || path.includes('packages')) return 'lib';
    if (path.includes('app') || path.includes('web')) return 'app';
    
    // Check by dependencies
    if (pkg.dependencies?.['next'] || pkg.dependencies?.['react-dom']) return 'app';
    if (pkg.main || pkg.module || pkg.exports) return 'lib';
    
    return 'unknown';
  }

  private globToRegex(glob: string): RegExp {
    const escaped = glob
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}($|/)`);
  }

  private async findNxWorkspaceConfig(root: string): Promise<any> {
    // Try different locations for Nx workspace config
    const possiblePaths = [
      'workspace.json',
      'angular.json',
      'project.json',
    ];
    
    for (const path of possiblePaths) {
      const fullPath = join(root, path);
      if (await fileExists(fullPath)) {
        return readJson(fullPath);
      }
    }
    
    return null;
  }

  async getComponentInstallPath(workspace: WorkspaceInfo, componentName: string): Promise<string> {
    // For UI libraries, install in the UI package
    if (workspace.type !== 'single') {
      // Find UI package
      const uiPackages = await this.findUIPackages(workspace);
      if (uiPackages.length > 0) {
        return join(uiPackages[0], 'src/components', componentName);
      }
      
      // Find current package if in one
      if (workspace.currentPackage) {
        if (workspace.currentPackage.type === 'ui') {
          return join(workspace.currentPackage.path, 'src/components', componentName);
        }
        if (workspace.currentPackage.type === 'app') {
          return join(workspace.currentPackage.path, 'src/components/ui', componentName);
        }
      }
    }
    
    // Default path
    return join(workspace.root, 'src/components/ui', componentName);
  }

  private async findUIPackages(workspace: WorkspaceInfo): Promise<string[]> {
    const uiPackages: string[] = [];
    
    for (const pattern of workspace.packages) {
      const pkgDirs = await this.expandGlob(workspace.root, pattern);
      
      for (const dir of pkgDirs) {
        const pkgPath = join(workspace.root, dir, 'package.json');
        if (await fileExists(pkgPath)) {
          const pkg = await readJson(pkgPath);
          if (this.detectPackageType(pkg, dir) === 'ui') {
            uiPackages.push(join(workspace.root, dir));
          }
        }
      }
    }
    
    return uiPackages;
  }

  private async expandGlob(root: string, pattern: string): Promise<string[]> {
    // Simple glob expansion for common patterns
    if (pattern.includes('*')) {
      const [base] = pattern.split('*');
      const baseDir = join(root, base);
      
      if (await fileExists(baseDir)) {
        const entries = await fs.readdir(baseDir, { withFileTypes: true });
        return entries
          .filter(e => e.isDirectory())
          .map(e => join(base, e.name));
      }
    }
    
    return [pattern];
  }
}

export const workspaceDetector = new WorkspaceDetector();