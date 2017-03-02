import LogRocket from 'logrocket'
import Vue from 'vue'
import Vuex from 'vuex'
import { state, mutations } from './mutations'

Vue.use(Vuex)

const store = new Vuex.Store({
    state,
    mutations,
    plugins: [store => {
        store.subscribe(mutation => {
            LogRocket.log(mutation);
        });
    }],
})

export default store
