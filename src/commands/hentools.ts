import { GluegunCommand } from 'gluegun'

const SECRET_KEY_MESSAGE = `Before using the hentools CLI, you'll need to add the secret key from your wallet.
Once you have your key, enter it below.
SECRET KEY>`

const command: GluegunCommand = {
  name: 'hentools',
  run: async toolbox => {
    const { print, tz, prompt } = toolbox

    if ((await tz.getSecretKey()) === false) {
      const result = await prompt.ask({
        type: 'input',
        name: 'secretkey',
        message: SECRET_KEY_MESSAGE
      })

      if (result && result.secretkey) {
        await tz.saveSecretKey(result.secretkey)
      } else {
        print.info('Secret key set.')
        return
      }
    }

    print.info('Welcome to hentools!')
  }
}

module.exports = command
