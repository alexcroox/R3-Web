<template>
    <vue-scrollbar ref="event-list" class="event-list">
        <div>
            <button
                title="Jump back in time"
                v-for="m in messages"
                v-html="m.message"
                class="event"
                @click="jumpToEvent(m)"
                :class="[`event--${m.type}`, {'event--is-user': m.isUser}]"></button>
        </div>
    </vue-scrollbar>
</template>

<script>
    import VueScrollbar from 'vue2-scrollbar'
    import bus from 'eventBus'
    import { mapGetters } from 'vuex'
    import _each from 'lodash.foreach'

    import Playback from 'playback/index'
    import Infantry from 'playback/infantry'
    import PlaybackTime from 'playback/time'
    import InputText from 'components/InputText.vue'
    import Map from 'playback/map'

    export default {

        components: {
            InputText,
            VueScrollbar
        },

        data () {
            return {
                messages: []
            }
        },

        created () {
            bus.$on('notification', message => {

                if (!message.position) message.position = false
                if (!message.entityId) message.entityId = false

                // Check if this message involves our user
                if (message.entityId) {

                    let entity = Infantry.getEntityById(message.entityId)

                    if (entity.player_id == this.playerId)
                        message.isUser = true
                }

                this.messages.unshift({
                    ...message,
                    jumpMissionTime: PlaybackTime.currentMissionTime - 10,
                    missionTime: PlaybackTime.currentMissionTime
                })
            })

            // Delete any events that occur after the new mission time
            bus.$on('skipTime', missionTime => {

                console.log('Deleting messages after', missionTime)

                _each(this.messages, (message, index) => {

                    if (!message)
                        return

                    if (message.missionTime > missionTime)
                        this.messages.splice(index, 1)
                })
            })
        },

        computed: {

            ...mapGetters([
                'playerId'
            ]),

        },

        methods: {

            jumpToEvent (message) {

                if (message.position)
                    Map.setView(message.position, 7)

                if (message.entityId)
                    bus.$emit('followUnit', message.entityId)

                PlaybackTime.skipTime(message.jumpMissionTime)
                PlaybackTime.changeSpeed(5)
            }
        }
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'
    @import '~styles/third-party/scrollbar.css'

    .event-list
        bottom 0
        top 0
        position absolute
        left 0
        right 0
        overflow hidden
        padding 10px 5px 0 5px
        border-top 1px solid #666
        min-height 100px

    .event
        font-size 12px
        display block
        font-weight 600
        padding 2px 5px
        color #FFF
        margin-bottom 4px
        text-align left
        width 100%
        border-radius 4px

    .event:hover
        cursor pointer

    .player-list__container--hide .event
        opacity 0

    .event--info
    .event--self-propelled-launch
    .event--projectile-launch
        background rgba(255,255,255,.6)
        color #333

    .event--kill-player
        background rgba(255,0,0,.6)

    .event--kill-ai
        background rgba(255,0,0,.6)
        opacity 0.6

    .event--is-user
        background #6D62AE
</style>
