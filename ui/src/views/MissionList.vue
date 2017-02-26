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

    import _each from 'lodash.foreach'

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
                    { label: 'Length', dataKey: 'length' },
                    { label: 'Players', dataKey: 'player_count' },
                    { label: 'Date Played', dataKey: 'played_human' },
                ]
            }
        },

        computed: {

            // Re-org mission data to match order of header keys
            missions () {

                let dataKeyed = []

                if(this.$store.state.missions) {

                    let headers = this.headers

                    _each(this.$store.state.missions, (item) => {

                        let orderedData = []

                        _each(headers, (header) => {
                            orderedData.push({
                                value: item[header.dataKey],
                                display: item[header.dataKey],
                                dataKey: header.dataKey
                            })
                        })

                        dataKeyed.push(orderedData)
                    });

                    console.log('dataKeyed', dataKeyed)

                    return dataKeyed;

                } else {
                    return dataKeyed
                }
            },
        },
    }
</script>
