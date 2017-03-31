<template>
    <div>

        <main-header :title="title"></main-header>

        <tab :tabs="[
            { text: $t('all-missions'), route: 'missions.list', exact: true },
            { text: $t('my-missions'), route: 'missions.mine' }
        ]"></tab>

        <container>

            <feedback
                v-if="errorFeedback"
                type="error"
                class="margin__top--medium">
                <span slot="message" v-html="errorFeedback"></span>
            </feedback>

        </container>

        <router-view></router-view>

    </div>
</template>

<script>
    import axios from 'http'
    import router from 'routes'

    import MainHeader from 'components/MainHeader.vue'
    import Tab from 'components/Tab.vue'
    import Feedback from 'components/Feedback.vue'
    import Container from 'components/Container.vue'

    export default {
        components: {
            MainHeader,
            Tab,
            Feedback,
            Container,
        },

        props: ['error'],

        data () {

            return {
                errorFeedback: this.error,
                fetchTimer: null,
            }
        },

        mounted () {

            console.log('Missions mounted', this.error)

            this.startFetchTimer();
        },

        beforeDestroy () {

            this.stopFetchTimer();
        },

        computed: {

            unitName () {
                return this.$store.state.settings.unitName
            },

            title () {
                return this.unitName ? this.$t('mission-replays', { unitName: this.unitName }) : this.$t('mission-replays')
            },
        },

        methods: {

            startFetchTimer () {

                this.fetchMissions()
                this.fetchTimer = setInterval(this.fetchMissions, 5000)
            },

            stopFetchTimer () {

                this.fetchTimer && clearInterval(this.fetchTimer)
            },

            fetchMissions () {

                axios.get('/missions')
                    .then(response => {

                        //console.log('Got missions', response.data);
                        this.$store.commit('setMissionList', response.data)
                    })
                    .catch(error => {

                        // If we've failed to get our mission data the first time
                        // lets tell the user something is wrong with the API
                        if (!this.$store.state.missions.length)
                            this.errorFeedback = `Failed to fetch missions!`

                        console.log(error);
                    })
            }
        },

        watch: {
            unitName: function (name) {
                document.title = this.title
            }
        },
    }
</script>
