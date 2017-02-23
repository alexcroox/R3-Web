export const state = {
    settings: {},
    missions: []
}

export const mutations = {

    setSettings(state, settings) {
        state.settings = settings
    },

    setMissionList(state, missions) {
        state.missions = missions
    },
}
