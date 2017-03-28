<template>
    <div id="map" v-bind:style="{ backgroundColor: terrainConfig.bgColor }"></div>
</template>

<script>

    export default {
        props: ['terrainConfig'],
    }

</script>

<style lang="stylus">
    @import '~leaflet/dist/leaflet.css'

    #map
        position relative
        width 100%
        height 100%
        background-color #C7E6FC
        z-index 1

    .leaflet-control-zoom
        @media (max-width 450px)
            display none

    .map__label
        background-clip padding-box
        color #000
        display block
        font 11px/22px "Helvetica Neue", Arial, Helvetica, sans-serif
        font-weight bold
        margin-top 4px
        padding 0 0 0 10px
        border none
        background none
        position absolute
        user-select none
        pointer-events none
        white-space nowrap
        z-index 6

    .map__label__poi
        padding 0
        line-height 0px
        font-size 11px
        color #444

    .map__label__poi--namelocal
        color #71624d

    .map__label__poi--namemarine
        color #2471c6

    .map__label__poi--viewpoint
        color #c7010e

    .map__label__poi--strongpointarea
    .map__label__poi--airport
        color #607c4f

</style>
