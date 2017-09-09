<template>
    <div>
        <main-header :title="title"></main-header>

        <tab :tabs="[
            { text: ucfirst($t('summary')), route: 'stats.summary', icon: 'tachometer', exact: true },
            { text: ucfirst($t('my-stats')), route: 'stats.me', icon: 'address-card', exact: true },
            { text: ucfirst($t('terrains')), route: 'stats.terrains', icon: 'globe' },
            { text: ucfirst($t('attendance')), route: 'stats.attendance', icon: 'user', private: true },
        ]"></tab>

        <router-view></router-view>
    </div>
</template>

<script>
    import axios from 'http'

    import MainHeader from 'components/MainHeader.vue'
    import Tab from 'components/Tab.vue'
    import { ucfirst } from 'filters'

    export default {
        components: {
            MainHeader,
            Tab
        },

        mounted () {
            console.log('Stats mounted')
        },

        computed: {
            unitName() {
                return this.$store.state.settings.unitName
            },

            title() {
                return this.unitName ? `${this.unitName} Stats` : 'Stats'
            },
        },

        watch: {
            unitName: function (name) {
                document.title = this.title
            }
        },

        methods: {

            fetchStats () {

                axios.get('/stats/summary')
                    .then(response => {

                        console.log('Got stats', response.data);
                        this.$store.commit('setStatsSummary', response.data)
                    })
                    .catch(error => {
                        console.log(error);
                    })
            },
            ucfirst,
        }
    }
</script>
