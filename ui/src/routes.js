import VueRouter from 'vue-router'

let routes = [
    {
        path: '/',
        component: require('./views/MissionList.vue')
    },
    {
        path: '/my-missions',
        component: require('./views/MyMissions.vue')
    }
]

export default new VueRouter({
    mode: 'history',
    routes
})
