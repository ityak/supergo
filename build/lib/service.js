const fs = require('fs')
const path = require('path')
const readPkg = require('read-pkg')
const merge = require('webpack-merge')
const Config = require('webpack-chain')
const Api = require('./api')
const { warn, error } = require('./util/logger')

module.exports = class Service {
  constructor (context, { plugins, pkg, projectOptions, useBuiltIn } = {}) {
    process.SUPERGO_SERVICE = this
    this.context = context
    this.webpackChainFns = []
    this.webpackRawConfigFns = []
    this.devServerConfigFns = []
    this.commands = {}
    this.pkg = this.resolvePkg(pkg)
    // load project options
    this.projectOptions = {}

    // load plugins & register commands
    this.plugins = this.resolvePlugins(plugins, useBuiltIn)
    this.plugins.forEach(({id, apply}) => {
      apply(new Api(id, this), this.projectOptions)
    });
    
    // apply webpack configs from project config file
    if (this.projectOptions.chainWebpack) {
      this.webpackChainFns.push(this.projectOptions.chainWebpack)
    }
    if (this.projectOptions.configureWebpack) {
      this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
    }
  }

  run(name, args = {}, rawArgv = []) {
    args._ = args._ || []
    let command = this.commands[name]
    if (!command && name) {
      error(`command "${name}" does not exist.`)
      process.exit(1)
    }
    if (!command || args.help) {
      command = this.commands.help
    } else {
      args._.shift()
      rawArgv.shift()
    }
    const { fn } = command
    return Promise.resolve(fn(args, rawArgv))
  }
  
  resolvePlugins() {
    const idToPlugin = id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    })

    const builtInPlugins = [
      './commands/hubot',
      './commands/help',
      './commands/hubot',
      './commands/serve'
    ].map(idToPlugin)
    
    return builtInPlugins
  }

  resolvePkg(inlinePkg) {
    if (inlinePkg) {
      return inlinePkg
    } else if (fs.existsSync(path.join(this.context, 'package.json'))) {
      return readPkg.sync(this.context)
    } else {
      return {}
    }
  }
  
  resolveWebpackConfig() {

  }
}