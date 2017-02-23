import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import axios from 'http'

// Import some global styles
import './style/index.styl'

import router from './routes'
import store from './store'

Vue.use(VueRouter)

new Vue({
    el: '#app',

    store,

    router,

    mounted () {

        this.fetchSettings();
    },

    methods: {

        fetchSettings () {

            axios.get('/settings')
                .then(response => {
                    console.log('Got settings', response.data);

                    this.$store.commit('setSettings', response.data)
                })
                .catch(error => {
                    console.log(error);
                })
        },
    }
})
