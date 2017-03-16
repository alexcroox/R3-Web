<template>
    <div>
        <slot></slot>
    </div>
</template>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    .table-list
        text-align left
        margin-top 30px
        border-spacing 0 10px
        border-collapse collapse
        width 100%

    .table-list__header-item
        text-transform uppercase
        color #ABB4BA
        font-weight 500
        font-size 14px
        padding 0 30px 5px
        margin-top 5px

        @media (max-width $mobileBreakPoint)
            display none

    .table-list__header-item__sort--asc:hover
        cursor n-resize

    .table-list__header-item__sort--desc:hover
        cursor s-resize

    .table-list__row
        background #FFF
        margin-top 10px
        border-top 10px solid $backgroundPrimaryColor

        @media (max-width $mobileBreakPoint)
            display block
            margin-bottom 20px
            border 1px solid $borderPrimaryColor

    .table-list__item
        padding 20px 30px
        font-size 14px
        font-weight 400
        color $linkPrimaryColor

        @media (max-width $mobileBreakPoint)
            display block

    .table-list__item[data-title]
        position relative

        @media (max-width $mobileBreakPoint)
            border-bottom 1px solid $borderPrimaryColor

            &:not(.table-list__item--responsive-header):before
                content attr(data-title)
                float left
                margin-right 20px
                text-transform uppercase
                color #ABB4BA
                font-weight 500
                font-size 14px

    .table-list__item--loading
        color #FFF

    .table-list__item--bold
        font-weight 500
        font-size 17px

    @keyframes tableListSpin
        0%
            transform rotate(0deg)

        100%
            transform rotate(360deg)

</style>
