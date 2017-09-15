<template>
    <container class="margin__bottom--large">
        <list-search
            :title="ucfirst($t('players'))"
            :listTotal="listData.length"
            @searched="updateSearchQuery($event)"
            :placeholder="$t('search-players')">
        </list-search>

        <table-list-generic
            :data="listData"
            :columns="listColumns"
            :filterKey="searchQuery"
            noDataMessage="No players have been found in missions yet">
        </table-list-generic>
    </container>
</template>

<script>
    import ListSearch from 'components/ListSearch.vue'
    import Container from 'components/Container.vue'
    import TableListGeneric from 'components/TableListGeneric.vue'

    import axios from 'http'
    import { ucfirst } from 'filters'
    import _each from 'lodash.foreach'

    export default {
        components: {
            Container,
            ListSearch,
            TableListGeneric
        },

        data () {
            return {

                searchQuery: '',
                listColumns: ['player', 'missions-attended', 'last-seen'],
            }
        },

        mounted () {

            this.fetchStats()
        },

        methods: {

            updateSearchQuery (val) {

                this.searchQuery = val
            },

            fetchStats () {

                axios.get('/stats/attendance')
                    .then(response => {

                        console.log('Got attendance stats', response.data);
                        this.$store.commit('setStatsAttendance', response.data)
                    })
                    .catch(error => {
                        console.error(error);
                    })
            },
            ucfirst,
        },

        computed: {

            listData () {

                let listData = []

                if(this.$store.state.stats.attendance) {

                    _each(this.$store.state.stats.attendance, (item) => {

                        let itemData = item;

                        itemData['player'] = item.name
                        itemData['missions-attended'] = item.mission_count
                        itemData['last-seen'] = item.last_seen_human

                        listData.push(itemData)
                    });

                    console.log('statsData', listData)
                }

                return listData
            },
        }
    }
</script>
