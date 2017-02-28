<template>
    <div class="container">
        <slot></slot>
    </div>
</template>

<style lang="stylus">
    @import '~styles/index.styl'

    .container
        padding 0 $sidePadding

    .container--box
        background #FFF
        padding $sidePadding
        margin $sidePadding

    .container--center
        margin 60px auto
        max-width 600px
</style>
