<template>
    <container>
        <list-search title="Missions" :listTotal="listData.length" @searched="updateSearchQuery($event)" placeholder="Search missions"></list-search>

        <table-list
            :data="listData"
            :columns="listColumns"
            :filter-key="searchQuery">
        </table-list>
    </container>
</template>

<script>
    import ListSearch from 'components/ListSearch.vue'
    import Container from 'components/Container.vue'
    import TableList from 'components/TableList.vue'

    import _each from 'lodash.foreach'

    export default {
        components: {
            Container,
            ListSearch,
            TableList
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
