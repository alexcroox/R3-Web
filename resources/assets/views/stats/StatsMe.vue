<template>
    <div>
        <container v-if="validPlayer && playerId && !changePlayerId && stats.bio">
            <h1>{{ stats.bio.name }}</h1>
            <h3>Total missions: {{ stats.missionCount }}</h3>

            <h3>Total kills: {{ stats.kills.total }}</h3>

            <h3>Total deaths: {{ stats.deaths.total }}</h3>

            <div>
                <h3>Most played factions</h3>
                <ul>
                    <li v-for="faction in stats.factionCount">
                        <span :style="{ color: faction.factionData.color }">
                            {{ faction.factionData.name }} -  {{ faction.total }}
                        </span>
                    </li>
                </ul>
            </div>

            <div>
                <h3>Most played class</h3>
                <ul>
                    <li v-for="classData in stats.classes">
                        <span>
                            <img width="10" :src="classData.iconUrl" />
                            {{ classData.class }} -  {{ classData.total }}
                        </span>
                    </li>
                </ul>
            </div>

            <div>
                <h3>Most played fireteam</h3>
                <ul>
                    <li v-for="fireteam in stats.fireTeams">
                        <span>
                            {{ fireteam.group }} -  {{ fireteam.total }}
                        </span>
                    </li>
                </ul>
            </div>

             <div>
                <h3>Most used primary weapons</h3>
                <ul>
                    <li>
                        Coming soon...
                    </li>
                </ul>
            </div>

            <div>
                <h3>Most used launchers</h3>
                <ul>
                    <li>
                        Coming soon...
                    </li>
                </ul>
            </div>
        </container>

        <container>
            <feedback
                v-if="!changePlayerId && (!validPlayer || !playerId)"
                type="information"
                class="margin__top--medium">
                <span slot="message" v-html="$t('no-player-missions', { unitName: unitName })"></span>
            </feedback>
        </container>

        <player-id @changePlayerId="updateChangePlayerId"></player-id>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import axios from 'http'
    import { ucfirst } from 'filters'
    import _each from 'lodash.foreach'

    import Container from 'components/Container.vue'
    import PlayerId from 'components/PlayerId.vue'
    import Feedback from 'components/Feedback.vue'

    export default {
        components: {
            Container,
            PlayerId,
            Feedback
        },

        data () {
            return {
                changePlayerId: false,
                validPlayer: false,
            }
        },

        mounted () {

            this.fetchStats()
        },

        computed: {

            unitName () {
                return this.$store.state.settings.unitName
            },

            ...mapGetters([
                'playerId',
            ]),

            ...mapGetters({
                stats: 'statsMe'
            }),
        },

        methods: {

            fetchStats () {

                console.log('Fetching player stats', this.playerId)

                axios.get(`/stats/player/${this.playerId}`)
                    .then(response => {

                        console.log('Got player stats', response.data);

                        if (!response.error) {
                            this.validPlayer = true
                            this.$store.commit('setStatsMe', response.data)
                        } else {
                            this.validPlayer = false
                        }
                    })
                    .catch(error => {
                        console.error(error)
                        this.validPlayer = false
                    })
            },

            updateChangePlayerId (change) {
                this.changePlayerId = change

                this.fetchStats()
            },

            ucfirst,
        },
    }
</script>
