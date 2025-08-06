import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'analyze',
  alias: ['a'],
  description: 'Analyze the current project for metrics and AI-driven insights',
  run: async (toolbox: GluegunToolbox) => {
    const { print, parameters } = toolbox
    const target = parameters.first || process.cwd()

    print.info(`Analyzing project at ${target}...`)
    // Record CLI usage
    try {
      await require('../utils/service-clients').prisma.activityLog.create({
        data: {
          action: 'execute',
          entityType: 'cli_command',
          entityId: 'analyze',
          metadata: { target },
        },
      })
    } catch {}
    try {
      // Detect project structure and dependencies
      const { ProjectDetector } = require('../../src/lib/factory/project-detector')
      const detector = new ProjectDetector(target)
      const analysis = await detector.analyze()

      // Generate detailed report
      const { ProjectAnalyzer } = require('../../src/lib/factory/project-analyzer')
      const analyzer = new ProjectAnalyzer(analysis)
      const report = await analyzer.generateReport()

      print.success('Analysis complete')
      print.info(JSON.stringify(report, null, 2))
    } catch (err: any) {
      print.error(`Analysis failed: ${err.message}`)
    }
  },
}
