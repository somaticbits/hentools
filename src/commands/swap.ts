import { GluegunToolbox } from 'gluegun'
import * as path from 'path'

import parse = require('csv-parse/lib/sync')
import { InMemorySigner } from '@taquito/signer'
import { TezosToolkit, OpKind, WalletParamsWithKind } from '@taquito/taquito'

module.exports = {
  name: 'swap',
  alias: ['s'],
  description: 'Swap OBJKT(s)',
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters,
      print,
      prompt,
      filesystem,
      tz,
      config,
      hicdex
    } = toolbox

    let folder = parameters.first

    if (!folder) {
      const result = await prompt.ask({
        type: 'input',
        name: 'folder',
        message: 'In which folder is the swap csv located?'
      })
      if (result && result.name) {
        folder = result.name
      }
    }

    if (!folder) {
      print.error('No folder specified!')
      return
    }

    const Tezos = new TezosToolkit(config.hentools.rpcURL)

    if ((await tz.getSecretKey()) === false) {
      print.error('Please set the secret key!')
      return
    } else {
      Tezos.setProvider({
        signer: new InMemorySigner((await tz.getSecretKey())['key'])
      })
    }

    const spinner = print.spin('Market contract loading...')

    const marketContract = await Tezos.contract.at(
      config.hentools.hicetnuncNFTv2
    )

    spinner.stop()
    spinner.succeed('Market contract loaded')

    spinner.start('Operator contract loading...')

    const operatorContract = await Tezos.contract.at(
      config.hentools.hicetnuncOperator
    )

    spinner.stop()
    spinner.succeed('Operator contract loaded')

    const swaps = filesystem.list(folder).filter(x => x.includes('swaps'))

    // TODO: break loop if first swap fails
    for (const swap of swaps) {
      const inputFile = path.join(folder, swap)
      print.info(`Reading input: ${swap}`)
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

      const owner = (await tz.getSecretKey())['tzAddress']

      try {
        const operatorBatch = (await records.map(record => ({
          kind: OpKind.TRANSACTION,
          ...operatorContract.methods
            .update_operators([
              {
                add_operator: {
                  owner: owner,
                  operator: config.hentools.hicetnuncNFTv2,
                  token_id: record.objkt
                }
              }
            ])
            .toTransferParams({ amount: 0, mutez: true, storageLimit: 100 })
        }))) as Array<WalletParamsWithKind>

        const nftBatch = (await Promise.all(
          records.map(async record => ({
            kind: OpKind.TRANSACTION,
            ...marketContract.methods
              .swap(
                (await hicdex.fetchObjktCreator(record.objkt))['address'],
                record.amount,
                record.objkt,
                await hicdex.fetchObjktRoyalties(record.objkt),
                record.xtz * 1e6
              )
              .toTransferParams({ amount: 0, mutez: true, storageLimit: 250 })
          }))
        )) as Array<WalletParamsWithKind>

        const swapBatch = operatorBatch.flatMap((a, i) => [a, nftBatch[i]])

        print.info('Swapping...')
        const swapOperation = await Tezos.wallet.batch(swapBatch).send()

        print.info(
          `Waiting for ${config.hentools.txConfirmations} confirmations, see https://tzstats.com/${swapOperation.opHash}`
        )

        await swapOperation.confirmation(config.hentools.txConfirmations)
        print.info('Swapping transaction confirmed!')
      } catch (e) {
        print.error(e)
        return null
      }
    }
  }
}
