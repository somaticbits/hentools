import { GluegunToolbox } from 'gluegun'
import { TezosToolkit, OpKind, WalletParamsWithKind } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'

module.exports = {
    name: 'buy',
    alias: ['b'],
    description: 'Buy one or multiple OBJKTs',
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
                signer: new InMemorySigner((await tz.getSecretKey())['key']),
            })
        }

        const spinner = print.spin('NFT contract loading...')

        const nftContract = await Tezos.contract.at(config.hentools.hicetnuncNFTv2)

        spinner.stop()
        spinner.succeed('NFT contract loaded')

        try {
            const buyingBatch = await Promise.all(buyRecords.map(async (record) => ({
                kind: OpKind.TRANSACTION,
                    // tslint:disable-next-line:radix
                    ...nftContract.methods.collect((await hicdex.fetchLatestSwapFromCreator(parseInt(record)))['id'])
                        // tslint:disable-next-line:radix
                        .toTransferParams({ amount: (await hicdex.fetchLatestSwapFromCreator(parseInt(record)))['price'], mutez: true, storageLimit: 350 })
            }))) as WalletParamsWithKind[]

            const objktsPrices = await buyRecords.map(async (record) => ({
                // tslint:disable-next-line:radix
                objkt: record, price: (await hicdex.fetchLatestSwapFromCreator(parseInt(record)))['price'] / 1e6
            }))

            let message =  `Are you sure you want to buy:\n`
            for (const record of objktsPrices) {
                message += `#${(await record).objkt} for ${(await record).price}tz\n`
            }

            const result = await prompt.confirm(message)

            if (result === false) return

            print.info('Buying...')
            const buyingOperation = await Tezos.wallet.batch(buyingBatch).send()

            print.info(`Waiting for ${config.hentools.txConfirmations} confirmations, see https://tzstats.com/${buyingOperation.opHash}`)

            await buyingOperation.confirmation(config.hentools.txConfirmations)
            print.info('Buying transaction confirmed!')
        } catch(e) {
            print.error(e)
        }
    }
}