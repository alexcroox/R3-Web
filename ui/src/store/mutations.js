export const state = {
    settings: {},
    missionList: []
}

export const mutations = {

    setSettings(state, settings) {
        state.settings = settings
    },

    setMissionList(state, missions) {
        state.missionList = missions
    },
}
