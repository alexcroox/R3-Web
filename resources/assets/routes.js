import VueRouter from 'vue-router'

let routes = [
    {
        path: '/',
        component: require('./views/missions/Missions.vue'),
        props: true,
        children: [{
            path: '',
            name: 'missions.list',
            component: require('./views/missions/MissionList.vue')
        }, {
            path: 'my-missions',
            name: 'missions.mine',
            component: require('./views/missions/MyMissions.vue')
        }]
    },

    {
        path: '/:id(\\d+)/:terrain/*',
        name: 'playback',
        props: (route) => ({ urlData: route }),
        component: require('./views/Playback.vue')
    },

    {
        path: '/admin',
        name: 'admin',
        component: require('./views/Admin.vue')
    },

    {
        path: '/stats',
        component: require('./views/stats/Stats.vue'),
        children: [{
            path: '',
            name: 'stats.summary',
            component: require('./views/stats/StatsSummary.vue')
        }, {
            path: 'me',
            name: 'stats.me',
            component: require('./views/stats/StatsMe.vue')
        }, {
            path: 'terrains',
            name: 'stats.terrains',
            component: require('./views/stats/StatsTerrains.vue')
        }, {
            path: 'attendance',
            name: 'stats.attendance',
            component: require('./views/stats/StatsAttendance.vue')
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
