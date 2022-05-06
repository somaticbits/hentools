const { system, filesystem } = require('gluegun')

const src = filesystem.path(__dirname, '..')

const cli = async cmd =>
  system.run('node ' + filesystem.path(src, 'bin', 'hentools') + ` ${cmd}`)

// test('outputs version', async () => {
//   const output = await cli('--version')
//   expect(output).toContain('0.0.1')
// })

describe('hicdex module', () => {
  test('gets creator for token 667691', async () => {
    const output = await cli('hicdex -c 667691')
    expect(output).toContain('tz1gi68wGST7UtzkNpnnc354mpqCcVNQVcSw - SOMATIC_BITS')
  })

  test('gets creator for non-existing token 66769134', async () => {
    const output = await cli('hicdex -c 66769134')
    expect(output).toContain('Creator undefined')
  })

  test('gets royalties for token 667691', async () => {
    const output = await cli('hicdex -r 667691')
    expect(output).toContain('Royalties for OBJKT #667691: 20%')
  })

  test('gets royalties for non-existing token 66769134', async () => {
    const output = await cli('hicdex -r 66769134')
    expect(output).toContain('OBJKT undefined')
  })

  test('gets latest swap ID for token 667691', async () => {
    const output = await cli('hicdex -s 667691')
    expect(output).toContain('Latest swap ID of OBJKT #667691: 1952336')
  })

  test('gets latest swap ID for non-existing token 66769134', async () => {
    const output = await cli('hicdex -s 66769134')
    expect(output).toContain('Latest swap ID of OBJKT #66769134 undefined')
  })

  test('gets latest price for token 667691', async () => {
    const output = await cli('hicdex -p 667691')
    expect(output).toContain('Latest price of OBJKT #667691: 4tz')
  })

  test('gets latest price for non-existing token 66769134', async () => {
    const output = await cli('hicdex -p 66769134')
    expect(output).toContain('Latest price of OBJKT #66769134 undefined')
  })
})

describe('setup module', () => {
  test('setup secret key', async () => {
    const output = await cli('setup')
  })
})



//
// test('outputs help', async () => {
//   const output = await cli('--help')
//   expect(output).toContain('0.0.1')
// })
//
// test('generates file', async () => {
//   const output = await cli('generate foo')
//
//   expect(output).toContain('Generated file at models/foo-model.ts')
//   const foomodel = filesystem.read('models/foo-model.ts')
//
//   expect(foomodel).toContain(`module.exports = {`)
//   expect(foomodel).toContain(`name: 'foo'`)
//
//   // cleanup artifact
//   filesystem.remove('models')
// })
