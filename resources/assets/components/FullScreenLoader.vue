<template>
    <div class="fullscreen-loader">

        <div class="fullscreen-loader__content">
            <span class="fullscreen-loader__icon"></span>

            <p class="fullscreen-loader__text">{{ text }}</p>
        </div>

    </div>
</template>

<script>
    export default {

        props: ['text'],

        watch: {

            text () {

            }
        }
    }
</script>

<style lang="stylus">

    .fullscreen-loader
        position fixed
        top 0
        right 0
        bottom 0
        left 0
        background rgba(0,0,0,.8)
        display flex
        align-items center
        justify-content center
        text-align center
        z-index 50

    .fullscreen-loader__icon
        width 17px
        height 26px
        background url('~images/map/loading-icon.png') no-repeat center center
        display inline-block
        animation fullscreenLoaderIconMotion 5s cubic-bezier(0.770,  0.000, 0.175, 1.000) infinite

    .fullscreen-loader__text
        color #fff
        margin-top 5px
        letter-spacing 3px
        font-size 12px
        font-weight 500
        text-transform uppercase

    @keyframes fullscreenLoaderIconMotion
        0%
            transform translateX(0) scale(1) rotate(85deg)
        8%
            transform translateX(0) scale(1) rotate(0deg)
        16%
            transform translateX(0) scale(1) rotate(85deg)

        24%
            transform translateX(50px) scale(0.3) rotate(85deg)
        32%
            transform translateX(50px) scale(0.3) rotate(0deg)
        40%
            transform translateX(50px) scale(0.3) rotate(-85deg)

        48%
            transform translateX(0) scale(1) rotate(-85deg)
        56%
            transform translateX(0) scale(1) rotate(85deg)
        64%
            transform translateX(0) scale(1) rotate(-85deg)

        72%
            transform translateX(-50px) scale(0.3) rotate(-85deg)
        80%
            transform translateX(-50px) scale(0.3) rotate(0deg)
        88%
            transform translateX(-50px) scale(0.3) rotate(85deg)
        100%
            transform translateX(0) scale(1) rotate(85deg)
</style>
