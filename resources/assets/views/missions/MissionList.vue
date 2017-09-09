<template>
    <container>
        <list-search
            :title="ucfirst($t('missions'))"
            :listTotal="listData.length"
            @searched="updateSearchQuery($event)"
            :placeholder="$t('search-missions')">
        </list-search>

        <table-list-missions
            :data="listData"
            :columns="listColumns"
            :filter-key="searchQuery">
        </table-list-missions>
    </container>
</template>

<script>
    import ListSearch from 'components/ListSearch.vue'
    import Container from 'components/Container.vue'
    import TableListMissions from 'components/TableListMissions.vue'

    import _each from 'lodash.foreach'
    import { ucfirst } from 'filters'

    export default {
        components: {
            Container,
            ListSearch,
            TableListMissions
        },

        data () {
            return {

                searchQuery: '',

                listColumns: ['mission', 'terrain', 'length', 'players', 'played'],
            }
        },

        methods: {

            updateSearchQuery (val) {

                this.searchQuery = val
            },
            ucfirst,
        },

        computed: {

            listData () {

                let missionData = []

                if(this.$store.state.missions) {

                    _each(this.$store.state.missions, (item) => {

                        if (!item) return

                        let itemData =  { ...item }

                        itemData.mission = (item.display_name != "")? item.display_name : item.name
                        itemData.length = item.length_human
                        itemData.players = item.player_count
                        itemData.played = item.played_human
                        itemData.terrain = item.terrain.toUpperCase()

                        missionData.push(itemData)
                    });
                }

                return missionData
            },
        },
    }
</script>
