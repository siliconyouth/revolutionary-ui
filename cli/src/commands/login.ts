import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'login',
  description: 'Log in to your Revolutionary UI account',
  run: async (toolbox: GluegunToolbox) => {
    const { prompt, print, filesystem } = toolbox

    const response = await prompt.ask({
      type: 'input',
      name: 'token',
      message: 'Enter your authentication token',
    })
    // Persist token in local project config (revui.config.json)
    const configPath = filesystem.path(filesystem.cwd(), 'revui.config.json')
    let config: any = {}
    if (filesystem.exists(configPath)) {
      try {
        config = JSON.parse(filesystem.read(configPath) || '{}')
      } catch {}
    }
    config.authToken = response.token
    filesystem.write(configPath, JSON.stringify(config, null, 2))
    print.success('Logged in successfully.')
  },
}
