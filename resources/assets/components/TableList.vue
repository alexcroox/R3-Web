<template>
    <div>
        <slot></slot>
    </div>
</template>

<style lang="stylus">

    @import '~styles/index.styl'

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

    .table-list__header-item__sort--asc:hover
        cursor n-resize

    .table-list__header-item__sort--desc:hover
        cursor s-resize

    .table-list__row
        background #FFF
        margin-top 10px

    .table-list__item
        padding 20px 30px
        font-size 14px
        font-weight 400
        color $linkPrimaryColor

    .table-list__item--bold
        font-weight 500
        font-size 17px

    .table-list__item--loading
        color #FFF

    @keyframes tableListSpin
        0%
            transform rotate(0deg)

        100%
            transform rotate(360deg)

</style>
