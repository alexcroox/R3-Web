<template>
    <div class="modal" :class="[{ 'modal--show': show }, `modal--${width}`]">
        <div class="modal__mask"></div>

        <div class="modal__content">

            <div class="modal__header">

                <h1><slot name="header"></slot></h1>

                <button class="modal__close" @click="$emit('close')">
                    <i class="fa fa-times"></i>
                </button>

            </div>

            <div class="modal__body">
                <slot name="body"></slot>
            </div>

        </div>
    </div>
</template>

<script>
    export default {

        props: {
            show: Boolean,
            width: {
                type: String,
                default: 'normal'
            }
        },

    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'

    $modalBorderRaduis = 4px
    $modalWidthNormal = 800px

    .modal
        position fixed
        z-index 9999
        display none
        top 0
        left 0
        right 0
        bottom 0
        width 100%
        height 100%
        visibility hidden
        backface-visibility hidden
        display flex
        align-items center
        justify-content center
        text-align center

    .modal--show
        visibility visible

    .modal__mask
        position fixed
        top 0
        left 0
        right 0
        bottom 0
        background rgba(0,0,0,.7)
        width 100%
        height 100%
        transition all 0.3s
        visibility hidden
        opacity 0
        z-index 1

    .modal--show .modal__mask
        opacity 1
        visibility visible

    .modal__content
        z-index 2
        min-width 295px
        max-height 90%
        border-radius $modalBorderRaduis
        overflow-y auto
        overflow-x hidden
        text-align left
        opacity 0
        transform scale(0.7)
        transition all 0.3s

        @media (max-width 1000px)
            min-width 70%

        @media (max-width 700px)
            min-width 90%

    .modal--show .modal__content
        opacity 1
        transform scale(1)

    .modal--normal .modal__content
        max-width $modalWidthNormal

    .modal__header
        padding 17px 40px
        background $navBackgroundColor
        color #FFF
        border-radius $modalBorderRaduis $modalBorderRaduis 0 0
        position relative
        display flex
        align-items center

    .modal__header h1
        color #FFF
        font-size 21px

    .modal__body
        padding 20px 40px 40px 40px
        border-radius 0 0 $modalBorderRaduis $modalBorderRaduis
        background $backgroundPrimaryColor

    .modal__body h3
        header()
        font-weight 700

    .modal__close
        position absolute
        right 40px
        font-size 21px
        line-height 21px
        color #FFF

    .modal__close:hover
        cursor pointer

</style>
