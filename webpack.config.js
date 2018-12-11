const mode = process.env.NODE_ENV
const compiler = require(`./build`)

module.exports = compiler(mode)
