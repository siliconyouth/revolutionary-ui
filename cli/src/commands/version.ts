import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'version',
  alias: ['v'],
  description: 'Print CLI version',
  run: async (toolbox: GluegunToolbox) => {
    const { print, meta } = toolbox
    print.info(meta.version())
  },
}
