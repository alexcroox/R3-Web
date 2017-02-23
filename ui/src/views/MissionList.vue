<template>
    <div>
        <main-header :title="title"></main-header>
        <tab :tabs="[{ text: 'All missions', route: 'mission-list' }, { text: 'My missions', route: 'my-missions' }]"></tab>

    </div>
</template>

<script>
    import axios from 'http'
    import { mapMutations } from 'vuex'

    import MainHeader from 'components/MainHeader.vue'
    import Tab from 'components/Tab.vue'

    export default {
        components: {
            MainHeader,
            Tab
        },

        data () {
            return {
                missions: [],
            }
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
                return this.unitName ? `${this.unitName} Mission List` : 'Mission List'
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
