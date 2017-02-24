<template>
    <container>
        <list-search title="Missions" :listTotal="missions.length" placeholder="Search missions"></list-search>

        <table-list :data="missions" :headers="headers"></table-list>
    </container>
</template>

<script>
    import ListSearch from 'components/ListSearch.vue'
    import Container from 'components/Container.vue'
    import TableList from 'components/TableList.vue'

    export default {
        components: {
            Container,
            ListSearch,
            TableList
        },

        data () {
            return {
                headers: [
                    { label: 'Mission Name', dataKey: 'name' },
                    { label: 'Terrain', dataKey: 'terrain' },
                    { label: 'Length', dataKey: '' },
                    { label: 'Players', dataKey: 'player_count' },
                    { label: 'Date Played', dataKey: 'played_human' },
                ]
            }
        }

        computed: {

            missions () {
                return this.$store.state.missions
            },
        },
    }
</script>
