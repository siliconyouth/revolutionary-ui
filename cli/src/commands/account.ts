import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'account',
  description: 'Display or manage current account info',
  run: async (toolbox: GluegunToolbox) => {
    const { print, filesystem } = toolbox
    // Load auth token from local project config (revui.config.json)
    const configPath = filesystem.path(filesystem.cwd(), 'revui.config.json')
    if (!filesystem.exists(configPath)) {
      print.error('Not logged in.')
      return
    }
    let config: any = {}
    try {
      config = JSON.parse(filesystem.read(configPath) || '{}')
    } catch {}
    if (config.authToken) {
      print.info(`Auth Token: ${config.authToken}`)
    } else {
      print.error('Not logged in.')
    }
  },
}
