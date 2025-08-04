import { Command } from 'commander'
import { SmartProjectAnalyzer } from '../core/smart-project-analyzer'
import { FeatureManager } from '../core/feature-manager'
import chalk from 'chalk'
import ora from 'ora'

export const setupCommand = new Command('setup')
  .description('Setup Revolutionary UI in your project')
  .action(async () => {
    console.log(chalk.cyan('🚀 Revolutionary UI Setup\n'))
    
    const spinner = ora('Analyzing project...').start()
    
    try {
      const analyzer = new SmartProjectAnalyzer(process.cwd())
      const analysis = await analyzer.analyze()
      
      spinner.succeed('Project analyzed!')
      
      console.log(`\nDetected: ${analysis.summary.framework} project`)
      
      // Initialize features
      const featureManager = new FeatureManager({
        framework: analysis.summary.framework,
        preferences: {
          framework: analysis.summary.framework
        }
      } as any)
      
      await featureManager.initializeFeatures()
      
      console.log(chalk.green('\n✓ Revolutionary UI setup complete!'))
      console.log(chalk.gray('\nRun "revolutionary-ui generate" to create your first component'))
      
    } catch (error: any) {
      spinner.fail(`Setup failed: ${error.message}`)
    }
  })