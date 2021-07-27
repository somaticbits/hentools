import { GluegunToolbox } from 'gluegun'
import * as path from 'path'
import * as mime from 'mime-types'

import parse = require('csv-parse/lib/sync')
import { InMemorySigner } from '@taquito/signer'
import { TezosToolkit, OpKind, WalletParamsWithKind } from '@taquito/taquito'
import { ObjktMetadata } from '../types'

module.exports = {
    name: 'mint',
    alias: ['m'],
    description: 'Mint artwork, either single or in batch',
    run: async (toolbox: GluegunToolbox) => {
        const { parameters,
                print,
                prompt,
                filesystem,
                ipfs,
                tz,
                config } = toolbox

        let folder = parameters.first

        if (!folder) {
            const result = await prompt.ask({
                type: 'input',
                name: 'folder',
                message: 'Which folder?',
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
                signer: new InMemorySigner(await tz.getSecretKey()),
            })
        }

        const spinner = print.spin('Minter contract loading...')

        const minterContract = await Tezos.contract.at(config.hentools.hicetnuncMinter)

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

        const mintRecords: {
            creator: string,
            amount: number,
            metaUri: string,
            royalties: number
        }[] = []

        for (const record of records) {
            const metadata: ObjktMetadata = {
                name: record.title,
                description: record.description,
                tags: record.tags,
                symbol: config.hentools.defaultMetadata.symbol,
                artifactUri: '',
                displayUri: config.hentools.defaultMetadata.displayUri,
                thumbnailUri: config.hentools.defaultMetadata.thumbnailUri,
                creators: [record.creator],
                formats: [
                    {
                        uri: '',
                        mimeType: mime.lookup(record.file)
                    }
                ],
                decimals: config.hentools.defaultMetadata.decimals,
                isBooleanAmount: config.hentools.defaultMetadata.isBooleanAmount,
                shouldPreferSymbol: config.hentools.defaultMetadata.shouldPreferSymbol
            }

            mintRecords.push({
                creator: record.creator,
                amount: record.qty,
                metaUri: await ipfs.addToIpfs(path.join(folder, record.file), metadata),
                royalties: record.royalties
            })
        }

        const mintBatch = mintRecords.map((record) => ({
                    kind: OpKind.TRANSACTION,
                    ...minterContract.methods.mint_OBJKT(
                        record.creator,
                        record.amount,
                        Buffer.from(record.metaUri).toString('hex'),
                        record.royalties * 10
                    ).toTransferParams({ amount: 0, mutez: true, storageLimit: 300 })
                }
            )) as WalletParamsWithKind[]

        print.info(mintBatch)

        try {
            print.info(`Minting...`)
            const mintOperation = await Tezos.wallet.batch(mintBatch).send()

            await mintOperation.confirmation(config.txConfirmations)

            print.info(`Waiting for ${config.txConfirmations} confirmations, see https://tzstats.com/${mintOperation.opHash}`)
            print.info('Minting transaction confirmed!')
            //
            // const confirmations = await http.create({baseURL: 'https://api.better-call.dev'}).get(`/v1/opg/${mintOperation.opHash}`).then(result => {
            //     return result.data
            // })
        } catch(e) {
            print.error(e)
        }
    }
}