<template>
    <div class="map-box">
        <slot></slot>
    </div>
</template>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    .map-box
        overflow hidden
        position absolute
        background rgba(0,0,0,.5)
        z-index 2
</style>
