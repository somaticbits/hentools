import { GluegunToolbox } from 'gluegun'
import * as path from 'path'
import * as mime from 'mime-types'

import parse = require('csv-parse/lib/sync')
import { InMemorySigner } from '@taquito/signer'
import {
  TezosToolkit,
  OpKind,
  WalletParamsWithKind,
  WalletOperation
} from '@taquito/taquito'
import { ObjktMetadata } from '../types'

module.exports = {
  name: 'mint',
  alias: ['m'],
  description: 'Mint artwork(s), -s to follow-up swap.',
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters,
      print,
      prompt,
      filesystem,
      ipfs,
      tz,
      config,
      http
    } = toolbox

    let folder = parameters.first
    const options = parameters.options

    if (!folder) {
      const result = await prompt.ask({
        type: 'input',
        name: 'folder',
        message: 'Which folder?'
      }).catch(() => {
        print.error('No folder specified!')
      })
      if (result && result.name) {
        folder = result.name
      }
    }

    const Tezos = new TezosToolkit(config.hentools.rpcURL)

    if ((await tz.getSecretKey()) === false) {
      print.error('Please set the secret key!')
      return
    } else {
      Tezos.setProvider({
        signer: new InMemorySigner((await tz.getSecretKey())['key']),
        config: {confirmationPollingIntervalSecond: 3}
      })
    }

    const spinner = print.spin('Minter contract loading...')

    const minterContract = await Tezos.contract.at(
      config.hentools.hicetnuncMinter
    )

    spinner.stop()
    spinner.succeed('Minter contract loaded')

    const inputFile = path.join(folder, 'automint.csv')
    print.info('Reading input...')
    const content = filesystem.read(inputFile, 'utf8')
    print.info('Parsing input...')

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    })

    if (records.length === 0) {
      print.error('No entries in CSV!')
      return
    }

    const mintRecords: Array<{
      creator: string
      amount: number
      metaUri: string
      royalties: number
    }> = []

    const creator = (await tz.getSecretKey())['tzAddress']

    for (const record of records) {
      const metadata: ObjktMetadata = {
        name: record.name,
        description: record.description,
        tags: record.tags.split(',').map(s => s.trim()),
        symbol: config.hentools.defaultMetadata.symbol,
        artifactUri: '', // is added by .addToIpfs
        displayUri: config.hentools.defaultMetadata.displayUri,
        thumbnailUri: config.hentools.defaultMetadata.thumbnailUri,
        creators: [creator],
        formats: [
          {
            uri: '', // is added by .addToIpfs
            mimeType: mime.lookup(record.file)
          }
        ],
        decimals: config.hentools.defaultMetadata.decimals,
        isBooleanAmount: config.hentools.defaultMetadata.isBooleanAmount,
        shouldPreferSymbol: config.hentools.defaultMetadata.shouldPreferSymbol
      }

      mintRecords.push({
        creator: creator,
        amount: record.mint_qty,
        metaUri: await ipfs.addToIpfs(path.join(folder, record.file), metadata),
        royalties: record.royalties
      })
    }

    const mintBatch = mintRecords.map(record => ({
      kind: OpKind.TRANSACTION,
      ...minterContract.methods
        .mint_OBJKT(
          creator,
          record.amount,
          Buffer.from(record.metaUri).toString('hex'),
          record.royalties * 10
        )
        .toTransferParams({ amount: 0, mutez: true, storageLimit: 1000 })
    })) as Array<WalletParamsWithKind>

    try {
      let mintOperation: WalletOperation

      if (options.t) {
        let currentObjktId,
          lastGasFee = 0
        const targetId = options.t
        const blockSub = Tezos.stream.subscribeOperation({
          destination: `${config.hentools.hicetnuncMinter}`
        })

        blockSub.on('data', async data => {
          if (data['parameters']['entrypoint'] === 'mint_OBJKT') {
            currentObjktId =
              data['metadata']['operation_result']['big_map_diff'][0]['key'][
                'int'
              ]
            lastGasFee = data['gas_limit']
            console.log(
              `This is the current OBJKT: #${currentObjktId}, targetId: #${targetId}`
            )
            if (currentObjktId == targetId - 1) {
              blockSub.close()
              print.info(`Minting #${targetId}...`)

              const mintBatch = mintRecords.map(record => ({
                kind: OpKind.TRANSACTION,
                ...minterContract.methods
                  .mint_OBJKT(
                    creator,
                    record.amount,
                    Buffer.from(record.metaUri).toString('hex'),
                    record.royalties * 10
                  )
                  .toTransferParams({
                    fee: lastGasFee * 5,
                    amount: 0,
                    mutez: true,
                    storageLimit: 1000
                  })
              })) as Array<WalletParamsWithKind>

              mintOperation = await Tezos.wallet.batch(mintBatch).send()

              print.info(
                `Waiting for ${config.hentools.txConfirmations} confirmations, see https://tzstats.com/${mintOperation.opHash}`
              )

              await mintOperation.confirmation(config.hentools.txConfirmations)
              print.info('Minting transaction confirmed!')
            }
          }
        })
      } else {
        print.info(`Minting...`)
        mintOperation = await Tezos.wallet.batch(mintBatch).send()

        print.info(
          `Waiting for ${config.hentools.txConfirmations} confirmations, see https://tzstats.com/${mintOperation.opHash}`
        )

        await mintOperation.confirmation(config.hentools.txConfirmations)
        print.info('Minting transaction confirmed!')
      }

      if (options.s) {
        print.info('')
        spinner.start('Market contract loading...')

        const marketContract = await Tezos.contract.at(
          config.hentools.teiaMarketplace
        )

        spinner.stop()
        spinner.succeed('Market contract loaded')

        spinner.start('Operator contract loading...')

        const operatorContract = await Tezos.contract.at(
          config.hentools.hicetnuncOperator
        )

        spinner.stop()
        spinner.succeed('Operator contract loaded')

        const confirmations = (await http
          .create({ baseURL: 'https://api.better-call.dev' })
          .get(`/v1/opg/${mintOperation.opHash}`)
          .then(result => {
            return result.data
          })) as []

        const tokenIds: Array<number> = []

        for (let i = 1; i < confirmations.length; i += 2) {
          // tslint:disable-next-line:radix
          tokenIds.push(
            parseInt(
              confirmations[i]['parameters'][0]['children'][2]['value'],
              10
            )
          )
        }

        const swapRecords = await records.map((obj, i) => ({
          ...obj,
          objkt: tokenIds[i]
        }))

        const operatorBatch = (await swapRecords.map(record => ({
          kind: OpKind.TRANSACTION,
          ...operatorContract.methods
            .update_operators([
              {
                add_operator: {
                  owner: creator,
                  operator: config.hentools.teiaMarketplace,
                  token_id: record.objkt
                }
              }
            ])
            .toTransferParams({ amount: 0, mutez: true, storageLimit: 100 })
        }))) as Array<WalletParamsWithKind>

        const nftBatch = (await swapRecords.map(record => ({
          kind: OpKind.TRANSACTION,
          ...marketContract.methods
            .swap(
              config.hentools.hicetnuncOperator,
              record.objkt,
              record.amount,
              record.xtz * 1e6,
              record.royalties * 10,
              creator
            )
            .toTransferParams({ amount: 0, mutez: true, storageLimit: 250 })
        }))) as Array<WalletParamsWithKind>

        const revokeBatch = (await swapRecords.map(record => ({
          kind: OpKind.TRANSACTION,
          ...operatorContract.methods
            .update_operators([
              {
                remove_operator: {
                  owner: creator,
                  operator: config.hentools.teiaMarketplace,
                  token_id: record.objkt
                }
              }
            ])
            .toTransferParams({ amount: 0, mutez: true, storageLimit: 100 })
        }))) as Array<WalletParamsWithKind>

        const swapBatch = operatorBatch.flatMap((a, i) => [
          a,
          nftBatch[i],
          revokeBatch[i]
        ])

        print.info('\nSwapping...')
        const swapOperation = await Tezos.wallet.batch(swapBatch).send()

        print.info(
          `Waiting for ${config.hentools.txConfirmations} confirmations, see https://tzstats.com/${swapOperation.opHash}`
        )

        await swapOperation.confirmation(config.hentools.txConfirmations)
        print.info('Swapping transaction confirmed!')
      }
    } catch (e) {
      print.error(e)
    }
  }
}
