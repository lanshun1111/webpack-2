const fs = require('fs')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')

const { alias, resolve } = require('./alias')
const library = require('./library')
const { useExternals, useDll, extractEntries } = require('../ying.config')
const packageConfig = require('../package.json')

function getFiles(dir) {
  try {
    return fs.readdirSync(dir)
  } catch (e) {
    return []
  }
}

function getFileName(s) {
  return s.slice(0, s.lastIndexOf('.'))
}

const entryDir = resolve('src/entries')
const outputDir = resolve('dist')
const entryFiles = getFiles(entryDir)
const entryJs = entryFiles.filter(f => /\.js$/.test(f))

const defaultTemplatePath = resolve('public/index.html')

function initEntryAndOutput(mode) {
  const result = entryJs.reduce(
    (res, next) => {
      let e = getFileName(next)
      res.entry[e] = resolve(`${entryDir}/${next}`)
      return res
    },
    { entry: {} }
  )
  if (!useExternals && !useDll && extractEntries) {
    Object.keys(extractEntries).forEach(key => {
      result.entry[key] = extractEntries[key]
    })
  }
  result.output = {
    path: outputDir,
    filename: 'js/[name].js'
  }
  if (mode !== 'development') {
    result.output.filename = 'js/[name].[chunkhash:6].js'
    result.output.chunkFilename = 'js/[id].[chunkhash:6].js'
  }
  return result
}

function initHtmlTemplate(mode) {
  return entryJs.reduce((res, next) => {
    let tpl
    const f = getFileName(next)
    let title = mode === 'development' ? '生平未见陈近南' : `这是${f}页`,
      minify = {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    let chunks = ['manifest', f]
    const str = fs.readFileSync(`${entryDir}/${next}`, 'utf-8')
    ;(str.indexOf('common') > -1 || str.indexOf('components') > -1) &&
      chunks.unshift('common')
    ;/(reset|common|base)\.(s?css|sass|styl|less)/.test(str) &&
      chunks.unshift('styles')

    if (!useExternals && !useDll) {
      Object.keys(extractEntries).forEach(key => {
        if (extractEntries[key].some(k => str.indexOf(k) > -1)) {
          chunks.unshift(key)
        }
      })
    }

    const h = {
      filename: `${f}.html`,
      chunks,
      title,
      favicon: resolve('public/favor.png'),
      minify: false
    }
    const entryTpl = entryFiles.filter(
      n => /\.(pug|html)$/.test(n) && getFileName(n) == f
    )

    tpl = entryTpl.length
      ? { ...h, template: `${entryDir}/${entryTpl[0]}` }
      : { ...h, template: defaultTemplatePath, minify }
    res.push(new HtmlWebpackPlugin(tpl))
    return res
  }, [])
}

function assetsPath(_path) {
  const assetsSubDirectory =
    process.env.NODE_ENV === 'production' ? './' : 'static'
  return path.posix.join(assetsSubDirectory, _path)
}

function includeAssets(extraCdn = [], externals = {}) {
  return entryJs.map(n => {
    let cdnPaths = []
    Object.keys(externals).forEach(lib => {
      const str = fs.readFileSync(`${entryDir}/${n}`, 'utf-8')
      if (library[lib] && str.indexOf(lib) > -1) {
        cdnPaths.push(library[lib])
      }
    })
    return new HtmlWebpackIncludeAssetsPlugin({
      files: `${getFileName(n)}.html`,
      assets: extraCdn.concat(cdnPaths),
      append: false,
      publicPath: ''
    })
  })
}

function initConfig(mode) {
  return {
    alias,
    ...initEntryAndOutput(mode),
    htmlPlugins: initHtmlTemplate(mode)
  }
}

function createNotifierCallback() {
  const notifier = require('node-notifier')
  return (severity, errors) => {
    if (severity !== 'error') return
    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()
    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, '')
    })
  }
}

module.exports = {
  initConfig,
  assetsPath,
  includeAssets,
  createNotifierCallback
}
