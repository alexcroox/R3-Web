<template>
    <container>
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
</template>

<script>
    import Container from 'components/Container.vue'

    import axios from 'http'
    import { ucfirst } from 'filters'
    import _each from 'lodash.foreach'

    export default {
        components: {
            Container,
        },

        data () {
            return {
                stats: this.$store.state.stats.me,
                playerId: this.$store.state.preference.playerId,
            }
        },

        mounted () {

            this.fetchStats()
        },

        methods: {

            fetchStats () {

                axios.get(`/stats/player/${this.playerId}`)
                    .then(response => {

                        console.log('Got player stats', response.data);
                        this.$store.commit('setStatsMe', response.data)
                    })
                    .catch(error => {
                        console.error(error);
                    })
            },

            ucfirst,
        },

        computed: {

        }
    }
</script>
