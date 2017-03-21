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
            noUiSlider.create(this.scrubber, this.config)

            console.log('Slider: min', this.min)
            console.log('Slider: max', this.max)

            this.scrubber.noUiSlider.set(100)
            document.querySelector('.slider__handle').innerHTML = 'test'
        }
    }
</script>

<style lang="stylus">

    .slider__base
        width 100%
        height 100%
        position relative
        background #FFF

    .slider__handle
        padding 8px 0 0 9px
        font-size 12px
        font-weight 500
        transform translateZ(0)
        position relative
        width 8px
        left -4px
        height 28px
        top -6px
        color #FFF
        z-index 1

    .slider__handle:hover
        cursor col-resize

    .slider__handle:after
        content ''
        display block
        position absolute
        width 2px
        background #FFF
        height 22px
        top 4px
        left 3px

    .slider__handle:before
        display none

    .slider__origin
        position absolute
        right 0
        top 0
        left 0
        bottom 0
        background #030303

    .slider__target
        position absolute
        top 9px
        left 120px
        right 60px
        transform translateZ(0)
        background #030303
        height 18px

    .slider__connect
        background #FFF
</style>
