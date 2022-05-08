import { GluegunToolbox } from 'gluegun'
import { InMemorySigner } from '@taquito/signer'
import { TezosToolkit } from '@taquito/taquito'

module.exports = (toolbox: GluegunToolbox) => {
  const { filesystem, config } = toolbox

  const TEZOS_CONFIG = `${filesystem.cwd()}/.config/tezos.config.js`

  let secretKey: { key: string; tzAddress: string } | false = false

  const getSecretKey = async (): Promise<{ key: string; tzAddress: string } | false> => {
    if (secretKey) return secretKey
    secretKey = await readSecretKey()
    return secretKey
  }

  const readSecretKey = async (): Promise<{ key: string; tzAddress: string } | false> => {
    return (
      filesystem.exists(TEZOS_CONFIG) &&
      await filesystem.readAsync(TEZOS_CONFIG).then(res => JSON.parse(res))
    )
  }

  const saveSecretKey = async (key): Promise<void> => {
    try {
      const Tezos = new TezosToolkit(config.hentools.rpcURL)

      Tezos.setProvider({ signer: new InMemorySigner(key) })

      const tzAddress = await Tezos.wallet.pkh()

      const wallet = { key: `${key}`, tzAddress: `${tzAddress}` }
      return filesystem.writeAsync(TEZOS_CONFIG, wallet)
    } catch (e) {
      console.error(e)
    }
  }

  const resetKey = async (): Promise<void> => {
    await filesystem.removeAsync(TEZOS_CONFIG)
  }

  toolbox.tz = { getSecretKey, saveSecretKey, resetKey }
}
