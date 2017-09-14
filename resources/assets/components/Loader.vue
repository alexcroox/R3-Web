<template>
    <span
        class="loading-icon"
        :class="{'loading-icon--inline': inline}">
    </span>
</template>

<script>
    export default {
        props: ['inline']
    }
</script>

<style lang="stylus">

    .loading-icon
        width 17px
        height 26px
        background url('~images/map/loading-icon.png') no-repeat center center
        display inline-block
        animation fullscreenLoaderIconMotion 5s cubic-bezier(0.770,  0.000, 0.175, 1.000) infinite

    .loading-icon--inline
        padding-left 50px

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
