<template>
    <div class="input-text__wrap"
        :class="{
            'input-text__wrap--with-icon': icon,
            'input-text__wrap--focus': inputFocused,
            'input-text__wrap--inline': inline,
            'input-text__wrap--no-background': noBackground,
            'input-text__wrap--bold': bold
        }">

        <i v-if="icon" :class="['fa', 'input-text__icon', faIcon]" aria-hidden="true"></i>

        <input
            type="text"
            class="input-text"
            :placeholder="placeholder"
            :class="[{ 'input-text--short': short }, inputClass]"
            @focus="focus"
            @blur="blur">
    </div>
</template>

<script>
    export default {

        props: ['icon', 'noBackground', 'placeholder', 'inline', 'bold', 'short', 'inputClass'],

        data () {
            return {
                inputFocused: false
            }
        },

        methods: {

            focus () {
                this.inputFocused = true
            },

            blur () {
                this.inputFocused = false
            }
        },

        computed: { faIcon() { return `fa-${this.icon}` } }
    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'

    .input-text
        inputText()
        position relative

    .input-text:focus
        border-color $buttonPrimaryColor

    .input-text:placeholder
        color #B1B9C0

    .input-text__wrap--bold .input-text
        font-size 16px
        font-weight 500

    .input-text__wrap--bold:placeholder
        font-weight 500

    .input-text__icon
        z-index 1
        position absolute
        left 20px
        top 17px
        font-size 20px
        color $bodyTextSecondaryColor

    .input-text__wrap--bold .input-text__icon
        color #b1b9c0

    .input-text__wrap--with-icon
        position relative

    .input-text__wrap--with-icon .input-text
        z-index 0
        position relative
        padding-left 45px

    .input-text__wrap--no-background .input-text__icon
        top auto
        left auto
        position relative
        display inline-block
        margin-right 10px
        font-size 16px

    .input-text__wrap--no-background .input-text
        background none
        border none
        padding 0
        line-height auto
        display inline-block

    .input-text__wrap--focus .input-text__icon
        color $bodyTextPrimaryColor

    .input-text__wrap--inline
        display inline-block

    .input-text--short
        width 400px

</style>
