<template>
    <button
        @click="$emit('click')"
        class="button"
        :class="{
            'button--block': block,
            'button--loading': loading
        }">
        <i v-if="icon || loading" :class="['fa', 'button__icon', faIcon]" aria-hidden="true"></i>
        <slot></slot>
    </button>
</template>

<script>
    export default {

        props: ['icon', 'block', 'loading'],

        computed: {

            faIcon() {
                return (this.loading)? `fa-cog fa-spin fa-fw` : `fa-${this.icon}`
            }
        }

    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'
    @import '~styles/config/typography.styl'

    .button
        buttonLabelsMetaContent()
        background $buttonPrimaryColor
        color #FFF
        border-radius $borderRadiusSmall
        padding 14px 30px 15px
        display inline-block
        text-align center
        transition all 0.3s ease 0s
        vertical-align middle

    .button:hover
        cursor pointer
        opacity 0.8

    .button__icon
        margin-right 5px
        vertical-align middle

    .button--wider
        padding-left 40px
        padding-right 40px

    .button--disabled
        background $disabledColor

    .button--disabled:hover
        background-color $disabledColor
        cursor not-allowed

    .button--alt
        background-color $buttonSecondaryColor

    .button--alt:hover
        opacity 0.8

    .button--negative
        background-color $errorPrimaryColor
</style>
