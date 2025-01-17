const { system, filesystem } = require('gluegun')
const src = filesystem.path(__dirname, '..')
const stdin = require('mock-stdin')
import { generateConfig, runMockServer, originateContracts } from './helpers'

jest.setTimeout(50000)

const cli = async cmd =>
    system.run('node ' + filesystem.path(src, 'bin', 'hentools') + ` ${cmd}`,)

const TEZOS_CONFIG = `${filesystem.cwd()}/.config/tezos.config.js`
const wallet = {
  key: 'edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq',
  tzAddress: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
}

let testContracts = {
  operatorContract: null,
  marketplaceContract: null,
  minterContract: null
}
const contracts = {
  operatorContract: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
  marketplaceContract: 'KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w',
  minterContract: 'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9'
}

beforeAll(async () => {
  runMockServer().then()
  testContracts = await originateContracts()
  generateConfig(testContracts.operatorContract,
                 testContracts.marketplaceContract,
                 testContracts.minterContract,
          'http://localhost:20000',
        'http://localhost:9002',)
})

afterAll(() => {
  generateConfig(contracts.operatorContract,
                 contracts.marketplaceContract,
                 contracts.minterContract,
         'https://node.somaticbits.xyz',
       'https://api.teia.rocks/v1')
})

describe('setup module', () => {
  let io = null
  beforeAll(() => (io = stdin.stdin()))
  afterAll(() => {
    io.restore()
    filesystem.remove(TEZOS_CONFIG)
  })

  const key = {
    enter: '\x0D',
  }

  test('it should ask for a key', async done => {
    const sendInput = async () => {
      io.send(wallet.key)
      io.send(key.enter)
    }
    setTimeout(() => sendInput().then(), 1000)
    filesystem.remove(TEZOS_CONFIG)
    const output = await cli('setup')
    expect(output).toContain('Secret key set.')
  })

  test('we already have set a key', async () => {
    await filesystem.writeAsync(TEZOS_CONFIG, wallet)
    const output = await cli('setup')
    expect(output).toContain('Secret key already set.')
  })

  test('it should reset the key', async () => {
    await filesystem.writeAsync(TEZOS_CONFIG, wallet)
    const output = await cli('setup -r')
    expect(output).toContain('Secret key has been reset.')
  })
})

describe('mint module', () => {
  test('it should ask about minting folder', async () => {
    const output = await cli('mint')
    expect(output).toContain('Which folder?')
  })

  test('it should warn about missing key', async () => {
    filesystem.remove(TEZOS_CONFIG)
    const output = await cli('mint ./data')
    expect(output).toContain('Please set the secret key!')
  })

  test('it should mint a token', async () => {
    await filesystem.write(TEZOS_CONFIG, wallet)
    const output = await cli('mint ./__tests__/__mocks__/')
    expect(output).toContain('Reading input...')
    expect(output).toContain('Parsing input...')
    expect(output).toContain('Minting...')
    expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
    expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
    expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
    expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
    expect(output).toContain('Minting transaction confirmed!')
  })

  // Test currently not running due to external API call
  // test('it should mint and swap a token', async () => {
  //   await filesystem.write(TEZOS_CONFIG, wallet)
  //   const output = await cli('mint -s ./__tests__/__mocks__/')
  //   expect(output).toContain('Reading input...')
  //   expect(output).toContain('Parsing input...')
  //   expect(output).toContain('Minting...')
  //   expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
  //   expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
  //   expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
  //   expect(output).toContain('Adding testimages_screenshot.jpg to IPFS.')
  //   expect(output).toContain('Minting transaction confirmed!')
  //   expect(output).toContain('Swapping transaction confirmed!')
  // })

  test('it should warn about missing entries', async () => {
    const output = await cli('mint ./')
    expect(output).toContain('Reading input...')
    expect(output).toContain('Parsing input...')
    expect(output).toContain('No entries in CSV!')
  })
})

describe('buy module', () => {
  test('it should buy a token', async () => {
    const output = await cli('buy 1')
    expect(output).toContain('Buying...')
    expect(output).toContain('Buying transaction confirmed!')
  })

  test('it should warn about missing OBJKT IDs', async () => {
    const output = await cli('buy')
    expect(output).toContain('Don\'t forget the OBJKT ids')
  })
})

describe('swap module', () => {
  test('it should swap a token', async () => {
    const output = await cli('swap ./__tests__/__mocks__/')
    expect(output).toContain('Reading input: swaps.csv')
    expect(output).toContain('Parsing input...')
    expect(output).toContain('Swapping...')
    expect(output).toContain('Swapping transaction confirmed!')
  })

  test('it should warn about missing entries', async () => {
    const output = await cli('swap ./')
    expect(output).toContain('Reading input...')
    expect(output).toContain('Parsing input...')
    expect(output).toContain('No entries in CSV!')
  })
})

describe('cancel module', () => {
  test('it should cancel a swap', async () => {
    const output = await cli('cancel 1')
    expect(output).toContain('Cancelling...')
    expect(output).toContain('Cancelling transaction confirmed!')
  })

  test('it should warn about missing OBJKT ids', async () => {
    const output = await cli('cancel')
    expect(output).toContain('Don\'t forget the OBJKT ids')
  })
})

describe('transfer module', () => {
  test('to be done', async () => {
    console.log('to be done')  })
})


describe('hicdex module', () => {
  beforeAll(() => {
    generateConfig(contracts.operatorContract,
                   contracts.marketplaceContract,
                   contracts.minterContract,
                   'https://node.somaticbits.xyz',
                   'https://api.teia.rocks/v1')
  })

  test('gets creator for token 667691', async () => {
    const output = await cli('hicdex -c 667691')
    expect(output).toContain('Creator of OBJKT #667691: tz1gi68wGST7UtzkNpnnc354mpqCcVNQVcSw - SOMATIC_BITS')
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
