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
            <tr v-if="filteredData.length > 0" v-for="entry in filteredData" class="table-list__row">
                <td v-for="key in columns" class="table-list__item">
                    {{ entry[key] }}
                </td>
            </tr>
            <tr v-if="filteredData.length == 0" v-for="n in 10"  class="table-list__row">
                <td :colspan="columns.length" class="table-list__item table-list__item--loading">Loading...</td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    import _each from 'lodash.foreach'

    export default {

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

          filteredData: function() {

              var sortKey = this.sortKey
              var filterKey = this.filterKey && this.filterKey.toLowerCase()
              console.log('filterKey', filterKey);
              var order = this.sortOrders[sortKey] || 1
              var data = this.data
              if (filterKey) {
                  data = data.filter(function(row) {
                      return Object.keys(row).some(function(key) {
                          return String(row[key]).toLowerCase().indexOf(filterKey) > -1
                      })
                  })
              }
              if (sortKey) {
                  data = data.slice().sort(function(a, b) {
                      a = a[sortKey]
                      b = b[sortKey]
                      return (a === b ? 0 : a > b ? 1 : -1) * order
                  })
              }

              console.log('fd', data);
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
            }
        },

        watch: {

            data () {

                console.log('re-indexing list')
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
