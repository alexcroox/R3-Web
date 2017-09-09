<template>
    <div class="margin__bottom--large">

        <container v-if="playerId && !changePlayerId">

            <list-search
                :title="ucfirst($t('missions'))"
                :finishedLoading="noPlayerMissions"
                :listTotal="listData.length"
                @searched="updateSearchQuery($event)"
                :placeholder="$t('search-missions')">

                <router-link
                    v-if="playerId && !noPlayerMissions"
                    :to="{ name: 'stats.me' }"
                    class="view-my-stats text-link">
                    <i class="fa fa-area-chart" aria-hidden="true"></i>
                    {{ $t('view-my-stats') }}
                </router-link>
            </list-search>

            <table-list-missions
                :data="listData"
                :columns="listColumns"
                :filter-key="searchQuery"
                :noData="noPlayerMissions">
            </table-list-missions>
        </container>

        <player-id @changePlayerId="updateChangePlayerId"></player-id>

    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import axios from 'http'
    import _each from 'lodash.foreach'
    import { ucfirst } from 'filters'

    import ListSearch from 'components/ListSearch.vue'
    import Container from 'components/Container.vue'
    import TableListMissions from 'components/TableListMissions.vue'
    import PlayerId from 'components/PlayerId.vue'

    export default {
        components: {
            Container,
            ListSearch,
            TableListMissions,
            PlayerId,
        },

        data () {
            return {
                searchQuery: '',
                changePlayerId: false,
                noPlayerMissions: false,
                listColumns: ['mission', 'terrain', 'length', 'players', 'played'],
            }
        },

        computed: {

            ...mapGetters([
                'playerId',
                'missions'
            ]),

            listData () {

                let missionData = []

                if(this.missions) {

                    _each(this.missions, (item) => {

                        if (!item) return

                        let itemData = { ...item }

                        // We only want missions that this player was a part of
                        if (item.player_list.indexOf(this.playerId) > -1) {

                            itemData.mission = (item.display_name != "")? item.display_name : item.name
                            itemData.length = item.length_human
                            itemData.players = item.player_count
                            itemData.played = item.played_human
                            itemData.terrain = item.terrain.toUpperCase()

                            missionData.push(itemData)
                        }
                    });

                    if (!missionData.length)
                        this.noPlayerMissions = true
                    else
                        this.noPlayerMissions = false

                    console.log('missionData', missionData)
                }

                return missionData
            },
        },

        methods: {

            updateSearchQuery (val) {

                this.searchQuery = val
            },

            updateChangePlayerId (change) {
                this.changePlayerId = change
            },

            ucfirst,
        },
    }
</script>

<style scoped lang="stylus">
    .view-my-stats
        float right
</style>
