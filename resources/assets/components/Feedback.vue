<template>
    <div class="feedback" :class="feedbackType">
        <i class="fa feedback__icon" :class="feedbackIcon"></i>
        <slot name="message"></slot>
    </div>
</template>

<script>
    export default {
        props: ['type'],

        computed: {

            feedbackType () {

                return `feedback--${this.type}`
            },

            feedbackIcon () {

                switch(this.type) {

                    case 'error':
                        return 'fa-exclamation'
                        break;

                    case 'information':
                        return 'fa-info'
                        break;

                    default:
                        return 'fa-check'
                }
            },
        },
    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'

    .feedback
        padding 10px 15px
        border-radius 2px

    .feedback__icon
        display inline-block
        margin-right 10px

    .feedback--error
        background #FDEBE8
        color #EE8574
        font-weight 500

    .feedback--information
        background #489FDF
        color #FFF
        font-weight 500

</style>
