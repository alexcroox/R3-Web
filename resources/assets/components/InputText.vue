<template>
    <div v-if="icon" class="input-text__wrap"
        :class="{
            'input-text__wrap--with-icon': icon,
            'input-text__wrap--focus': inputFocused,
            'input-text__wrap--inline': inline,
            'input-text__wrap--no-background': noBackground,
            'input-text__wrap--bold': bold,
            'input-text__wrap--full': full
        }">

        <i v-if="icon" :class="['fa', 'input-text__icon', faIcon]" aria-hidden="true"></i>

        <input
            type="text"
            ref="input"
            :value="value"
            class="input-text"
            :placeholder="placeholder"
            :class="{
                'input-text--short': short,
                'input-text--light': lightBackground,
                'input-text--full': full
            }"
            @keyup="$emit('keyup', $event.target.value)"
            @keyup.enter="$emit('enter', $event.target.value)"
            @focus="focus"
            @blur="blur"
            @input="$emit('input', $event.target.value)">
    </div>

    <input
        v-else
        :value="value"
        type="text"
        ref="input"
        class="input-text"
        :placeholder="placeholder"
        :class="{
            'input-text--short': short,
            'input-text--light': lightBackground,
            'input-text--full': full
        }"
        @keyup="$emit('keyup', $event.target.value)"
        @keyup.enter="$emit('enter', $event.target.value)"
        @focus="focus"
        @blur="blur"
        @input="$emit('input', $event.target.value)">
</template>

<script>
    export default {

        props: [
            'value',
            'icon',
            'noBackground',
            'placeholder',
            'inline',
            'bold',
            'short',
            'lightBackground',
            'full',
        ],

        data () {
            return {
                inputFocused: false
            }
        },

        methods: {

            focus () {
                this.inputFocused = true
                this.$emit('focus', this.$refs.input)
            },

            blur () {
                this.inputFocused = false
            },
        },

        computed: {

            faIcon() {
                return `fa-${this.icon}`
            }
        }
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'
    @import '~styles/config/typography.styl'

    .input-text
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

    .input-text--light
        background #FFF

    .input-text__wrap--bold .input-text
        font-size 16px
        font-weight 500

    .input-text__wrap--bold:placeholder
        font-weight 500

    .input-text__icon
        z-index 1
        position absolute
        left 20px
        top 16px
        font-size 20px
        color $bodyTextSecondaryColor

    .input-text__wrap--bold .input-text__icon
        color #b1b9c0

    .input-text__wrap--with-icon
        position relative

    .input-text__wrap--with-icon .input-text
        z-index 0
        position relative
        padding-left 55px

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
        width 250px

    .input-text--full
        width 100%

</style>
