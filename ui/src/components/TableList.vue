<template>
    <table class="table-list">
        <thead>
            <tr>
                <th v-for="item in headers" class="table-list__sort table-list__header-item" :class="['table-list__item__' + item.dataKey]">
                    {{ item.label }}
                </th>
            </tr>
        </thead>

        <tbody class="list">
            <tr v-for="item in data" class="table-list__row">
                <td v-for="value in item" class="table-list__item">
                    {{ value }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    export default {

        props: ['data', 'headers'],

        computed: {

            filteredData () {


                return 'test'
            }
        }
    }
</script>

<style lang="stylus">

    .table-list
        text-align left
        margin-top 30px
        border-spacing 0 10px
        border-collapse separate
        width 100%

    .table-list__header-item
        text-transform uppercase
        color #ABB4BA
        font-weight 500
        font-size 14px
        padding 0 30px 5px

    .table-list__row
        background #FFF
        margin-top 10px

    .table-list__item
        padding 20px 30px
        font-size 14px
        font-weight 400

    .table-list__item--bold
        font-weight 500
        font-size 17px

    .table-list__item--loading
        margin-right 10px
        display inline-block
        animation tableListSpin 3s infinite linear
        transform-origin 50% 70%

    @keyframes tableListSpin
        0%
            transform rotate(0deg)

        100%
            transform rotate(360deg)

</style>
