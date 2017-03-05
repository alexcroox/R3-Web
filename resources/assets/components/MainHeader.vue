<template>
    <div>
        <header>
            <h1>
                <router-link :to="{ name: 'missions.list' }" class="header__logo-link">{{ title }}</router-link>
            </h1>

            <div class="header__list">
                <router-link :to="{ name: 'stats.summary' }" class="header__list__item">
                    <i class="fa fa-area-chart" aria-hidden="true"></i>
                    {{ ucfirst($t('stats')) }}
                </router-link>

                <router-link :to="{ name: 'admin' }" class="header__list__item">
                    <i class="fa fa-lock" aria-hidden="true"></i>
                    {{ ucfirst($t('admin')) }}
                </router-link>

                <button class="header__list__item js-help" @click="showHelpModal">
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
            <router-link :to="{ name: 'stats.summary' }" class="header__list__item">
                <i class="fa fa-area-chart" aria-hidden="true"></i>
                {{ ucfirst($t('stats')) }}
            </router-link>

            <router-link :to="{ name: 'admin' }" class="header__list__item">
                <i class="fa fa-lock" aria-hidden="true"></i>
                {{ ucfirst($t('admin')) }}
            </router-link>

            <button class="header__list__item js-help" @click="showHelpModal">
                <i class="fa fa-question-circle" aria-hidden="true"></i>
                {{ ucfirst($t('help')) }}
            </button>
        </div>

        <help-modal></help-modal>
    </div>
</template>

<script>
    import 'font-awesome/css/font-awesome.css'
    import { ucfirst } from 'filters'

    import HelpModal from 'views/modals/HelpModal.vue'
    import bus from 'eventBus'

    export default {
        props: ['title'],

        data () {

            return {
                mobileMenuOpen: false
            }
        },

        components: {
            HelpModal
        },

        methods: {
            showHelpModal () {
                bus.$emit('showHelpModal')
            },
            ucfirst,
        },
    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'

    header
        background $navBackgroundColor
        padding 0 $sidePadding
        line-height 21px
        display flex

        @media (max-width $mobileBreakPoint)
            padding 0 $sidePaddingMobile

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
        margin-left 30px
        color #FFF
        font-weight 500
        line-height 50px

    .header__list__item:hover
        opacity 0.7
        cursor pointer

    .header__list__item .fa
        margin-right 5px

    .header__mobile__menu
        position fixed
        top 0
        right 0
        bottom 0
        left 0
        transition all 0.2s
</style>
