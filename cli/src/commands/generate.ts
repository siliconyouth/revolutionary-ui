import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'generate',
  alias: ['g'],
  description: 'Generate a new component or scaffold via template/AI',
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print } = toolbox

    const name = parameters.first
    if (!name) {
      print.error('Please specify a name for the generated component.')
      return
    }

    print.info(`Generating component '${name}'...`)
    // Record CLI usage
    try {
      await require('../utils/service-clients').prisma.activityLog.create({
        data: {
          action: 'execute',
          entityType: 'cli_command',
          entityId: 'generate',
          metadata: { name },
        },
      })
    } catch {}
    // TODO: implement generation logic (template or AI-driven)
  },
}
