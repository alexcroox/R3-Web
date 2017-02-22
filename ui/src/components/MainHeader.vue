<template>
    <header>
        <h1>
            <router-link to="/" class="header__logo-link">{{ unitName }}</router-link>
        </h1>

        <div class="header__list">
            <router-link to="/stats" class="header__list__item">
                <i class="fa fa-area-chart" aria-hidden="true"></i>
                Stats
            </router-link>
        </div>
    </header>
</template>

<script>
    export default {
        props: ['unitName']
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    header
        background $navBackgroundColor
        padding 0 $sidePadding
        line-height 21px
        display flex

    .header__logo-link
        color #FFF
        font-weight bold
        font-size 20px
        float left
        display block
        line-height 50px

    .header__list
        text-align right
        margin-left auto

    .header__list__item
        display inline-block
        margin-left 30px
        color #FFF
        font-weight 500
        line-height 50px

    .header__list__item:hover
        opacity 0.7

    .header__list__item .fa
        margin-right 5px
</style>
