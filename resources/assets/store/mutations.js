import Vue from 'vue'

export const state = {
    settings: {},
    missions: [],
    preference: {
        locale: {
            label: 'English',
            value: 'en'
        }
    },
    stats: {
        summary: {},
        terrains: [],
        attendance: [],
        me: {},
    }
}

export const mutations = {

    setSettings(state, settings) {
        state.settings = settings
    },

    setMissionList(state, missions) {
        state.missions = missions
    },

    setStatsTerrains(state, terrains) {
        Vue.set(state.stats, 'terrains', terrains)
    },

    setStatsAttendance(state, attendance) {
        Vue.set(state.stats, 'attendance', attendance)
    },

    setStatsMe(state, stats) {
        Vue.set(state.stats, 'me', stats)
    },

    setPreferenceLanguage(state, locale) {
        console.warn('Locale changing', locale)
        Vue.set(state.preference, 'locale', locale)
    },

    setPreferencePlayerId(state, playerId) {
        Vue.set(state.preference, 'playerId', playerId)
    },

    setPreferencePlaybackSpeed(state, speed) {
        Vue.set(state.preference, 'playbackSpeed', speed)
    },
}
