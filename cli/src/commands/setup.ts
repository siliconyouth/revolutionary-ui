import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'setup',
  alias: ['s'],
  description: 'Bootstrap or update project configuration (framework, styling, AI setup)',
  run: async (toolbox: GluegunToolbox) => {
    const { print, prompt, filesystem } = toolbox

    print.info('Running project setup...')
    // Record CLI usage
    try {
      await require('../utils/service-clients').prisma.activityLog.create({
        data: {
          action: 'execute',
          entityType: 'cli_command',
          entityId: 'setup',
          metadata: {},
        },
      })
    } catch {}
    // TODO: implement interactive setup flows (framework choice, AI provider config, etc.)

    // Example placeholder:
    const response = await prompt.ask({
      type: 'select',
      name: 'framework',
      message: 'Select your project framework',
      choices: ['react', 'vue', 'angular', 'svelte'],
    })
    print.success(`Configured project for framework: ${response.framework}`)
  },
}
