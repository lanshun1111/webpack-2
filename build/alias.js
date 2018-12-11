const path = require('path')
const { useDll } = require('../ying.config')

function resolve(dir) {
  return path.resolve(__dirname, '..', dir)
}

const alias = {
  '@': resolve('src'),
  '@util': resolve('src/util'),
  '@shared': resolve('src/shared'),
  '@model': resolve('src/model'),
  '@assets': resolve('src/assets')
}

if (!useDll) alias['vue$'] = 'vue/dist/vue.esm.js'

module.exports = {
  alias,
  resolve
}
