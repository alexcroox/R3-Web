<template>
    <div>
        <main-header :title="headerTitle"></main-header>
        <tab :tabs="[{ text: 'Mission List', route: 'mission-list' }, { text: 'My Missions', route: 'my-missions' }]"></tab>

    </div>
</template>

<script>
    import axios from 'axios'

    import MainHeader from 'components/MainHeader.vue'
    import Tab from 'components/Tab.vue'

    export default {
        components: {
            MainHeader,
            Tab
        },

        data: () => {
            return {
                missions: [],
                settings: {},
                headerTitle: 'M List'
            }
        },

        mounted () {
            console.log('Mission list mounted')
            document.title = 'M List'

            this.fetchSettings();
            this.fetchMissions();
        },

        methods: {

            fetchSettings () {

                axios.get('/settings')
                .then(response => {
                    console.log(response);

                    this.settings = response.settings;
                })
                .catch(error => {
                    console.log(error);
                })
            },

            fetchMissions () {

                axios.get('/missions')
                .then(response => {

                    console.log(response);
                    this.missions = response.missions;
                })
                .catch(error => {
                    console.log(error);
                })
            }
        }
    }
</script>
