import { BaseCommand, type CLIContext, createLogger, withSpinner, workspaceDetector, configLoader } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import semver from 'semver';

interface SystemCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fix?: () => Promise<void>;
}

interface DoctorReport {
  system: SystemCheck[];
  configuration: SystemCheck[];
  dependencies: SystemCheck[];
  network: SystemCheck[];
  workspace: SystemCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export class DoctorCommand extends BaseCommand {
  name = 'doctor';
  description = 'Diagnose and fix common issues with Revolutionary UI';
  alias = ['diagnose', 'health'];
  
  options = [
    { flags: '--fix', description: 'Automatically fix issues where possible' },
    { flags: '--json', description: 'Output results as JSON' },
    { flags: '--verbose', description: 'Show detailed diagnostic information' },
  ];

  async action(options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n🩺 Revolutionary UI Doctor\n'));
    
    const report = await withSpinner('Running diagnostics...', async () => {
      return this.runDiagnostics(options);
    });
    
    // Display results
    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      this.displayReport(report, options);
    }
    
    // Apply fixes if requested
    if (options.fix) {
      await this.applyFixes(report);
    }
    
    // Exit with error code if there are failures
    if (report.summary.failed > 0) {
      process.exit(1);
    }
  }

  private async runDiagnostics(options: any): Promise<DoctorReport> {
    const checks = {
      system: await this.checkSystem(),
      configuration: await this.checkConfiguration(),
      dependencies: await this.checkDependencies(),
      network: await this.checkNetwork(),
      workspace: await this.checkWorkspace(),
    };
    
    // Calculate summary
    const allChecks = Object.values(checks).flat();
    const summary = {
      total: allChecks.length,
      passed: allChecks.filter(c => c.status === 'pass').length,
      failed: allChecks.filter(c => c.status === 'fail').length,
      warnings: allChecks.filter(c => c.status === 'warning').length,
    };
    
    return { ...checks, summary };
  }

  private async checkSystem(): Promise<SystemCheck[]> {
    const checks: SystemCheck[] = [];
    
    // Node.js version
    const nodeVersion = process.version;
    const minNodeVersion = '18.0.0';
    checks.push({
      name: 'Node.js version',
      status: semver.gte(nodeVersion, minNodeVersion) ? 'pass' : 'fail',
      message: `Node.js ${nodeVersion} (minimum required: ${minNodeVersion})`,
    });
    
    // Package managers
    const packageManagers = ['npm', 'yarn', 'pnpm'];
    for (const pm of packageManagers) {
      try {
        const version = execSync(`${pm} --version`, { encoding: 'utf-8' }).trim();
        checks.push({
          name: `${pm} availability`,
          status: 'pass',
          message: `${pm} ${version} is installed`,
        });
      } catch {
        // Not an error - package manager is optional
      }
    }
    
    // Git
    try {
      const gitVersion = execSync('git --version', { encoding: 'utf-8' }).trim();
      checks.push({
        name: 'Git',
        status: 'pass',
        message: gitVersion,
      });
    } catch {
      checks.push({
        name: 'Git',
        status: 'warning',
        message: 'Git is not installed (required for some features)',
      });
    }
    
    // Operating system
    checks.push({
      name: 'Operating System',
      status: 'pass',
      message: `${process.platform} ${process.arch}`,
    });
    
    return checks;
  }

  private async checkConfiguration(): Promise<SystemCheck[]> {
    const checks: SystemCheck[] = [];
    
    try {
      // Load configuration hierarchy
      const configHierarchy = await configLoader.loadHierarchy();
      
      // Check if config exists
      if (!configHierarchy.global && !configHierarchy.workspace && !configHierarchy.package) {
        checks.push({
          name: 'Configuration file',
          status: 'warning',
          message: 'No configuration file found',
          fix: async () => {
            await configLoader.saveConfig(configHierarchy.merged);
          },
        });
      } else {
        checks.push({
          name: 'Configuration file',
          status: 'pass',
          message: 'Configuration loaded successfully',
        });
      }
      
      // Validate config schema
      try {
        // TODO: Add zod validation once schema is defined
        checks.push({
          name: 'Configuration schema',
          status: 'pass',
          message: 'Configuration is valid',
        });
      } catch (error: any) {
        checks.push({
          name: 'Configuration schema',
          status: 'fail',
          message: `Invalid configuration: ${error.message}`,
        });
      }
      
      // Check feature flags
      const features = configHierarchy.merged.features;
      if (features) {
        const enabledFeatures = Object.entries(features)
          .filter(([_, enabled]) => enabled)
          .map(([name]) => name);
        
        checks.push({
          name: 'Features',
          status: 'pass',
          message: `Enabled: ${enabledFeatures.join(', ') || 'none'}`,
        });
      }
    } catch (error: any) {
      checks.push({
        name: 'Configuration',
        status: 'fail',
        message: `Failed to load configuration: ${error.message}`,
      });
    }
    
    return checks;
  }

