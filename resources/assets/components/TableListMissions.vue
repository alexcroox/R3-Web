<template>
    <table class="table-list">
        <thead>
            <tr>
                <th v-for="key in columns" @click="sortBy(key)" :class="{ 'table-list__header-item__sort--asc': sortOrders[key] > 0, 'table-list__header-item__sort--desc': sortOrders[key] < 1  }" class="table-list__header-item">
                    {{ key | capitalize }}
                </th>
            </tr>
        </thead>

        <tbody class="table-list__data">

            <tr v-if="filteredData.length > 0" v-for="entry in filteredData" :class="{ 'table-list__row--in-progress': inProgress(entry)}" class="table-list__row">

                <td v-for="key in columns" :class="{ 'table-list__item--bold': key == 'mission' }" class="table-list__item">

                    <span v-if="inProgress(entry, key)" class="table-list__item__progress">
                        <img width="11" class="table-list__item__progress__icon" src="https://r3icons.titanmods.xyz/iconMan-civilian-trim.png">
                        In progress
                    </span>
                    <span v-else class="table-list__item__text">
                        {{ entry[key] }}
                    </span>

                </td>

            </tr>

            <tr v-if="filteredData.length == 0" v-for="n in 10"  class="table-list__row table-list__row--empty">
                <td :colspan="columns.length" class="table-list__item table-list__item--loading">Loading...</td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    import TableList from 'components/TableList.vue'

    import _each from 'lodash.foreach'

    export default {

        components: {
            TableList
        },

        props: {
            data: Array,
            columns: Array,
            filterKey: String
        },

        data () {

            var sortOrders = {}
                this.columns.forEach(function (key) {
                sortOrders[key] = 1
            })

            return {
                sortKey: '',
                sortOrders: sortOrders
            }
        },

        computed: {

            filteredData () {

                var sortKey = this.sortKey
                var filterKey = this.filterKey && this.filterKey.toLowerCase()

                var order = this.sortOrders[sortKey] || 1
                var data = this.data

                // Custom sort keys based on consistent data not display data
                if(sortKey == 'played')
                    sortKey = 'created_at'

                if(sortKey == 'length')
                    sortKey = 'length_in_minutes'

                // Searching?
                if (filterKey) {
                    data = data.filter(function(row) {
                        return Object.keys(row).some(function(key) {
                            return String(row[key]).toLowerCase().indexOf(filterKey) > -1
                        })
                    })
                }

                // Ordering columns
                if (sortKey) {
                    data = data.slice().sort(function(a, b) {
                        a = a[sortKey]
                        b = b[sortKey]
                        return (a === b ? 0 : a > b ? 1 : -1) * order
                    })
                }

                return data
            },
        },

        filters: {

            capitalize: function(str) {
                return str.charAt(0).toUpperCase() + str.slice(1)
            }
        },

        methods: {

            sortBy: function(key) {
                this.sortKey = key
                this.sortOrders[key] = this.sortOrders[key] * -1
            },

            inProgress (entry, key) {
                return (entry.in_progress_block && (key == "length" || !key))? true : false
            },
        },
    }
</script>

<style lang="stylus">

    .table-list__item__progress__icon
        margin-right 10px
        display inline-block
        animation tableListSpin 3s infinite linear
        transform-origin 50% 70%

    .table-list__row:hover
        cursor pointer

    .table-list__row--empty:hover
        cursor default

    .table-list__row--in-progress:hover
        cursor not-allowed
</style>
