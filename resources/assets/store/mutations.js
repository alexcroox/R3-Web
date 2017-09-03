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
        state.stats.terrains = terrains
    },

    setStatsAttendance(state, attendance) {
        state.stats.attendance = attendance
    },

    setPreferenceLanguage(state, locale) {
        console.warn('Locale changing', locale)
        state.preference.locale = locale
    },

    setPreferencePlayerId(state, playerId) {
        state.preference.playerId = playerId
    },

    setPreferencePlaybackSpeed(state, speed) {
        state.preference.playbackSpeed = speed
    },
}
