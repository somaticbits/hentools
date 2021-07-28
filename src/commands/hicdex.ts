import { GluegunToolbox } from 'gluegun'

module.exports = {
    name: 'hicdex',
    alias: ['hd'],
    description: 'Various hicdex functions, -r for fetching objkt royalties, -c for fetching objkt creator, -s for fetching latest swap id',
    run: async (toolbox: GluegunToolbox) => {
        const { parameters, hicdex, print } = toolbox

        const options = parameters.options

        if (options.r) {
            const royalties = await hicdex.fetchObjktRoyalties(options.r) * 0.1
            print.info(`Royalties for OBJKT #${options.r}: ${royalties}%`)
        }
        if (options.c) {
            const creator = await hicdex.fetchObjktCreator(options.c)
            print.info(`Creator of OBJKT #${options.c}: ${creator['address']} - ${creator['name']}`)
        }
        if (options.s) {
            const latestSwapId = await hicdex.fetchObjktSwapId(options.s)
            print.info(`Swap ID of OBJKT #${options.s}: ${latestSwapId[latestSwapId.length - 1]['id']}`)
        }
    }
}