<template>
    <div class="stat">
        <span class="stat__label">{{ label }}</span>
        <span class="stat__value">{{ value }}</span>
    </div>
</template>

<script>
    export default {

        props: ['label', 'value'],
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    .stat
        border 1px solid #CCC
        padding 30px 20px
</style>
