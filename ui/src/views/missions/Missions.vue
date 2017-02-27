<template>
    <div>
        <main-header :title="title"></main-header>

        <tab :tabs="[{ text: 'All missions', route: 'missions.list', exact: true }, { text: 'My missions', route: 'missions.mine' }]"></tab>

        <router-view></router-view>
    </div>
</template>

<script>
    import axios from 'http'

    import MainHeader from 'components/MainHeader.vue'
    import Tab from 'components/Tab.vue'

    export default {
        components: {
            MainHeader,
            Tab
        },

        mounted () {
            console.log('Mission list mounted')

            this.fetchMissions();
        },

        computed: {
            unitName() {
                return this.$store.state.settings.unitName
            },

            title() {
                return this.unitName ? `${this.unitName} Mission Replays` : 'Mission Replays'
            },
        },

        watch: {
            unitName: function (name) {
                document.title = this.title
            }
        },

        methods: {

            fetchMissions () {

                axios.get('/missions')
                    .then(response => {

                        console.log('Got missions', response.data);
                        this.$store.commit('setMissionList', response.data)
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        }
    }
</script>
