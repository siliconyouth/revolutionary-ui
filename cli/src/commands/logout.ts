import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'logout',
  description: 'Log out of your Revolutionary UI account',
  run: async (toolbox: GluegunToolbox) => {
    const { print, filesystem } = toolbox
    // Clear auth token from local project config (revui.config.json)
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
      delete config.authToken
      filesystem.write(configPath, JSON.stringify(config, null, 2))
      print.success('Logged out successfully.')
    } else {
      print.error('No auth token found.')
    }
  },
}
