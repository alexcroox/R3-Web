
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import axios from 'http'

// Import some global styles
import './style/index.styl'

import router from 'routes'
import store from './store'

Vue.use(VueRouter)

new Vue({
    el: '#app',

    store,

    router,

    mounted () {

        this.setSettings();
    },

    methods: {

        setSettings () {

            // Global var set in home.blade.php
            this.$store.commit('setSettings', settings)
        },
    }
})
