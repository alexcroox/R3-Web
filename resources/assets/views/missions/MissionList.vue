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
    import miniToastr from 'mini-toastr'

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

        mounted () {

            miniToastr.success('message', 'title')
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

                        let itemData = item;

                        itemData.mission = item.display_name
                        itemData.length = item.length_human
                        itemData.players = item.player_count
                        itemData.played = item.played_human

                        missionData.push(itemData)
                    });

                    console.log('missionData', missionData)
                }

                return missionData
            },
        },
    }
</script>
