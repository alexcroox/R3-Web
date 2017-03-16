<template>
    <div class="list-search__container">

        <h3 class="list-search__title">
            {{ title }}
            <span v-if="listTotal > 0 || finishedLoading">({{ listTotal }})</span>
        </h3>

        <input-text
            class="table-list__search"
            icon="search"
            @keyup="$emit('searched', $event)"
            noBackground="true"
            bold="true"
            inline="true"
            :placeholder="placeholder">
        </input-text>

    </div>
</template>

<script>
    import InputText from 'components/InputText.vue'

    export default {
        props: ['title', 'listTotal', 'placeholder', 'finishedLoading'],

        components: {
            InputText
        },
    }
</script>

<style lang="stylus">

    .list-search__container
        padding-top 25px

    .list-search__title
        font-weight 500
        display inline-block
        margin-right 30px

        @media (max-width 480px)
            display block
            margin-bottom 20px
</style>
