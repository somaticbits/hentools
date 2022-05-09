import { system, filesystem } from 'gluegun'
import { TezosToolkit } from '@taquito/taquito'
import {InMemorySigner} from '@taquito/signer'

const src = filesystem.path(__dirname, '..')

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const generateConfig = (operatorContract, marketplaceContract, minterContract, rpcURL, hicdexURL) => {
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

// GraphQL Mock server

export const runMockServer = () => {
    return system.spawn(`graphql-faker ${filesystem.cwd()}/__tests__/__mocks__/hicdex.schema.graphql`)
        .catch(e => console.error(e))
}

// Smart contracts sandbox deployment

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

export const originateContracts = async () => {
    const Tezos = new TezosToolkit('http://localhost:20000')
    const key = await filesystem.readAsync(`${filesystem.cwd()}/.config/tezos.config.js`).then(res => JSON.parse(res).key)
    Tezos.setProvider({ signer: new InMemorySigner(key) })

    let operatorContract = null, marketplaceContract = null, minterContract = null

    const operatorFile = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/objkts.tz`)
    const operatorStorage = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/objkts.storage.tz`)
    operatorContract = await originateContract(Tezos, operatorFile, operatorStorage)
    filesystem.write(filesystem.path(src, '__tests__', '__mocks__', 'contracts', 'objkt_swap.v1.storage.tz'), `(Pair (Pair (Pair "KT1Tezooo2zzSmartPyzzSTATiCzzzwqqQ4H" "1970-01-01T00:00:00Z") (Pair "KT1Tezooo1zzSmartPyzzSTATiCzzzyfC8eF" (Pair False "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"))) (Pair (Pair {Elt "" 0x697066733a2f2f516d645458507a4831657a714d4b59596e554c6e437a3550543741585347615a4867523952426a46734467454354} (Pair "${operatorContract}" 152)) (Pair {} (Pair 0 {}))))`)
    await delay(5000)

    const objktSwapFile = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/objkt_swap.v1.tz`)
    const objktSwapStorage = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/objkt_swap.v1.storage.tz`)
    minterContract = await originateContract(Tezos, objktSwapFile, objktSwapStorage)
    filesystem.write(filesystem.path(src, '__tests__', '__mocks__', 'contracts', 'teia_marketplace.storage.tz'), `(Pair (Pair (Pair {Elt "${operatorContract}" Unit} False) (Pair 0 (Pair 25 "KT1QmSmQ8Mj8JHNKKQmepFqQZy7kDWQ1ek69"))) (Pair (Pair "KT1QmSmQ8Mj8JHNKKQmepFqQZy7kDWQ1ek69" {Elt "" 0x697066733a2f2f516d525a595a484672796263735669717064427331686a636d75737652736d61573152756d6438676376416a6244}) (Pair None (Pair {} False))))`)
    await delay(5000)

    const marketplaceFile = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/teia_marketplace.tz`)
    const marketplaceStorage = filesystem.read(`${filesystem.cwd()}/__tests__/__mocks__/contracts/teia_marketplace.storage.tz`)
    marketplaceContract = await originateContract(Tezos, marketplaceFile, marketplaceStorage)
    await delay(5000)

    await Tezos.contract
        .at(operatorContract)
        .then(contract => {
            contract.methods.set_administrator(minterContract).send()
        })
        .then(() => {
            console.log(`Waiting for confirmation of set_administrator ${minterContract} for ${operatorContract}`)
        })
        .then(() => {
            console.log(`Operation confirmed`)
        })
        .catch((e) => console.error(`${JSON.stringify(e)}`))

    await delay(5000)

    return { operatorContract, marketplaceContract, minterContract }
}

