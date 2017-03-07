export const state = {
    settings: {},
    missions: [],
    preference: {},
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
        state.preference.locale = locale
    },
}
