import Vue from 'vue'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import axios from 'http'

Vue.use(VueI18n)

// Setup our language strings
Object.keys(settings.locales).forEach(function(lang) {
    Vue.locale(lang, settings.locales[lang].strings)
})

Vue.config.lang = 'en'
Vue.config.fallbackLang = 'en'

Vue.prototype.$locale = {

    change (lang) {

        console.log('Changing locale', lang)
        Vue.config.lang = lang
    },

    current () {
        return Vue.config.lang
    }
}

import VueCookie from 'vue-cookie'
Vue.use(VueCookie);

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
    created() {

        this.init();
    },

    methods: {

        init() {

            // Store user's language preference
            this.$store.commit('setPreferenceLanguage', this.getLocalePreference())

            // Global var set in home.blade.php
            this.$store.commit('setSettings', settings)

            this.setLocale()
        },

        getLocalePreference() {

            let savedLocale = this.$cookie.get('locale')

            return (savedLocale) ? savedLocale : 'en'
        },

        setLocale(locale) {

            this.$locale.change(this.$store.state.preference.locale)

        },
    }
})
