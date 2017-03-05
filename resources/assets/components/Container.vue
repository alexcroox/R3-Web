<template>
    <div class="container">
        <slot></slot>
    </div>
</template>

<style lang="stylus">
    @import '~styles/index.styl'

    .container
        padding 0 $sidePadding

        @media (max-width $mobileBreakPoint)
            padding-left $sidePaddingMobile
            padding-right $sidePaddingMobile

    .container--box
        background #FFF
        padding $sidePadding
        margin $sidePadding

        @media (max-width $mobileBreakPoint)
            padding $sidePaddingMobile

    .container--center
        margin 60px auto
        max-width 600px
</style>
