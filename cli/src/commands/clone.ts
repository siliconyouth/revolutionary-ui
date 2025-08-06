import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'clone',
  alias: ['c'],
  description: 'Clone an existing catalog resource into your project',
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print } = toolbox
    const id = parameters.first

    if (!id) {
      print.error('Please specify the ID of the resource to clone.')
      return
    }

    print.info(`Cloning resource '${id}' into current project...`)
    const { fetchResourceAsset } = require('../utils/data-access')
    try {
      const asset = await fetchResourceAsset(`components/${id}.zip`)
      // TODO: unpack zip into project
      print.success(`Downloaded asset for '${id}', size ${asset.length} bytes`)
    } catch (err: any) {
      print.error(`Failed to fetch resource asset: ${err.message}`)
    }
  },
}
