module.exports = {
  name: 'hentools',
  defaults: {
    rpcURL: 'https://node.somaticbits.xyz/',

    // IPFS
    infuraURL: 'https://ipfs.somaticbits.xyz',

    // contracts
    hicetnuncOperator: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
    teiaMarketplace: 'KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w',
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
    txConfirmations: 2
  }
}
