<template>
    <div>
        <table class="table-list">
            <thead>
                <tr>
                    <th
                        v-for="key in columns"
                        @click="sortBy(key)"
                        :class="{
                            'table-list__header-item__sort--asc': sortOrders[key] > 0,
                            'table-list__header-item__sort--desc': sortOrders[key] < 1
                        }"
                        class="table-list__header-item">

                        {{ $t(key) | capitalize | splitWord }}

                    </th>
                </tr>
            </thead>

            <tbody class="table-list__data">

                <tr
                    v-if="filteredData.length > 0"
                    v-for="entry in filteredData"
                    class="table-list__row">

                    <td
                        v-for="key in columns"
                        :class="{ 'table-list__item--responsive-header': key == columns[0] }"
                        class="table-list__item"
                        :data-title="ucfirst(key)">

                        <span class="table-list__item__text">
                            {{ entry[key] }}
                        </span>

                    </td>

                </tr>

                <tr v-if="waitingForData" v-for="n in 10"  class="table-list__row table-list__row--empty">
                    <td :colspan="columns.length" class="table-list__item table-list__item--loading">L</td>
                </tr>
            </tbody>
        </table>

        <feedback
            v-if="noData"
            type="information"
            class="margin__top--medium">
            <span slot="message" v-html="noDataMessage"></span>
        </feedback>
    </div>
</template>

<script>
    import TableList from 'components/TableList.vue'
    import Feedback from 'components/Feedback.vue'

    import router from 'routes'
    import { ucfirst } from 'filters'

    import _each from 'lodash.foreach'

    export default {

        components: {
            TableList,
            Feedback
        },

        props: {
            data: Array,
            columns: Array,
            filterKey: String,
            noData: Boolean,
            noDataMessage: String
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

        methods: {

            sortBy (key) {
                this.sortKey = key
                this.sortOrders[key] = this.sortOrders[key] * -1
            },
            ucfirst,

        },

        computed: {

            waitingForData () {

                return this.filteredData.length == 0 && !this.noData
            },

            filteredData () {

                var sortKey = this.sortKey
                var filterKey = this.filterKey && this.filterKey.toLowerCase()

                var order = this.sortOrders[sortKey] || 1
                var data = this.data

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

            capitalize (str) {
                return str.charAt(0).toUpperCase() + str.slice(1)
            },

            splitWord (str) {

                return str.replace('-', ' ')
            },
        },
    }
</script>
