const { resolve } = require('./alias')
const DllPlugin = require('webpack/lib/DllPlugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    vue: ['vue']
  },
  output: {
    filename: 'dll.[name]_[hash:6].js',
    path: resolve('temp'),
    library: '[name]_[hash:6]'
  },
  plugins: [
    new DllPlugin({
      name: '[name]_[hash:6]',
      path: resolve('temp/[name]-manifest.json'),
      context: __dirname
    }),
    new CleanWebpackPlugin(['temp'], {
      root: resolve(''),
      verbose: true,
      dry: false
    })
  ]
}
