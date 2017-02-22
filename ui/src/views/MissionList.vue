<template>
    <div>
        <main-header></main-header>
        <tab :tabs="[{ text: 'Mission List', route: 'mission-list' }, { text: 'My Missions', route: 'my-missions' }]"></tab>
    </div>
</template>

<script>
    import MainHeader from '../components/MainHeader.vue'
    import Tab from '../components/Tab.vue'

    export default {
        components: {
            MainHeader,
            Tab
        },

        data: () => {
            return {
                missions: []
            }
        },

        ready() {
            console.log('Mission list mounted')
            document.title = 'Mission List'

            this.fetchMissions();
        },

        methods: {
            fetchMissions: function() {

                axios.get('/user', {
                    params: {
                        ID: 12345
                    }
                })
                .then(function (response) {
                    console.log(response);

                    this.missions = response.missions;
                })
                .catch(function (error) {
                    console.log(error);
                });
            }
        }

    }
</script>
