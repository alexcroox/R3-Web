<template>
    <div class="slider">
        <div id="slider__rail"></div>
    </div>
</template>

<script>
    import noUiSlider from 'nouislider'

    export default {

        props: ['min', 'max'],

        data () {
            return {
                config: {
                    start: this.min,
                    animate: false,
                    connect: 'lower',
                    step: 1,
                    range: {
                        'min': this.min,
                        'max': this.max
                    },
                    cssPrefix: 'slider__'
                },
            }
        },

        mounted () {

            this.scrubber = document.getElementById('slider__rail')
            noUiSlider.create(this.scrubber, this.config);
        }
    }
</script>

<style lang="stylus">

    .slider
        left 50%
        right 10px
        bottom 10px
        height 36px
        overflow hidden
        position absolute
        background rgba(0,0,0,.5)
        z-index 2

    #slider__rail
        position absolute
        top 9px
        left 120px
        right 60px

    .slider__handle
        padding 8px 0 0 9px
        font-size 12px
        font-weight 500
        transform translateZ(0)
        box-shadow none
        border none
        background none
        border-radius 0
        width 8px
        left -4px
        color #FFF

    .slider__handle:hover
        cursor col-resize

    .slider__handle:after
        width 2px
        background #FFF
        height 22px
        top 4px
        left 3px

    .slider__handle:before
        display none

    .slider__origin
    .slider__target
        transform translateZ(0)
        border none
        border-radius 0px
        background #030303
        box-shadow none !important

    .slider__connect
        background #FFF
</style>
