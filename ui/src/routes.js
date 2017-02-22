import VueRouter from 'vue-router'

let routes = [
    {
        path: '/',
        name: 'mission-list',
        component: require('./views/MissionList.vue')
    },
    {
        path: '/my-missions',
        name: 'my-missions',
        component: require('./views/MyMissions.vue')
    }
]

export default new VueRouter({
    mode: 'history',
    routes
})
