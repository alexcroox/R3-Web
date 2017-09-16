<template>
    <div :class="[{ 'header--fixed': fixed }, { 'header--wide': wide }]">
        <header>
            <h1>
                <router-link :to="{ name: 'missions.list' }" class="header__logo-link">{{ title }}</router-link>
            </h1>

            <div class="header__list">
                <router-link :to="{ name: 'missions.list' }" class="header__list__item" active-class="header__list__item--active">
                    <i class="fa fa-list" aria-hidden="true"></i>
                    {{ ucfirst($t('missions')) }}
                </router-link>

                <router-link :to="{ name: 'stats.summary' }" class="header__list__item" active-class="header__list__item--active">
                    <i class="fa fa-area-chart" aria-hidden="true"></i>
                    {{ ucfirst($t('stats')) }}
                </router-link>

                <router-link :to="{ name: 'admin' }" class="header__list__item" active-class="header__list__item--active">
                    <i class="fa fa-lock" aria-hidden="true"></i>
                    {{ ucfirst($t('admin')) }}
                </router-link>

                <button class="header__list__item" @click="showPreferencesModal">
                    <i class="fa fa-cog" aria-hidden="true"></i>
                    {{ ucfirst($t('preferences')) }}
                </button>

                <button class="header__list__item" @click="showHelpModal">
                    <i class="fa fa-question-circle" aria-hidden="true"></i>
                    {{ ucfirst($t('help')) }}
                </button>
            </div>

            <button class="header__mobile__toggle" @click="mobileMenuOpen = !mobileMenuOpen">
                <i class="fa fa-bars header__mobile__toggle__icon" aria-hidden="true"></i>
                {{ ucfirst($t('menu')) }}
            </button>
        </header>

        <div v-if="mobileMenuOpen" class="header__mobile__menu">
            <button class="header__mobile__toggle header__mobile__toggle--close" @click="mobileMenuOpen = !mobileMenuOpen">
                <i class="fa fa-fw fa-times" aria-hidden="true"></i>
                {{ ucfirst($t('close')) }}
            </button>

            <router-link :to="{ name: 'missions.list' }" class="header__list__item" active-class="header__list__item--active">
                <i class="fa fa-fw fa-list" aria-hidden="true"></i>
                {{ ucfirst($t('missions')) }}
            </router-link>

            <router-link :to="{ name: 'stats.summary' }" class="header__list__item" active-class="header__list__item--active">
                <i class="fa fa-fw fa-area-chart" aria-hidden="true"></i>
                {{ ucfirst($t('stats')) }}
            </router-link>

            <router-link :to="{ name: 'admin' }" class="header__list__item" active-class="header__list__item--active">
                <i class="fa fa-fw fa-lock" aria-hidden="true"></i>
                {{ ucfirst($t('admin')) }}
            </router-link>

            <button class="header__list__item" @click="showPreferencesModal">
                <i class="fa fa-fw fa-cog" aria-hidden="true"></i>
                {{ ucfirst($t('preferences')) }}
            </button>

            <button class="header__list__item" @click="showHelpModal">
                <i class="fa fa-fw fa-question-circle" aria-hidden="true"></i>
                {{ ucfirst($t('help')) }}
            </button>
        </div>

        <div v-if="mobileMenuOpen" @click="mobileMenuOpen = !mobileMenuOpen" class="header__mobile__menu__mask"></div>

        <help-modal></help-modal>
        <preferences-modal></preferences-modal>
    </div>
</template>

<script>
    import { ucfirst } from 'filters'

    import HelpModal from 'views/modals/HelpModal.vue'
    import PreferencesModal from 'views/modals/PreferencesModal.vue'
    import bus from 'eventBus'

    export default {

        components: {
            HelpModal,
            PreferencesModal
        },

        props: ['title', 'fixed', 'wide'],

        data () {

            return {
                mobileMenuOpen: false
            }
        },

        methods: {

            showHelpModal () {
                bus.$emit('showHelpModal')
            },

            showPreferencesModal () {
                bus.$emit('showPreferencesModal')
            },

            ucfirst,
        },
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    header
        background $navBackgroundColor
        padding 0 $sidePadding
        line-height 21px
        display flex

        @media (max-width $mobileBreakPoint)
            padding 0 $sidePaddingMobile

    .header--fixed
        position absolute
        top 0
        left 0
        right 0
        z-index 3

    .header--wide header
        padding-left 20px
        padding-right 20px

    .header__logo-link
        color #FFF
        font-weight bold
        font-size 20px
        float left
        display block
        line-height 50px

    .header__mobile__toggle
        text-align right
        margin-left auto
        display none
        color #FFF
        font-weight 500

        @media (max-width $mobileBreakPoint)
            display block

    .header__mobile__toggle__icon
        margin-right 5px

    .header__list
        text-align right
        margin-left auto

        @media (max-width $mobileBreakPoint)
            display none

    .header__list__item
        display inline-block
        padding-left 30px
        color #FFF
        font-weight 500
        line-height 50px

    .header__list__item:hover
        opacity 0.7
        cursor pointer

    .header__list__item--active
        font-weight 700

    .header__list__item .fa
        margin-right 5px

    .header__mobile__menu
        position fixed
        top 0
        right 0
        bottom 0
        width 100%
        max-width 330px
        transition all 0.2s
        background #F4F8F9
        border-left 1px solid $borderPrimaryColor
        box-shadow 0px 0px 6px rgba(0,0,0,0.2)
        z-index 3

    .header__mobile__menu__mask
        position fixed
        top 0
        right 0
        bottom 0
        left 0
        background rgba(0,0,0,0.8)
        z-index 2

    .header__mobile__menu .header__list__item
        display block
        font-size 18px
        color $bodyTextSecondaryColor

    .header__mobile__menu .header__list__item--active
        background $borderPrimaryColor
        opacity 0.6

    .header__mobile__menu .header__mobile__toggle--close
        text-align left
        display block
        color #FFF
        font-size 18px
        background $mainThemeColor
        margin-left 0
        width 100%
        padding 14px 30px 15px 30px
        position relative
        margin-bottom 10px

    // Fix for 1px white line, ugh
    .header__mobile__menu .header__mobile__toggle--close:after
        content ''
        position absolute
        left -1px
        top 0
        bottom 0
        width 1px
        background $mainThemeColor
</style>
