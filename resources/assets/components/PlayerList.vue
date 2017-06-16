<template>
    <map-box
        class="player-list__container"
        :class="{ 'player-list__container--hide': hidden }">

        <router-link to="/" class="player-list__back">
            <i class="fa fa-arrow-left player-list__back__icon"></i>
            Mission list
        </router-link>

        <a @click="toggleHide" class="player-list__toggle-sticky" title="Toggle player list auto hide">
            <i class="fa fa-thumb-tack"></i>
        </a>

        <div
            class="player-list"
            v-on:mouseleave="mouseLeave"
            v-on:mouseenter="mouseEnter">
        </div>
    </map-box>
</template>

<script>
    import MapBox from 'components/MapBox.vue'

    export default {

        components: {
            MapBox,
        },

        data () {
            return {
                autoHide: true,
                hidden: false,
                hideTimer: null,
                hideTime: 3, // seconds before player list fades out
            }
        },

        mounted () {
            this.startHideTimer()
        },

        methods: {

            toggleHide () {

                this.autoHide = !this.autoHide
            },

            mouseEnter () {

                clearTimeout(this.hideTimer);
                this.hidden = false
            },

            mouseLeave () {

                clearTimeout(this.hideTimer);
                this.startHideTimer();
            },

            startHideTimer (timeout = this.hideTime) {

                this.hideTimer = setTimeout(() => {

                    if(this.autoHide)
                        this.hidden = true

                }, timeout * 1000);
            },
        },
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    .player-list__container
        left 0
        top 0
        bottom 0
        width 186px
        color #FFF
        background rgba(0,0,0,.7)
        transition opacity 0.3s ease-in-out;
        transition background 0.3s ease-in-out;

        @media (max-width 650px)
            display none !important

    .player-list__container--hide
        opacity 0.3
        background rgba(0,0,0,0.1)

    .player-list__back
        display block
        width 100%
        color #DDD
        font-size 13px
        font-weight 500
        vertical-align middle
        padding 10px
        border-bottom 1px solid #666
        text-transform uppercase
        z-index 1
        position relative

    .player-list__back:hover
        color #FFF

    .player-list__back__icon
        display inline-block
        margin-right 5px
        vertical-align text-top

    .player-list__toggle-sticky
        position absolute
        top -3px
        right 2px
        color #B7C0C6
        padding 10px
        z-index 2

    .player-list__toggle-sticky--inactive
        color #FFF

    .player-list__container--hide .player-list__group__member img
        opacity 0.3

    .player-list
        padding 10px 10px 10px 10px
        overflow hidden
        position absolute
        top 36px
        bottom 0px
        right 0
        left 0

    .player-list__faction
    .player-list__group
        padding-left 13px
        font-size 15px
        color #FFF
        font-weight 700
        position relative
        margin-bottom 10px

    .player-list__faction
        text-transform uppercase
        letter-spacing 0.03em

    .player-list__group
        text-transform none
        margin 5px 0 0 2px
        font-size 13px

    .player-list__expand-handle
        color #FFF
        display block

    .player-list__expand-handle:before
        left 0
        top 2px
        position absolute
        font-size 12px
        content "\f0da"
        font-family FontAwesome
        color #CCC

    .player-list__expand-handle--group:before
        top 1px

    .player-list__expand-handle--expanded:before
        content "\f0d7"

    .player-list__expand-handle--collapsed + .player-list__expand-list
        display none

    .player-list__group-member
        padding 1px 10px 1px 5px
        color #FFF
        font-size 13px
        display block
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
        min-width 153px
        position relative

    .player-list__group-member--tracking
        background #CCC
        color #000

    .player-list__group-member--stopping-tracking
        animation trackingFlash 0.3s
        animation-iteration-count 4

    @keyframes trackingFlash
        0%
            background #CCC
        100%
            background none

    .player-list__group-member img
        display inline-block
        margin-right 5px
        width 12px
        vertical-align sub</style>
