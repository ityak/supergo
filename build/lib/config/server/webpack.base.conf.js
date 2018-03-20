var fs = require('fs')
const path = require('path')

function resolve(dir) {
  return path.resolve(__dirname, '../../../..', dir)
}

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  devtool: 'source-map',
  target: 'node',
  entry: [
    resolve('./src/server/index.ts')
  ],
  output: {
    path: resolve('./dist/server'),
    filename: '[name].min.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.json'],
    alias: {
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      { exclude: /node_modules/ },
      { test: /\.ts(x?)$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  externals: nodeModules
}