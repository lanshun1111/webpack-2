import Vue from 'vue'

import Home from './index.vue'
import { log } from '@/common/util'

function fn() {
  console.log(123)
}

log(123)
new Vue({
  render: h => h(Home)
}).$mount('#app')
