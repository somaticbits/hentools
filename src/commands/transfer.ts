import { GluegunToolbox } from 'gluegun'

import { InMemorySigner } from '@taquito/signer'
import { TezosToolkit, OpKind, WalletParamsWithKind } from '@taquito/taquito'

module.exports = {
  name: 'transfer',
  alias: ['t'],
  description: 'Transfer tokens from one wallet to another',
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config, tz, hicdex, prompt } = toolbox

    const transferOptions = parameters.options
    const transferRecords = parameters.array

    if (!transferRecords) {
      print.error(`Don't forget the OBJKT ids`)
      return
    } else if (!transferOptions.t) {
      print.error(`Don't forget the target address`)
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

    const operatorContract = await Tezos.contract.at(
      config.hentools.hicetnuncOperator
    )

    spinner.stop()
    spinner.succeed('Operator contract loaded')

    try {
      const operatorBatch = (await Promise.all(
        await transferRecords.map(async record => ({
          kind: OpKind.TRANSACTION,
          ...operatorContract.methods
            .transfer([
              {
                from_: (await tz.getSecretKey())['tzAddress'],
                txs: [
                  {
                    to_: transferOptions.t,
                    token_id: record,
                    amount: await hicdex.fetchObjktAmount(
                      parseInt(record),
                      (await tz.getSecretKey())['tzAddress']
                    )
                  }
                ]
              }
            ])
            .toTransferParams({ amount: 0, mutez: true, storageLimit: 100 })
        }))
      )) as Array<WalletParamsWithKind>

      let message = `Are you sure you want to transfer:\n`
      for (const record of transferRecords) {
        message += `#${await record}\n`
      }

      const result = await prompt.confirm(message)

      if (result === false) return

      print.info('Transferring...')
      const transfertOperation = await Tezos.wallet.batch(operatorBatch).send()

      print.info(
        `Waiting for ${config.hentools.txConfirmations} confirmations, see https://tzstats.com/${transfertOperation.opHash}`
      )

      await transfertOperation.confirmation(config.hentools.txConfirmations)
      print.info('Transfert transaction confirmed!')
    } catch (e) {
      print.error(e)
    }
  }
}