if (process.env == 'development') require('./lzx.pug')

import Vue from 'vue'
import '@/assets/styles/reset.css'
import '@/assets/styles/lzx.css'

console.log(234)

new Vue({
  el: '#app',
  template: '<h1>ok</h1>'
})
