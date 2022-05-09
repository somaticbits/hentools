// const { system, filesystem } = require('gluegun')
// const src = filesystem.path(__dirname, '..')
// const stdin = require('mock-stdin')
import { generateConfig, runMockServer, originateContracts } from './helpers'

jest.setTimeout(20000)

// const cli = async cmd =>
    // system.run('node ' + filesystem.path(src, 'bin', 'hentools') + ` ${cmd}`,)

// const TEZOS_CONFIG = `${filesystem.cwd()}/.config/tezos.config.js`
// const wallet = {
//   key: 'edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq',
//   tzAddress: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
// }

const testContracts = {
  operatorContract: 'KT1KUxy7FidR6AUnchVZe48Cb3z47L3VXFXw',
  marketplaceContract: 'KT1PTSajWWQ5tWyY45GnrPoFQBrD7VsdwU24',
  minterContract: 'KT1Sa1R67Heci6kBgqUZCXrC1CgpFQEFH9BQ'
}
const contracts = {
  operatorContract: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
  marketplaceContract: 'KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w',
  minterContract: 'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9'
}

beforeAll(async () => {
  runMockServer().then()
  generateConfig(testContracts.operatorContract,
                 testContracts.marketplaceContract,
                 testContracts.minterContract,
          'http://localhost:20000',
        'http://localhost:9002',)
  await originateContracts()
})

afterAll(() => {
  generateConfig(contracts.operatorContract,
                 contracts.marketplaceContract,
                 contracts.minterContract,
         'https://node.somaticbits.xyz',
       'https://api.teia.rocks/v1')
})

describe('cli', () => {
  test('should run', async () => {
    console.log('running')
  })
})
//
// describe('setup module', () => {
//   let io = null
//   beforeAll(() => (io = stdin.stdin()))
//   afterAll(() => {
//     io.restore()
//     filesystem.remove(TEZOS_CONFIG)
//   })
//
//   const key = {
//     enter: '\x0D',
//   }
//
//   test('it should ask for a key', async done => {
//     const sendInput = async () => {
//       io.send(wallet.key)
//       io.send(key.enter)
//     }
//     setTimeout(() => sendInput().then(), 1000)
//     filesystem.remove(TEZOS_CONFIG)
//     const output = await cli('setup')
//     expect(output).toContain('Secret key set.')
//   })
//
//   test('we already have set a key', async () => {
//     await filesystem.writeAsync(TEZOS_CONFIG, wallet)
//     const output = await cli('setup')
//     expect(output).toContain('Secret key already set.')
//   })
//
//   test('it should reset the key', async () => {
//     await filesystem.writeAsync(TEZOS_CONFIG, wallet)
//     const output = await cli('setup -r')
//     expect(output).toContain('Secret key has been reset.')
//   })
// })
//
// describe('mint module', () => {
//   test('it should ask about minting folder', async () => {
//     const output = await cli('mint')
//     expect(output).toContain('Which folder?')
//   })
//
//   test('it should warn about missing key', async () => {
//     filesystem.remove(TEZOS_CONFIG)
//     const output = await cli('mint ./data')
//     expect(output).toContain('Please set the secret key!')
//   })
//
//   test('it should mint a token', async () => {
//     await filesystem.write(TEZOS_CONFIG, wallet)
//     const output = await cli('mint ./__tests__/__mocks__/')
//     expect(output).toContain('Reading input...')
//     expect(output).toContain('Parsing input...')
//     expect(output).toContain('Minting...')
//     expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
//     expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
//     expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
//     expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
//     expect(output).toContain('Minting transaction confirmed!')
//   })
//
//   test('it should warn about missing entries', async () => {
//     const output = await cli('mint ./data')
//     expect(output).toContain('Reading input...')
//     expect(output).toContain('Parsing input...')
//     expect(output).toContain('No entries in CSV!')
//   })
// })

//
// describe('hicdex module', () => {
//   beforeAll(() => {
//     generateConfig(contracts.operatorContract,
//                    contracts.marketplaceContract,
//                    contracts.minterContract,
//                    'https://node.somaticbits.xyz',
//                    'https://api.teia.rocks/v1')
//   })
//
//   test('gets creator for token 667691', async () => {
//     const output = await cli('hicdex -c 667691')
//     // expect(output).toContain('tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb - Alice')
//     expect(output).toContain('Creator of OBJKT #667691: tz1gi68wGST7UtzkNpnnc354mpqCcVNQVcSw - SOMATIC_BITS')
//   })
//
//   test('gets creator for non-existing token 66769134', async () => {
//     const output = await cli('hicdex -c 66769134')
//     expect(output).toContain('Creator undefined')
//   })
//
//   test('gets royalties for token 667691', async () => {
//     const output = await cli('hicdex -r 667691')
//     expect(output).toContain('Royalties for OBJKT #667691: 20%')
//   })
//
//   test('gets royalties for non-existing token 66769134', async () => {
//     const output = await cli('hicdex -r 66769134')
//     expect(output).toContain('OBJKT undefined')
//   })
//
//   test('gets latest swap ID for token 667691', async () => {
//     const output = await cli('hicdex -s 667691')
//     expect(output).toContain('Latest swap ID of OBJKT #667691: 1952336')
//   })
//
//   test('gets latest swap ID for non-existing token 66769134', async () => {
//     const output = await cli('hicdex -s 66769134')
//     expect(output).toContain('Latest swap ID of OBJKT #66769134 undefined')
//   })
//
//   test('gets latest price for token 667691', async () => {
//     const output = await cli('hicdex -p 667691')
//     expect(output).toContain('Latest price of OBJKT #667691: 4tz')
//   })
//
//   test('gets latest price for non-existing token 66769134', async () => {
//     const output = await cli('hicdex -p 66769134')
//     expect(output).toContain('Latest price of OBJKT #66769134 undefined')
//   })
// })
