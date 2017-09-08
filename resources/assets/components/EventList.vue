<template>
    <div class="event-list">
        <button
            title="Jump back in time"
            v-for="m in messages"
            v-html="m.message"
            class="event"
            @click="jumpToEvent(m)"
            :class="[`event--${m.type}`]"></button>
    </div>
</template>

<script>
    import Playback from 'playback/index'
    import PlaybackTime from 'playback/time'
    import InputText from 'components/InputText.vue'
    import Map from 'playback/map'
    import bus from 'eventBus'

    export default {

        components: {
            InputText
        },

        data () {
            return {
                messages: []
            }
        },

        created () {
            bus.$on('notification', (message) => {

                if (!message.position) message.position = false
                if (!message.entityId) message.entityId = false

                this.messages.unshift({
                    ...message,
                    missionTime: PlaybackTime.currentMissionTime - 10
                })
            })
        },

        methods: {

            jumpToEvent (message) {

                if (message.position)
                    Map.setView(message.position, 7)

                if (message.entityId)
                    bus.$emit('followUnit', message.entityId)

                PlaybackTime.skipTime(message.missionTime)
                PlaybackTime.changeSpeed(5)
            }
        }
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'

    .event-list
        bottom 0
        height 40%
        position absolute
        left 0
        right 0
        overflow hidden
        padding 10px 5px 0 5px
        border-top 1px solid #666

    .event
        font-size 12px
        display block
        font-weight 600
        padding 2px 5px
        color #FFF
        margin-bottom 4px
        text-align left
        width 100%

    .event:hover
        cursor w-resize

    .event--info
        background rgba(255,255,255,.6)
        color #333

    .event--kill-player
        background rgba(255,0,0,.6)

    .event--kill-ai
        background rgba(255,0,0,.6)
        opacity 0.6
</style>
