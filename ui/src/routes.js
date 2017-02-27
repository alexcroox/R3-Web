import VueRouter from 'vue-router'

let routes = [

{
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
},

{
    path: '/admin',
    name: 'admin',
    component: require('./views/Admin.vue')
},

{
    path: '/stats',
    name: 'stats',
    component: require('./views/stats/Stats.vue'),
    children: [{
        path: '',
        name: 'stats.summary',
        component: require('./views/stats/StatsSummary.vue')
    }, {
        path: 'terrains',
        name: 'stats.terrains',
        component: require('./views/stats/StatsTerrains.vue')
    }]
},

{
    path: '*',
    component: require('./views/NotFound.vue')
}

]

export default new VueRouter({
    mode: 'history',
    routes
})
