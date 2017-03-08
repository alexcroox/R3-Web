import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { state, mutations } from './mutations'

Vue.use(Vuex)

export default new Vuex.Store({
    state,
    mutations,
    plugins: [createPersistedState()]
})
