<template>
    <div class="map-box" :class="{ 'map-box--hidden': hidden }">
        <slot></slot>
    </div>
</template>

<script>

    export default {

        props: ['hidden'],
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    .map-box
        overflow hidden
        position absolute
        background rgba(0,0,0,.5)
        z-index 2

    .map-box--hidden
        visibility hidden
</style>
