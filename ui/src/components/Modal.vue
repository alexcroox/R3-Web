<template>
    <div class="modal" :class="{ 'modal--show': show }">
        <div class="modal__mask"></div>

        <div class="modal__content">
            <button class="modal__close" @click="$emit('close')">
                <i class="fa fa-times"></i>
            </button>

            <slot></slot>
        </div>
    </div>
</template>

<script>
    import bus from 'eventBus'

    export default {

        props: ['show']

    }
</script>

<style lang="stylus">
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

    .modal--show
        display block

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
        z-index 1

    .modal__content
        position fixed
        z-index 2
        top 50%
        left 50%
        min-width 295px
        transform translateX(-50%) translateY(-50%) scale(0.7)
        background #F2F7F8
        border-radius 4px
        padding 40px 40px
        max-height 90%
        overflow-y auto
        overflow-x hidden
        opacity 0
        transition all 0.3s

        h3
            header()
            font-weight 700

        p
            margin-top 10px

    .modal--show .modal__content
        transform translateX(-50%) translateY(-50%) scale(1)
        opacity 1

    .modal__close
        position absolute
        top 10px
        right 15px
        font-size 21px
        line-height 21px
        color #6b6b6b

</style>