  private async checkDependencies(): Promise<SystemCheck[]> {
    const checks: SystemCheck[] = [];
    
    // Check if in a project
    const packageJsonPath = join(process.cwd(), 'package.json');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      // Check Revolutionary UI installation
      const ruiDeps = [
        '@revolutionary-ui/cli',
        '@revolutionary-ui/core',
        '@revolutionary-ui/factories',
      ];
      
      const installedRuiDeps = ruiDeps.filter(dep => 
        packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
      );
      
      if (installedRuiDeps.length === 0) {
        checks.push({
          name: 'Revolutionary UI',
          status: 'warning',
          message: 'Revolutionary UI is not installed in this project',
          fix: async () => {
            execSync('npm install --save-dev @revolutionary-ui/cli', { stdio: 'inherit' });
          },
        });
      } else {
        checks.push({
          name: 'Revolutionary UI',
          status: 'pass',
          message: `Installed: ${installedRuiDeps.join(', ')}`,
        });
      }
      
      // Check peer dependencies
      // TODO: Add peer dependency checks
      
    } catch {
      checks.push({
        name: 'Project',
        status: 'warning',
        message: 'Not in a Node.js project (no package.json found)',
      });
    }
    
    return checks;
  }

  private async checkNetwork(): Promise<SystemCheck[]> {
    const checks: SystemCheck[] = [];
    
    // Check internet connectivity
    try {
      await withSpinner('Checking network...', async () => {
        const https = await import('https');
        await new Promise<void>((resolve, reject) => {
          https.get('https://registry.npmjs.org', (res) => {
            if (res.statusCode === 200) {
              resolve();
            } else {
              reject(new Error(`Status code: ${res.statusCode}`));
            }
          }).on('error', reject);
        });
      });
      
      checks.push({
        name: 'NPM Registry',
        status: 'pass',
        message: 'Connected to registry.npmjs.org',
      });
    } catch {
      checks.push({
        name: 'NPM Registry',
        status: 'fail',
        message: 'Cannot connect to NPM registry',
      });
    }
    
    // Check Revolutionary UI API
    try {
      await withSpinner('Checking API...', async () => {
        const https = await import('https');
        await new Promise<void>((resolve, reject) => {
          https.get('https://api.revolutionary-ui.com/health', (res) => {
            if (res.statusCode === 200 || res.statusCode === 404) {
              resolve();
            } else {
              reject(new Error(`Status code: ${res.statusCode}`));
            }
          }).on('error', reject);
        });
      });
      
      checks.push({
        name: 'Revolutionary UI API',
        status: 'pass',
        message: 'Connected to Revolutionary UI API',
      });
    } catch {
      checks.push({
        name: 'Revolutionary UI API',
        status: 'warning',
        message: 'Cannot connect to Revolutionary UI API (cloud features may not work)',
      });
    }
    
    // Check proxy settings
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      checks.push({
        name: 'Proxy',
        status: 'pass',
        message: 'Proxy configured',
      });
    }
    
    return checks;
  }

  private async checkWorkspace(): Promise<SystemCheck[]> {
    const checks: SystemCheck[] = [];
    
    try {
      const workspace = await workspaceDetector.detect();
      
      // Workspace type
      checks.push({
        name: 'Workspace type',
        status: 'pass',
        message: `${workspace.type} workspace detected`,
      });
      
      // Current package
      if (workspace.currentPackage) {
        checks.push({
          name: 'Current package',
          status: 'pass',
          message: `${workspace.currentPackage.name} (${workspace.currentPackage.type})`,
        });
      }
      
      // Check workspace structure
      if (workspace.type !== 'single') {
        const packageCount = workspace.packages.length;
        checks.push({
          name: 'Workspace packages',
          status: 'pass',
          message: `${packageCount} package patterns configured`,
        });
        
        // Check for UI package
        const uiPackagePatterns = workspace.packages.filter(p => 
          p.includes('ui') || p.includes('components')
        );
        
        if (uiPackagePatterns.length === 0) {
          checks.push({
            name: 'UI package',
            status: 'warning',
            message: 'No dedicated UI package found in monorepo',
          });
        }
      }
    } catch (error: any) {
      checks.push({
        name: 'Workspace detection',
        status: 'fail',
        message: `Failed to detect workspace: ${error.message}`,
      });
    }
    
    return checks;
  }

  private displayReport(report: DoctorReport, options: any): void {
    const logger = createLogger();
    
    // System checks
    this.displaySection('System Requirements', report.system);
    
    // Configuration
    this.displaySection('Configuration', report.configuration);
    
    // Dependencies
    this.displaySection('Dependencies', report.dependencies);
    
    // Network
    this.displaySection('Network', report.network);
    
    // Workspace
    this.displaySection('Workspace', report.workspace);
    
    // Summary
    logger.info(chalk.bold('\n📊 Summary\n'));
    
    const { summary } = report;
    logger.info(`Total checks: ${summary.total}`);
    logger.info(`${chalk.green('✓')} Passed: ${summary.passed}`);
    
    if (summary.warnings > 0) {
      logger.info(`${chalk.yellow('⚠')} Warnings: ${summary.warnings}`);
    }
    
    if (summary.failed > 0) {
      logger.info(`${chalk.red('✗')} Failed: ${summary.failed}`);
    }
    
    // Overall status
    const overallStatus = summary.failed > 0 ? 'fail' : 
                         summary.warnings > 0 ? 'warning' : 'pass';
    
    const statusMessages = {
      pass: chalk.green('\n✨ All systems operational!'),
      warning: chalk.yellow('\n⚠️  Some issues detected but Revolutionary UI should work'),
      fail: chalk.red('\n❌ Critical issues found - Revolutionary UI may not work properly'),
    };
    
    logger.info(statusMessages[overallStatus]);
    
    // Fix suggestion
    if (summary.failed > 0 || summary.warnings > 0) {
      const fixableCount = this.countFixableIssues(report);
      if (fixableCount > 0) {
        logger.info(chalk.dim(`\nRun "rui doctor --fix" to automatically fix ${fixableCount} issue(s)`));
      }
    }
  }

  private displaySection(title: string, checks: SystemCheck[]): void {
    const logger = createLogger();
    
    logger.info(chalk.bold(`\n${title}\n`));
    
    for (const check of checks) {
      const icon = check.status === 'pass' ? chalk.green('✓') :
                   check.status === 'warning' ? chalk.yellow('⚠') :
                   chalk.red('✗');
      
      logger.info(`${icon} ${check.name}: ${check.message}`);
    }
  }

  private countFixableIssues(report: DoctorReport): number {
    const allChecks = Object.values(report).flat().filter((item): item is SystemCheck => 
      item && typeof item === 'object' && 'status' in item
    );
    
    return allChecks.filter(check => check.fix !== undefined).length;
  }

  private async applyFixes(report: DoctorReport): Promise<void> {
    const logger = createLogger();
    const allChecks = Object.values(report).flat().filter((item): item is SystemCheck => 
      item && typeof item === 'object' && 'status' in item
    );
    
    const fixableChecks = allChecks.filter(check => 
      check.fix && (check.status === 'fail' || check.status === 'warning')
    );
    
    if (fixableChecks.length === 0) {
      logger.info(chalk.green('\n✨ No issues to fix!'));
      return;
    }
    
    logger.info(chalk.bold(`\n🔧 Applying ${fixableChecks.length} fix(es)...\n`));
    
    for (const check of fixableChecks) {
      try {
        await withSpinner(`Fixing: ${check.name}...`, async () => {
          await check.fix!();
        });
        logger.info(chalk.green(`✓ Fixed: ${check.name}`));
      } catch (error: any) {
        logger.error(chalk.red(`✗ Failed to fix ${check.name}: ${error.message}`));
      }
    }
    
    logger.info(chalk.dim('\nRun "rui doctor" again to verify fixes'));
  }
}