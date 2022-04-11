import { GluegunToolbox } from 'gluegun'

import { TezosToolkit } from '@taquito/taquito'

module.exports = {
  name: 'estimate',
  alias: ['estimate'],
  description: 'Estimate when will desired #OBJKT be minted.',
  run: async (toolbox: GluegunToolbox) => {
    const { print, config } = toolbox

    const Tezos = new TezosToolkit(config.hentools.rpcURL)

    try {
      let currentObjktId,
        lastGasFee = 0
      const blockSub = Tezos.stream.subscribeOperation({
        destination: `${config.hentools.hicetnuncMinter}`
      })

      blockSub.on('data', data => {
        if (data['parameters']['entrypoint'] === 'mint_OBJKT') {
          currentObjktId =
            data['metadata']['operation_result']['big_map_diff'][0]['key'][
              'int'
            ]
          lastGasFee = data['gas_limit']
          console.log(
            `This is the current OBJKT #:${currentObjktId}, gas fee: ${lastGasFee}`
          )
        }
      })
    } catch (e) {
      print.error(e)
    }
  }
}
