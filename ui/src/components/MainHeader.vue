<template>
    <header>
        <h1>{{ unitName }}</h1>

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
        data: () => {
            return {
                unitName: "Unit Mission List"
            }
        }
    }
</script>

<style lang="stylus">
    header
        background $navBackgroundColor
        padding 0 $sidePadding
        line-height 21px

    .header__list
        float right
        text-align right

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
