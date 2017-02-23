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
    },
    {
        path: '/admin',
        name: 'admin-index',
        component: require('./views/Admin.vue')
    },
    {
        path: '*',
        component: require('./views/NotFound.vue')
    },
]

export default new VueRouter({
    mode: 'history',
    routes
})
