import VueRouter from 'vue-router'

let routes = [{
    path: '/',
    name: 'missions',
    component: require('./views/Missions.vue'),
    children: [{
        path: '',
        name: 'missions.list',
        component: require('./views/MissionList.vue')
    }, {
        path: 'my-missions',
        name: 'missions.mine',
        component: require('./views/MyMissions.vue')
    }]
}, {
    path: '/admin',
    name: 'admin',
    component: require('./views/Admin.vue')
}, {
    path: '/stats',
    name: 'stats',
    component: require('./views/Stats.vue')
}, {
    path: '*',
    component: require('./views/NotFound.vue')
}, ]

export default new VueRouter({
    mode: 'history',
    routes
})
