<template>
    <div>
        <header>
            <h1>
                <router-link :to="{ name: 'missions.list' }" class="header__logo-link">{{ title }}</router-link>
            </h1>

            <div class="header__list">
                <router-link :to="{ name: 'stats' }" class="header__list__item">
                    <i class="fa fa-area-chart" aria-hidden="true"></i>
                    Stats
                </router-link>

                <router-link :to="{ name: 'admin' }" class="header__list__item">
                    <i class="fa fa-lock" aria-hidden="true"></i>
                    Admin
                </router-link>

                <button class="header__list__item js-help" @click="showHelpModal">
                    <i class="fa fa-question-circle" aria-hidden="true"></i>
                    Help
                </button>
            </div>
        </header>

        <help-modal></help-modal>
    </div>
</template>

<script>
    import 'font-awesome/css/font-awesome.css'

    import HelpModal from 'views/modals/HelpModal.vue'
    import bus from 'eventBus'

    export default {
        props: ['title'],

        components: {
            HelpModal
        },

        methods: {
            showHelpModal () {
                bus.$emit('showHelpModal')
            }
        }
    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'

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
        cursor pointer

    .header__list__item .fa
        margin-right 5px
</style>
