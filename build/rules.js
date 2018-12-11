const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const { resolve } = require('./alias')
const { assetsPath } = require('./utils')
const vueLoader = {
  test: /\.vue$/,
  use: 'vue-loader'
}

const cssLoader = {
  test: /\.css$/,
  use: ['vue-style-loader', 'css-loader', 'postcss-loader']
}

const sassLoader = {
  test: /\.scss$/,
  exclude: /node_modules/,
  use: [
    'vue-style-loader',
    'css-loader',
    'postcss-loader',
    'sass-loader',
    {
      loader: 'sass-resources-loader',
      options: {
        resources: resolve('src/assets/style/main.scss')
      }
    }
  ]
}
const lessLoader = {
  test: /\.less$/,
  use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader']
}
const stylusLoader = {
  test: /\.styl(us)$/,
  use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'stylus-loader']
}

const freeStyle = [cssLoader, sassLoader, lessLoader, stylusLoader]

const jsLoader = {
  test: /\.jsx?$/,
  exclude: /node_modules/,
  use: ['babel-loader']
}

const videoLoader = {
  test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)\??.*$/,
  loader: 'url-loader',
  options: {
    limit: 50000,
    name: assetsPath('media/[name].[hash:6].[ext]')
  }
}

const imgLoader = {
  test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
  loader: 'url-loader',
  options: {
    limit: 10000,
    name: assetsPath('images/[name].[hash:6].[ext]')
  }
}

const fontLoader = {
  test: /\.(woff|woff2|eot|ttf|otf|htc)$/,
  use: {
    loader: 'file-loader',
    options: {
      limit: 4096,
      name: assetsPath('fonts/[name].[hash:6].[ext]')
    }
  }
}

const eslintLoader = {
  test: /\.(jsx?|vue)$/,
  enforce: 'pre',
  exclude: /node_modules/,
  loader: 'eslint-loader',
  options: {
    fix: true,
    emitWarning: true
  }
}

const pugTplLoader = {
  test: /\.pug$/,
  use: ['raw-loader', 'pug-html-loader'],
  include: [resolve('src/entries')],
  exclude: [/static/]
}

const pugLoader = {
  test: /\.pug$/,
  loader: 'pug-html-loader',
  exclude: /entries/
}

module.exports = function(mode) {
  const loaders = []
  if (mode !== 'development') {
    freeStyle.forEach(style => {
      style.use.splice(0, 1, {
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: '../'
        }
      })
    })
  } else {
    loaders.push(eslintLoader)
  }
  loaders.push(
    vueLoader,
    jsLoader,
    videoLoader,
    imgLoader,
    fontLoader,
    pugTplLoader,
    pugLoader
  )
  return loaders.concat(freeStyle)
}
