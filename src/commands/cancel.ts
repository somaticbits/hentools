import { GluegunToolbox } from 'gluegun'
import { TezosToolkit, OpKind, WalletParamsWithKind } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'

module.exports = {
  name: 'cancel',
  alias: ['c'],
  description: 'Cancel swaps, add OBJKT id',
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config, tz, hicdex } = toolbox

    const cancelRecords = parameters.array

    if (!cancelRecords) {
      print.error(`Don't forget the OBJKT ids`)
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

    const spinner = print.spin('NFT contract loading...')

    const nftContract = await Tezos.contract.at(config.hentools.teiaMarketplace)

    spinner.stop()
    spinner.succeed('NFT contract loaded')

    try {
      const cancelBatch = (await Promise.all(
        cancelRecords.map(async record => ({
          kind: OpKind.TRANSACTION,
          // tslint:disable-next-line:radix
          ...nftContract.methods
            .cancel_swap(await hicdex.fetchLatestSwapId(parseInt(record, 10)))
            .toTransferParams({ amount: 0, mutez: true, storageLimit: 250 })
        }))
      )) as Array<WalletParamsWithKind>

      print.info('Cancelling...')
      const cancelOperation = await Tezos.wallet.batch(cancelBatch).send()

      print.info(
        `Waiting for ${config.hentools.txConfirmations} confirmations, see https://tzstats.com/${cancelOperation.opHash}`
      )

      await cancelOperation.confirmation(config.hentools.txConfirmations)
      print.info('Cancelling transaction confirmed!')
    } catch (e) {
      print.error(e)
    }
  }
}
