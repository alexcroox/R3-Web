<template>
    <div class="fullscreen-loader">

        <div class="fullscreen-loader__content">
            <h1 class="fullscreen-loader__title">{{ title }}</h1>
            <p v-if="title != ''" class="fullscreen-loader__sub-title">{{ subTitle }}</p>

            <loader></loader>

            <p class="fullscreen-loader__text">{{ text }}</p>
        </div>

    </div>
</template>

<script>
    import Loader from 'components/Loader.vue'

    export default {

        props: ['text', 'title', 'subTitle'],

        components: {
            Loader,
        },
    }
</script>

<style lang="stylus">

    .fullscreen-loader
        position fixed
        top 0
        right 0
        bottom 0
        left 0
        background rgba(0,0,0,.8)
        display flex
        align-items center
        justify-content center
        text-align center
        z-index 50

    .fullscreen-loader__title
        display block
        font-size 30px
        color #FFF
        letter-spacing 0.05em

    .fullscreen-loader__sub-title
        text-transform uppercase
        margin-bottom 70px
        margin-top 10px
        font-weight 500
        color #AAA

    .fullscreen-loader__text
        color #fff
        margin-top 5px
        letter-spacing 3px
        font-size 12px
        font-weight 500
        text-transform uppercase
</style>
