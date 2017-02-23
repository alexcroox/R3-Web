<template>
    <div class="tab__container">
        <router-link v-for="item in tabs" :to="{ name: item.route }" class="tab__item" active-class="tab__item--active">
            {{ item.text }}
        </router-link>
    </div>
</template>

<script>
    export default {
        props: ['tabs']
    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'

    .tab__container
        border-bottom 1px solid #E7EFF0
        padding 20px $sidePadding 0

    .tab__item
        display inline-block
        padding 15px 0
        margin-right 30px
        header()
        color #A4AEB5
        position relative

    .tab__item:hover
        color #556069

    .tab__item--active
        color #556069

    .tab__item--active:after
        content ''
        background #41B7D9
        height 3px
        position absolute
        bottom 0
        left 0
        right 0
</style>
