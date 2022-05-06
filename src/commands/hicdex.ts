import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'hicdex',
  alias: ['hd'],
  description:
    'hicdex functions, -r for fetching objkt royalties, -c for fetching objkt creator, -s for fetching latest swap id from creator, -p for fetching latest objkt price, -a for fetching amount of objkt owned',
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, hicdex, print, tz } = toolbox

    const options = parameters.options

    if (options.r) {
      try {
        const royalties = (await hicdex.fetchObjktRoyalties(options.r)) * 0.1
        print.info(`Royalties for OBJKT #${options.r}: ${royalties}%`)
      } catch (e) {
        print.error(`OBJKT undefined`)
      }
    }
    if (options.c) {
      try {
        const creator = await hicdex.fetchObjktCreator(options.c)
        print.info(
          `Creator of OBJKT #${options.c}: ${creator['address']} - ${creator['name']}`
        )
      } catch (e) {
        print.error(`Creator undefined`)
      }
    }
    if (options.s) {
      try {
        const latestSwapId = (await hicdex.fetchLatestSwapFromCreator(options.s))['id']
        print.info(`Latest swap ID of OBJKT #${options.s}: ${latestSwapId}`)
      } catch (e) {
        print.error(`Latest swap ID of OBJKT #${options.s} undefined`)
      }
    }
    if (options.p) {
      try {
        const latestPrice = (await hicdex.fetchLatestSwapFromCreator(options.p))['price'] / 1e6
        print.info(`Latest price of OBJKT #${options.p}: ${latestPrice}tz`)
      } catch (e) {
        print.error(`Latest price of OBJKT #${options.p} undefined`)
      }
    }
    if (options.a) {
      try {
        const creator = (await tz.getSecretKey())['tzAddress']
        const objktAmount = await hicdex.fetchObjktAmount(options.a, creator)
        print.info(`You own ${objktAmount} edition(s) of OBJKT #${options.a}`)
      } catch (e) {
        print.error(`You own 0 edition(s) of OBJKT #${options.a}`)
      }

    }
  }
}
