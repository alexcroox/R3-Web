<template>
    <map-box class="player-list">

    </map-box>
</template>

<script>
    import MapBox from 'components/MapBox.vue'

    export default {

        props: ['hidden'],

        components: {
            MapBox,
        },
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    .player-list
        left 0
        top 0
        bottom 0
        width 186px
        color #FFF

        @media (max-width 650px)
            display none !important

    .player-list--inactive
        opacity 0.3
        background rgba(0,0,0,0.1)
</style>
