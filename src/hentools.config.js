module.exports = {
  name: 'hentools',
  defaults: {
    rpcURL: 'https://rpc.tzbeta.net/',

    // IPFS
    infuraURL: 'https://ipfs.infura.io:5001',

    // contracts
    hicetnuncOperator: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
    hicetnuncNFTv2: 'KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn',
    hicetnuncMinter: 'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9',

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
    txConfirmations: 2,

    dataFolder: 'data',

    mintCsvHeaders: ['name','description','tags','mint_qty','royalties','file','swap_qty','xtz'],
    swapCsvHeaders: ['amount','objkt','xtz']
  }
}
