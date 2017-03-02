<template>
    <div class="list-search__container">
        <h3 class="list-search__title">{{ title }} ({{ listTotal }})</h3>

        <input-text icon="search" inputClass="table-list__search" @keyup="$emit('searched', $event)" noBackground="true" bold="true" short="true" inline="true" :placeholder="placeholder"></input-text>
    </div>
</template>

<script>
    import InputText from 'components/InputText.vue'

    export default {
        props: ['title', 'listTotal', 'placeholder'],

        components: {
            InputText
        },
    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'

    .list-search__container
        padding-top 25px

    .list-search__title
        font-weight 500
        display inline-block
        margin-right 30px
</style>
