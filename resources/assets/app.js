
import Vue from 'vue'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import axios from 'http'

Vue.use(VueI18n)
Vue.config.lang = 'en'
Vue.config.fallbackLang = 'en'

// Setup our language strings
Object.keys(settings.locales).forEach(function (lang) {
    Vue.locale(lang, settings.locales[lang])
})

import VueRouter from 'vue-router'
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
