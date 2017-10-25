<template>
    <div>
        <main-header :title="title"></main-header>

        <tab :tabs="tabs"></tab>

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

        data () {
            return {
                tabs: []
            }
        },

        mounted () {
            console.log('Stats mounted')

            this.tabs = [
                { text: ucfirst(this.$t('summary')), route: 'stats.summary', icon: 'tachometer', exact: true },
                { text: ucfirst(this.$t('my-stats')), route: 'stats.me', icon: 'address-card', exact: true },
                { text: ucfirst(this.$t('terrains')), route: 'stats.terrains', icon: 'globe' }
            ]

            if (this.$store.state.settings.adminToken)
                this.tabs.push({ text: ucfirst(this.$t('attendance')), route: 'stats.attendance', icon: 'user', private: true })
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
