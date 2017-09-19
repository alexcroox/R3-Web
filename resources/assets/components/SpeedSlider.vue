<template>
    <div class="speed-slider__container" @mouseleave="stopSlide">
        <div
            class="speed-slider"
            ref="container"
            @mousedown="startSlide"
            @mousemove="updateRail"
            @mouseup="stopSlide">

                <div class="speed-slider__fake-rail"></div>
                <div class="speed-slider__rail" :style="percentageWidth"></div>

        </div>

        <div class="speed-slider__info">{{ speed }}x</div>
    </div>
</template>

<script>

    export default {

        props: ['speed'],

        data () {
            return {
                targetDifference: 0,
                sliding: false,
                min: this.$store.state.settings.minimumPlaybackSpeed,
                max: this.$store.state.settings.maximumPlaybackSpeed,
            }
        },

        mounted () {

            this.targetDifference = (this.speed / (this.max - this.min))
        },

        computed: {

            percentageWidth () {

                let percentage = this.targetDifference * 100

                return {
                    width: `${percentage}%`
                }
            },

            calculatedSpeed () {

                let calculateSpeed = Math.round((this.max - this.min) * this.targetDifference)

                if (calculateSpeed < this.min)
                    calculateSpeed = this.min

                return calculateSpeed
            }
        },

        methods: {

            updateRail (event) {

                if (!this.sliding)
                    return

                let railOffset = event.offsetX + this.$refs.container.offsetLeft

                console.log(event)

                this.targetDifference = ((((railOffset - this.$refs.container.offsetLeft) / this.$refs.container.offsetWidth)).toFixed(2))

                this.$emit('change', this.calculatedSpeed)
            },

            startSlide (event) {

                this.sliding = true
                this.updateRail(event)
            },

            stopSlide (event) {

                this.sliding = false
            },
        },

    }
</script>


<style lang="stylus">
    @import '~styles/config/variables.styl'

    .speed-slider__container
        display flex
        align-items center

    .speed-slider
        width 50px
        height 25px
        position relative
        display inline-block
        display flex
        align-items center

    .speed-slider__container--half-width .speed-slider
        width 50%

    .speed-slider:hover
        cursor e-resize

    .speed-slider__fake-rail
        height 5px
        background rgba(0,0,0,.8)
        position relative
        width 100%
        z-index 1

    .speed-slider__container--alt .speed-slider__fake-rail
        background $mainThemeColor

    .speed-slider__rail
        width 0%
        border-right 3px solid #FFF
        top 3px
        bottom 3px
        position absolute
        z-index 2

    .speed-slider__container--alt .speed-slider__rail
        border-right-color $bodyTextPrimaryColor

    .speed-slider__info
        display inline-block
        margin-left 5px
        color #FFF
        font-size 13px
        font-weight 700
        width 23px
        user-select none
        pointer-events none

    .speed-slider__container--alt .speed-slider__info
        color $bodyTextPrimaryColor

</style>
