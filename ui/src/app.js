import Vue from 'vue'
import VueRouter from 'vue-router'

// Import some global styles
import './style/index.styl'

import router from './routes'

Vue.use(VueRouter)

new Vue({
    el: '#app',
    router
})
