<template>
    <div class="speed-slider__container">
        <div
            class="speed-slider"
            ref="container"
            @mousedown="startSlide" @touchstart="startSlide"
            @mousemove="updateRail" @touchmove="updateRail"
            @mouseup="stopSlide" @touchend="stopSlide">

                <div class="speed-slider__rail" :style="percentageWidth"></div>

        </div>

        <div class="speed-slider__info">{{ displaySpeed }}</div>
    </div>
</template>

<script>

    export default {

        props: ['speed', 'min', 'max'],

        data () {
            return {
                targetDifference: 0,
                sliding: false
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

            displaySpeed () {

                let calculatedSpeed = Math.round((this.max - this.min) * this.targetDifference)

                if (calculatedSpeed < this.min)
                    calculatedSpeed = this.min

                this.$emit('change', calculatedSpeed)

                return `${calculatedSpeed}x`
            }
        },

        methods: {

            updateRail (event) {

                if (!this.sliding)
                    return

                let railOffset = event.offsetX + this.$refs.container.offsetLeft

                this.targetDifference = ((((railOffset - this.$refs.container.offsetLeft) / this.$refs.container.offsetWidth)).toFixed(2))
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

    .speed-slider__container
        display flex
        align-items center

    .speed-slider
        width 50px
        height 5px
        background #000
        position relative
        display inline-block
        display flex
        align-items center

    .speed-slider:hover
        cursor e-resize

    .speed-slider__rail
        width 0%
        border-right 3px solid #FFF
        top -3px
        bottom -3px
        position absolute
        z-index 2

    .speed-slider__info
        display inline-block
        margin-left 5px
        color #FFF
        font-size 13px
        font-weight 700
        width 23px
        user-select none
        pointer-events none

</style>
