import { GluegunToolbox } from 'gluegun'
import { TezosToolkit, OpKind, WalletParamsWithKind } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'

module.exports = {
  name: 'buy',
  alias: ['b'],
  description: 'Buy one or multiple OBJKTs by adding OBJKT id',
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, config, tz, hicdex, prompt } = toolbox

    const buyRecords = parameters.array

    if (!buyRecords) {
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

    const nftContract = await Tezos.contract.at(config.hentools.hicetnuncNFTv2)

    spinner.stop()
    spinner.succeed('NFT contract loaded')

    try {
      const buyingBatch = (await Promise.all(
        buyRecords.map(async record => ({
          kind: OpKind.TRANSACTION,
          ...nftContract.methods
            .collect(
              (await hicdex.fetchLatestSwapFromCreator(parseInt(record, 10)))[
                'id'
              ]
            )
            .toTransferParams({
              amount: (
                await hicdex.fetchLatestSwapFromCreator(parseInt(record, 10))
              )['price'],
              mutez: true,
              storageLimit: 350
            })
        }))
      )) as Array<WalletParamsWithKind>

      const objktsPrices = buyRecords.map(async record => ({
        objkt: record,
        price:
          (await hicdex.fetchLatestSwapFromCreator(parseInt(record, 10)))[
            'price'
          ] / 1e6
      }))

      let message = `Are you sure you want to buy:\n`
      for (const record of objktsPrices) {
        message += `#${(await record).objkt} for ${(await record).price}tz\n`
      }

      const result = await prompt.confirm(message)

      if (result === false) return

      print.info('Buying...')
      const buyingOperation = await Tezos.wallet.batch(buyingBatch).send()

      print.info(
        `Waiting for ${config.hentools.txConfirmations} confirmations, see https://tzstats.com/${buyingOperation.opHash}`
      )

      await buyingOperation.confirmation(config.hentools.txConfirmations)
      print.info('Buying transaction confirmed!')
    } catch (e) {
      print.error(e)
    }
  }
}
