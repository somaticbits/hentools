import { GluegunToolbox } from 'gluegun'

const SECRET_KEY_MESSAGE = `Before using the hentools CLI, you'll need to add the secret key from your wallet.
Once you have your key, enter it below.
SECRET KEY>`

module.exports = {
    name: 'setup',
    alias: ['s'],
    description: 'Setup your wallet, add your secret key.',
    run: async (toolbox: GluegunToolbox) => {
        const { prompt, tz, print } = toolbox

        if ((await tz.getSecretKey()) === false) {
            const result = await prompt.ask({
                type: 'input',
                name: 'secretkey',
                message: SECRET_KEY_MESSAGE,
            })

            if (result && result.secretkey) {
                await tz.saveSecretKey(result.secretkey)
            } else {
                print.info('Secret key set.')
                return
            }
        }
    }
}