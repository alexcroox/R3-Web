<template>
    <container>
        <list-search title="Missions" :listTotal="listTotal"></list-search>
    </container>
</template>

<script>
    import ListSearch from 'components/ListSearch.vue'
    import Container from 'components/Container.vue'

    export default {
        components: {
            Container,
            ListSearch
        },

        mounted () {

        },

        computed: {
            listTotal () {
                return this.$store.state.missions.length
            },
        },
    }
</script>
