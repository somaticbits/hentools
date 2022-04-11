import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'hicdex',
  alias: ['hd'],
  description:
    'hicdex functions, -r for fetching objkt royalties, -c for fetching objkt creator, -s for fetching latest swap id from creator',
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, hicdex, print, tz } = toolbox

    const options = parameters.options

    if (options.r) {
      const royalties = (await hicdex.fetchObjktRoyalties(options.r)) * 0.1
      print.info(`Royalties for OBJKT #${options.r}: ${royalties}%`)
    }
    if (options.c) {
      const creator = await hicdex.fetchObjktCreator(options.c)
      print.info(
        `Creator of OBJKT #${options.c}: ${creator['address']} - ${creator['name']}`
      )
    }
    if (options.s) {
      const latestSwapId = (await hicdex.fetchLatestSwapFromCreator(options.s))[
        'id'
      ]
      print.info(`Latest swap ID of OBJKT #${options.s}: ${latestSwapId}`)
    }
    if (options.p) {
      const latestPrice =
        (await hicdex.fetchLatestSwapFromCreator(options.p))['price'] / 1e6
      print.info(`Latest price of OBJKT #${options.p}: ${latestPrice}tz`)
    }
    if (options.a) {
      const creator = (await tz.getSecretKey())['tzAddress']
      const objktAmount = await hicdex.fetchObjktAmount(
        options.a,
        creator
      )
      print.info(`You own ${objktAmount} edition(s) of OBJKT #${options.a}`)
    }
  }
}
