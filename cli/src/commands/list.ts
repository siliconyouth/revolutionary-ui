import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'list',
  alias: ['ls'],
  description: 'List available components, patterns, hooks, etc.',
  run: async (toolbox: GluegunToolbox) => {
    const { print, parameters } = toolbox
    // Delegate to the CatalogCommand for interactive browsing or filtered list
    const { CatalogCommand } = require('./catalog')
    const catalog = new CatalogCommand()
    const opts = {
      search: parameters.options.search,
      framework: parameters.options.framework,
      category: parameters.options.category,
      stars: parameters.options.stars,
      limit: parameters.options.limit,
    }
    // If user provided a filter flag, run a single browse pass
    // Use unified data-access listing (with caching)
    const { listComponents } = require('../utils/data-access')
    const items = await listComponents(opts)
    if (!items || items.length === 0) {
      print.info('No components found.')
      return
    }
    // Simple table output
    const Table = require('cli-table3')
    const table = new Table({ head: ['ID', 'Name', 'Framework', 'Category'] })
    items.forEach((c: any) => table.push([c.id, c.name, c.framework, c.componentType]))
    print.info(table.toString())
  },
}
