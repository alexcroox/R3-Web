<template>
    <v-select
        class="input-select"
        :options="options"
        v-model="value"
        :placeholder="placeholder"
        :on-change="onSelect">
    </v-select>
</template>

<script>
    import vSelect from 'vue-select'

    export default {

        components: {
            vSelect
        },

        props: ['options', 'value', 'placeholder', 'searchable', 'multiple', 'inline', 'short'],

        mounted () {
            console.log('Default select value', this.value)
        },

        methods: {

            onSelect (option) {
                console.log('InputSelect changed', option.value)
                this.$emit('changed', option.value)
            }
        },
    }
</script>

<style lang="stylus">

    //@import '~vue-multiselect/dist/vue-multiselect.min.css'
    @import '~styles/config/variables.styl'
    @import '~styles/config/typography.styl'

    .input-select
        buttonLabelsMetaContent()
        border-radius $borderRadiusSmall
        width 100%
        font-weight 400

    .input-text:focus
        border-color $buttonPrimaryColor

    .input-text:placeholder
        color #B1B9C0

    .input-text__wrap--inline
        display inline-block

    .input-text--short
        width 250px

</style>
