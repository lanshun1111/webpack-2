const path = require('path')
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const { resolve } = require('./alias')
const { initConfig } = require('./utils')
const initRules = require('./rules')
const { useDll } = require('../ying.config')

module.exports = function(mode) {
  const devtool =
    mode === 'development' ? 'cheap-module-eval-source-map' : '#source-map'
  const { entry, output, alias, htmlPlugins } = initConfig(mode)

  const loaders = initRules(mode)
  let plugins = [
    new webpack.DefinePlugin({
      'process.env': `${JSON.stringify(mode)}`
    }),
    new VueLoaderPlugin(),
    ...htmlPlugins
  ]

  if (useDll) {
    const DllReferencePlugin = require('webpack/lib/DllReferencePlugin')
    const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
    const CopyWebpackPlugin = require('copy-webpack-plugin')

    plugins = plugins.concat([
      new DllReferencePlugin({
        context: __dirname,
        manifest: require('../temp/vue-manifest.json')
      }),
      new HtmlWebpackIncludeAssetsPlugin({
        assets: ['js/dll.vue_2e3438.js'],
        append: false
      }),
      new CopyWebpackPlugin([
        {
          from: resolve('temp/'),
          to: resolve('dist/js/'),
          toType: 'dir',
          ignore: ['*.json']
        }
      ])
    ])
  }

  return {
    mode,
    devtool,
    entry,
    output,
    resolve: {
      extensions: ['*', '.js', 'jsx', '.json', '.vue', '.styl'],
      modules: [resolve('node_modules')],
      alias
    },
    module: {
      rules: [...loaders]
    },
    plugins
  }
}
