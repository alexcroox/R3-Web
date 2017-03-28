<template>
    <div id="slider__rail"></div>
</template>


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

    .slider__handle--left-time
        text-indent -58px
        color #000

    .slider__time
        user-select none
        pointer-events none

    .slider__origin
        position absolute
        right 0
        top 0
        left 0
        bottom 0
        background #030303

    .slider__target
        display inline-block
        transform translateZ(0)
        background rgba(0,0,0,.8)
        height 18px
        flex-grow 1

    .slider__connect
        background #FFF
</style>
