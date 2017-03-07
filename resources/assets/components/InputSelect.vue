<template>
    <BasicSelect
        class="input-select"
        :options="options"
        :selected-option="value"
        :searchable="searchable"
        :placeholder="placeholder"
        @select="onSelect">
    </BasicSelect>
</template>

<script>
    import { BasicSelect } from 'vue-search-select'
    //import vSelect from 'vue-select'

    export default {

        components: {
            //vSelect
            BasicSelect
        },

        props: ['options', 'value', 'placeholder', 'searchable', 'multiple', 'inline', 'short'],

        data () {
            return {
                selected: null
            }
        },

        mounted () {
            console.log('Default select value', this.value)
        },

        methods: {

            onSelect (val) {
                console.log('select changed', val)
                this.$emit('changed', val)
            }
        },
    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'

    .input-select
        buttonLabelsMetaContent()
        border none
        background #f4f8f9
        border-radius $borderRadiusSmall
        width 100%
        padding 14px 20px 15px
        font-weight 400
        position relative
        display inline-block
        vertical-align middle
        width auto

    .input-text:focus
        border-color $buttonPrimaryColor

    .input-text:placeholder
        color #B1B9C0

    .input-text__wrap--inline
        display inline-block

    .input-text--short
        width 250px

</style>
