const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const WebpackDeepScopeAnalysisPlugin = require('webpack-deep-scope-plugin')
  .default

const {
  useExternals,
  useDll,
  extractEntries,
  analyze,
  useGzip,
  makeZip,
  assetsToInclude
} = require('../ying.config')
const { resolve } = require('./alias')
const { includeAssets, createNotifierCallback } = require('./utils')
const externals = require('./externals')
const webpackBaseFn = require('./base.config')
const devServer = require('./devser.config')

module.exports = function(mode) {
  const baseConfig = webpackBaseFn(mode)
  let destiny, plugins
  if (mode === 'development') {
    plugins = [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [
            `Your application is running here: http://${devServer.host}:${
              devServer.port
            }`
          ]
        },
        onErrors: createNotifierCallback()
      })
    ]
    destiny = {
      devServer,
      optimization: {
        runtimeChunk: false,
        minimize: false,
        noEmitOnErrors: true,
        splitChunks: false
      },
      plugins
    }
  } else {
    plugins = [
      new CleanWebpackPlugin(['dist'], {
        root: resolve(''),
        verbose: true,
        dry: false
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].[chunkhash:6].css',
        chunkFilename: 'css/[id].[chunkhash:6].css'
      }),
      new WebpackDeepScopeAnalysisPlugin(),
      ...includeAssets(assetsToInclude, {})
    ]

    if (analyze) {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
        .BundleAnalyzerPlugin
      plugins.push(
        new BundleAnalyzerPlugin({
          //  可以是`server`，`static`或`disabled`。
          //  在`server`模式下，分析器将启动HTTP服务器来显示软件包报告。
          //  在“静态”模式下，会生成带有报告的单个HTML文件。
          //  在`disabled`模式下，你可以使用这个插件来将`generateStatsFile`设置为`true`来生成Webpack Stats JSON文件。
          analyzerMode: 'server',
          //  将在“服务器”模式下使用的主机启动HTTP服务器。
          analyzerHost: '127.0.0.1',
          //  将在“服务器”模式下使用的端口启动HTTP服务器。
          analyzerPort: 8888,
          //  路径捆绑，将在`static`模式下生成的报告文件。
          //  相对于捆绑输出目录。
          reportFilename: 'report.html',
          //  模块大小默认显示在报告中。
          //  应该是`stat`，`parsed`或者`gzip`中的一个。
          //  有关更多信息，请参见“定义”一节。
          defaultSizes: 'parsed',
          //  在默认浏览器中自动打开报告
          openAnalyzer: false,
          //  如果为true，则Webpack Stats JSON文件将在bundle输出目录中生成
          generateStatsFile: false,
          //  如果`generateStatsFile`为`true`，将会生成Webpack Stats JSON文件的名字。
          //  相对于捆绑输出目录。
          statsFilename: 'stats.json',
          //  stats.toJson（）方法的选项。
          //  例如，您可以使用`source：false`选项排除统计文件中模块的来源。
          //  在这里查看更多选项：https：  //github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
          statsOptions: null,
          logLevel: 'info' //日志级别。可以是'信息'，'警告'，'错误'或'沉默'。
        })
      )
    }

    if (useGzip) {
      const CompressionWebpackPlugin = require('compression-webpack-plugin')
      const zopfli = require('@gfx/zopfli')
      plugins.push(
        new CompressionWebpackPlugin({
          filename: '[path].gz[query]',
          algorithm(input, compressionOptions, callback) {
            return zopfli.gzip(input, compressionOptions, callback)
          },
          test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
          threshold: 10240,
          minRatio: 0.8
        })
      )
    }

    if (makeZip.on) {
      const ZipPlugin = require('zip-webpack-plugin')
      const option = {
        path: resolve('dist'),
        filename: `${makeZip.name}.zip`
      }
      if (!makeZip.sourceMap) option.exclude = /\.(\w)*\.map$/
      plugins.push(new ZipPlugin(option))
    }

    destiny = {
      optimization: {
        runtimeChunk: {
          name: 'manifest'
        },
        splitChunks: {
          cacheGroups: {
            default: false,
            common: {
              test: /[\\/]src[\\/](common|components)[\\/]/,
              minChunks: 2,
              minSize: 2,
              chunks: 'initial',
              name: 'common',
              priority: 10,
              enforce: true,
              reuseExistingChunk: true
            },
            styles: {
              name: 'styles',
              test: /(reset|common|base)\.(s?css|sass|styl|less)/,
              chunks: 'initial',
              enforce: true
            }
          }
        },
        minimizer: [
          new UglifyJsPlugin({
            sourceMap: true,
            uglifyOptions: {
              compress: {
                warnings: false,
                drop_debugger: false,
                drop_console: false
              }
            }
          }),
          new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              safe: true
            }
          })
        ]
      },
      stats: {
        chunkGroups: false,
        chunkModules: false,
        chunkOrigins: false,
        modules: false,
        moduleTrace: false,
        source: false,
        children: false
      },
      plugins
    }

    if (useExternals) {
      destiny.externals = externals
      destiny.plugins = destiny.plugins.concat(includeAssets([], externals))
    } else if (!useDll) {
      Object.keys(extractEntries).forEach(name => {
        let reg = extractEntries[name].join('|')
        destiny.optimization.splitChunks.cacheGroups[name] = {
          test: new RegExp(`${reg}`),
          name,
          chunks: 'initial'
        }
      })
    }
  }

  return webpackMerge(baseConfig, destiny)
}
