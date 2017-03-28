<template>
    <div
        class="speed-slider"
        @mousedown="updateRail" @touchstart="updateRail"
        @mousemove="updateRail" @touchmove="updateRail"
        @mouseup="updateRail" @touchend="updateRail" @mouseleave="updateRail"
    >
        <div class="speed-slider__rail" ref="rail"></div>
    </div>
</template>

<script>

    export default {

        props: ['speed'],

        methods: {

            updateRail (event) {

                console.log(event)

                let percentage = ((((event.clientX - this.$refs.container.offsetLeft) / this.$refs.container.offsetWidth)).toFixed(2))

                this.$refs.rail.style.width = (percentage * 100) + '%'

                console.log('Speed: value', (percentage * 100))
            },

            startSlide (event) {

                this.updateRail(event)
            },

            stopSlide (event) {

                this.updateRail(event)
            },
        },

    }
</script>


<style lang="stylus">

    .speed-slider
        position absolute
        left 35px
        top 8px
        width 100px
        height 25px
        background #000
        position relative

    .speed-slider__rail
        width 0%
        height 100%
        background-color #FFF
        top 0px
        left 0px
        position absolute
        cursor pointer
</style>
