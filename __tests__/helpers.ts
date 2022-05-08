import { filesystem } from 'gluegun'
const src = filesystem.path(__dirname, '..')

export const generateConfig = (operatorContract, marketplaceContract, minterContract, rpcURL) => {
    console.log(`Generating config for ${operatorContract} and ${marketplaceContract}`)
    filesystem.write(filesystem.path(src, 'src', 'hentools.config.js'),
        `module.exports = {
                  name: 'hentools',
                  defaults: {
                    rpcURL: '${rpcURL}',
                
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
