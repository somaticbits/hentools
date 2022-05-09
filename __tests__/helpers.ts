import { system, filesystem } from 'gluegun'
import { TezosToolkit } from '@taquito/taquito'
import {InMemorySigner} from '@taquito/signer'

const src = filesystem.path(__dirname, '..')

export const generateConfig = (operatorContract, marketplaceContract, minterContract, rpcURL, hicdexURL) => {
    console.log(`Generating config for ${operatorContract} and ${marketplaceContract}`)
    filesystem.write(filesystem.path(src, 'src', 'hentools.config.js'),
        `module.exports = {
                  name: 'hentools',
                  defaults: {
                    rpcURL: '${rpcURL}',
                    hicdexURL: '${hicdexURL}',  
                
                    // IPFS
                    infuraURL: 'https://ipfs.somaticbits.xyz',
                
                    // contracts
                    hicetnuncOperator: '${operatorContract}',
                    teiaMarketplace: '${marketplaceContract}',
                    hicetnuncMinter: '${minterContract}',
                
                    // OBJKTs
                    defaultMetadata: {
                      symbol: 'OBJKT',
                      displayUri: '',
                      thumbnailUri: 'ipfs://QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc',
                      decimals: 0,
                      isBooleanAmount: false,
                      shouldPreferSymbol: false
                    },
                
                    // tezos
                    txConfirmations: 2
                  }
                }
        `)
}

export const runMockServer = () => {
    return system.spawn(`graphql-faker ${filesystem.cwd()}/__tests__/__mocks__/hicdex.schema.graphql`)
        .catch(e => console.error(e))
}

const originateContract = async (signer, contract, storage) => {
    let address = null
    await signer.contract
        .originate({
            code: contract,
            init: storage,
        })
        .then((op) => {
            address = op.contractAddress
            console.log(`Waiting for confirmation of origination for ${op.contractAddress}`)
        })
        .then(() => {
            console.log(`Contract originated`)
        })
        .catch((e) => console.error(`${JSON.stringify(e)}`))
    return address
}

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const originateContracts = async () => {
    const Tezos = new TezosToolkit('http://localhost:20000')
    const key = await filesystem.readAsync(`${filesystem.cwd()}/.config/tezos.config.js`).then(res => JSON.parse(res).key)
    Tezos.setProvider({ signer: new InMemorySigner(key) })

    const operatorContract = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/objkts.tz`)
    const operatorStorage = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/objkts.storage.tz`)

    const objktSwapContract = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/objkt_swap.v1.tz`)
    const objktSwapStorage = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/objkt_swap.v1.storage.tz`)

    const marketplaceContract = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/teia_marketplace.tz`)
    const marketplaceStorage = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/teia_marketplace.storage.tz`)

    let operatorAddress = null, marketplaceAddress = null, objktSwapAddress = null

    operatorAddress = await originateContract(Tezos, operatorContract, operatorStorage)
    filesystem.write(filesystem.path(src, '__tests__', '__mocks__', 'contracts', 'objkt_swap.v1.storage.tz'), `(Pair (Pair (Pair "KT1Tezooo2zzSmartPyzzSTATiCzzzwqqQ4H" "1970-01-01T00:00:00Z") (Pair "KT1Tezooo1zzSmartPyzzSTATiCzzzyfC8eF" (Pair False "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"))) (Pair (Pair {Elt "" 0x697066733a2f2f516d645458507a4831657a714d4b59596e554c6e437a3550543741585347615a4867523952426a46734467454354} (Pair "${operatorAddress}" 152)) (Pair {} (Pair 0 {}))))`)
    await delay(5000)

    objktSwapAddress = await originateContract(Tezos, objktSwapContract, objktSwapStorage)
    filesystem.write(filesystem.path(src, '__tests__', '__mocks__', 'contracts', 'teia_marketplace.storage.tz'), `(Pair (Pair 500000 (Pair 25 "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb")) (Pair {Elt "" 0x697066733a2f2f516d57514e41314138634b5a506f61615a4d757153754c75643747515453786262774358685a373644674571484d} (Pair "${operatorAddress}" {})))`)
    await delay(5000)

    marketplaceAddress = await originateContract(Tezos, marketplaceContract, marketplaceStorage)
    await delay(5000)

    await Tezos.contract
        .at(operatorAddress)
        .then(contract => {
            contract.methods.set_administrator(objktSwapAddress).send()
        })
        .then(() => {
            console.log(`Waiting for confirmation of set_administrator for ${operatorAddress}`)
        })
        .then(() => {
            console.log(`Operation confirmed`)
        })
        .catch((e) => console.error(`${JSON.stringify(e)}`))

    await delay(5000)

    return { operatorAddress, objktSwapAddress, marketplaceAddress }
}

