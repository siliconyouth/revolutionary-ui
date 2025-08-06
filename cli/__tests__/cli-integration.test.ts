import { system, filesystem } from 'gluegun'

const src = filesystem.path(__dirname, '..')

const cli = async (cmd) =>
  system.run('node ' + filesystem.path(src, 'bin', 'cli') + ` ${cmd}`)

test.skip('outputs version', async () => {
  const output = await cli('--version')
  expect(output).toContain('0.0.1')
})

test.skip('outputs help', async () => {
  const output = await cli('--help')
  expect(output).toContain('0.0.1')
})

test.skip('generates file', async () => {
  const output = await cli('generate foo')

  expect(output).toContain('Generated file at models/foo-model.ts')
  const foomodel = filesystem.read('models/foo-model.ts')

  expect(foomodel).toContain(`module.exports = {`)
  expect(foomodel).toContain(`name: 'foo'`)

  // cleanup artifact
  filesystem.remove('models')
})
