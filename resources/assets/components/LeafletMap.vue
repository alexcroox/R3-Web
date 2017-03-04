<template>
    <div id="map">

    </div>
</template>

<script>

    export default {
        props: ['terrain', 'tileDomain'],

        data () {
            return {
                zooming: false
            }
        },

        mounted () {

            this.loadTerrain()
        },

        methods: {

            loadTerrain () {

                console.log('Loading terrain: ', this.terrain)
            }
        }
    }
</script>

<style lang="stylus">
    #map
        position relative
        width 100%
        height 100%
        background-color #C7E6FC
        z-index 1

    .leaflet-control-zoom
        @media (max-width 450px)
            display none
</style>
