
const shelljs = require('shelljs')

module.exports = (api, options) => {
  api.registerCommand('hubot', args => {
    const command = args._[0]
    console.log('hello hubot')
  })
}