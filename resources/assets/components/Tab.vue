<template>
    <div class="tab__container">
        <router-link
            v-for="item in tabs"
            :to="{ name: item.route }"
            :exact="item.exact"
            class="tab__item"
            active-class="tab__item--active">

            <i v-if="item.icon" :class="['fa', 'tab__item__icon', faIcon(item.icon)]" aria-hidden="true"></i>

            {{ item.text }}

        </router-link>
    </div>
</template>

<script>
    export default {
        props: ['tabs'],

        methods: {

            faIcon (icon) {
                return `fa-${icon}`
            }
        },
    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'

    .tab__container
        border-bottom 1px solid #E7EFF0
        padding 20px $sidePadding 0

        @media (max-width $mobileBreakPoint)
            padding-left $sidePaddingMobile
            padding-right $sidePaddingMobile

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

    .tab__item__icon
        margin-right 5px
</style>
