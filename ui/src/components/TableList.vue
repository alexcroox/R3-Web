<template>
    <table class="table-list" :id="listId">
        <thead>
            <tr>
                <th v-for="item in headers" class="table-list__sort table-list__header-item">
                    {{ item.label }}
                </th>
            </tr>
        </thead>

        <tbody class="table-list__data">
            <tr v-for="item in data" class="table-list__row">
                <td v-for="v in item" :data-value="v.value" :class="['table-list__item', 'table-list__item__' + v.dataKey]">
                    {{ v.display }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    import List from 'list.js'

    import _each from 'lodash.foreach'

    export default {

        props: ['data', 'headers', 'id'],

        data () {
            return {
                list: null
            }
        },

        mounted () {

            console.log('Setting up list')

            let valueNames = []

            _each(this.headers, (header) => {
                valueNames.push(`table-list__item__${header.dataKey}`)
            })

            this.list = new List(this.listId, {
                valueNames,
                sortClass: 'table-list__sort',
                listClass: 'table-list__data',
                fuzzySearch: {
                    searchClass: 'table-list__search',
                    location: 0,
                    distance: 100,
                    threshold: 0.4,
                    multiSearch: true
                }
            })
        },

        computed: {

            listId () {
                return `table-list-${this.id}`
            }
        },

        watch: {

            data () {

                console.log('re-indexing list')

                this.list.reIndex()
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
