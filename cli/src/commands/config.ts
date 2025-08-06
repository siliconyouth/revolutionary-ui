import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'config',
  description: 'Inspect or set local CLI configuration',
  run: async (toolbox: GluegunToolbox) => {
    const { print } = toolbox
    // TODO: implement get/set on local config file (e.g. revui.config.json)
    print.info('Current configuration:')
  },
}
