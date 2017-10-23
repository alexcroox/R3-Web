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
        padding 0 0 0 25px
        border none
        background none
        user-select none
        pointer-events none
        white-space nowrap
        box-shadow none
        z-index 6

    .map__label:before
        display none

    .map__label--is-dead
        opacity 0.4
        display block

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

    .map__label__infantry
    .map__label__vehicle
        font-size 11px
        letter-spacing 0.04em
        margin 0 0 0 -12px

    .map__label__vehicle--driver
        padding 0 6px
        display block
        line-height 14px

    .map__label__vehicle__crew
    .map__label__vehicle__cargo
        line-height 14px
        display block
        color #666

    .map__label__vehicle__crew__unit
    .map__label__vehicle__cargo__unit
        display block
        padding 0 6px
        line-height 14px
        margin-top 0px
        color #666

    .map__label__text
        display block

    .map__label--highlighted
        z-index 7

    .map__label--highlighted .map__label__text
    .map__label__vehicle--highlight-unit
        color #FFF
        background rgba(0,0,0,.5)
        padding 0 6px
        z-index 7

    .projectile__missile
    .projectile__rocket
    .projectile__grenade
        transition all 0.7s

    .projectile__launch-pulse
        visibility hidden
        animation launchPulse 1s
        animation-timing-function ease-in-out
        transform-origin 50% 50%

    @keyframes launchPulse
        0%
            visibility visible
            transform scale(0)
        50%
            transform scale(20)
        100%
            transform scale(0)

    .projectile__grenade
        visibility hidden
        animation grenadeExplode 1s
        animation-timing-function ease-in-out
        transform-origin 50% 50%

    @keyframes grenadeExplode
        0%
            visibility visible
            transform scale(0)
        50%
            transform scale(5)
        100%
            transform scale(0)

    .projectile__smoke
        animation smoke 5s
        animation-timing-function ease-in-out

    @keyframes smoke
        0%
            opacity 0
        50%
            opacity 1
        100%
            opacity 0
</style>
