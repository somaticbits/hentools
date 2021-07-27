import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
    const { filesystem } = toolbox

    const TEZOS_CONFIG = `${filesystem.cwd()}/.config/tezos.config.js`

    let secretKey: string | false = false

    const getSecretKey = async (): Promise<string | false> => {
        if (secretKey) return secretKey
        secretKey = await readSecretKey()
        return secretKey
    }

    const readSecretKey = async (): Promise<string | false> => {
        return filesystem.exists(TEZOS_CONFIG) && filesystem.readAsync(TEZOS_CONFIG)
    }

    const saveSecretKey = async (key): Promise<void> => {
        return filesystem.writeAsync(TEZOS_CONFIG, key)
    }

    const resetKey = async (): Promise<void> => {
        await filesystem.removeAsync(TEZOS_CONFIG)
    }

    toolbox.tz = { getSecretKey, saveSecretKey, resetKey }
}