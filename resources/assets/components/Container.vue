<template>
    <div
        class="container"
        :class="{
            'container--box': box,
        } ">

        <slot></slot>
    </div>
</template>

<script>
    export default {

        props: ['box', 'child'],

    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    .container
        padding 0 $sidePadding

        @media (max-width $mobileBreakPoint)
            padding-left $sidePaddingMobile
            padding-right $sidePaddingMobile

    .container--box
        background #FFF
        padding 50px $sidePadding
        margin-left $sidePadding
        margin-right sidePadding

        @media (max-width $mobileBreakPoint)
            padding $sidePaddingMobile

    .container--center
        margin 60px auto
        max-width 600px
</style>
