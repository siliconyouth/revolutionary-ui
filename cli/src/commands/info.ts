import { GluegunToolbox } from 'gluegun'
import * as chalk from 'chalk'

module.exports = {
  name: 'info',
  alias: ['i'],
  description: 'Show detailed metadata for a given component or resource',
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print } = toolbox
    const id = parameters.first
    if (!id) {
      print.error('Please specify the component or resource ID to show info.')
      return
    }
    // Delegate to the CatalogCommand info method
    const { getComponent } = require('../utils/data-access')
    const c = await getComponent(id)
    if (!c) {
      print.error(`Component '${id}' not found.`)
      return
    }
    print.info(chalk.cyan(`\n📦 ${c.name}\n`))
    print.info(c.description || '')
    print.info(`Framework: ${c.componentType}`)
    print.info(`ID: ${c.id}`)
    // Additional metadata
  },
}
