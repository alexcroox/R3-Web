
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import axios from 'http'

import router from 'routes'
import store from './store'

Vue.use(VueRouter)

new Vue({
    el: '#app',

    store,

    router,

    // We use created here because we want settings
    // to be available to other components as soon as possible.
    // Since it's being loaded from the php rendered view, this is possible
    created () {

        this.setSettings();
    },

    methods: {

        setSettings () {

            // Global var set in home.blade.php
            this.$store.commit('setSettings', settings)
        },
    }
})
