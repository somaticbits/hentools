import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'hentools',
  run: async toolbox => {
    const { print } = toolbox

    print.info('Welcome to hentools!')
  }
}

module.exports = command
