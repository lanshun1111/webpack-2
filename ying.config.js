module.exports = {
  useExternals: true,
  useDll: false,
  extractEntries: {
    vue: ['vue'],
    react: ['react', 'react-dom'],
    vendor: ['jquery', 'axios']
  },
  analyze: false,
  useGzip: false,
  makeZip: {
    on: false,
    name: 'reactmoon',
    sourceMap: false
  },
  assetsToInclude: [
    {
      path: 'https://cdn.bootcss.com/animate.css/3.7.0/animate.min.css',
      type: 'css'
    }
  ]
}
