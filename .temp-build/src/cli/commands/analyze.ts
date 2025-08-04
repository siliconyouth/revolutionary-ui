import { Command } from 'commander'
import { SmartProjectAnalyzer } from '../core/smart-project-analyzer'
import chalk from 'chalk'
import ora from 'ora'

export const analyzeCommand = new Command('analyze')
  .description('Analyze your project structure')
  .option('-o, --output <path>', 'Output path for analysis report')
  .action(async (options) => {
    const spinner = ora('Analyzing project...').start()
    
    try {
      const analyzer = new SmartProjectAnalyzer(process.cwd())
      const analysis = await analyzer.analyze()
      
      spinner.succeed('Project analysis complete!')
      
      console.log(chalk.cyan('\n📊 Project Analysis\n'))
      console.log(`Name: ${analysis.name}`)
      console.log(`Framework: ${analysis.framework}`)
      console.log(`Language: ${analysis.language}`)
      console.log(`Package Manager: ${analysis.packageManager}`)
      
      if (options.output) {
        // Save to file
        await analyzer.saveAnalysis(analysis, options.output)
        console.log(chalk.green(`\n✓ Analysis saved to ${options.output}`))
      }
    } catch (error: any) {
      spinner.fail(`Analysis failed: ${error.message}`)
    }
  })

// Export class wrapper for compatibility
export class AnalyzeCommand {
  async execute(options: any): Promise<void> {
    await analyzeCommand.parseAsync(['', '', ...Object.entries(options).flatMap(([k, v]) => [`--${k}`, String(v)])])
  }
}