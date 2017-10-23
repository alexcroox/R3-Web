<template>
    <map-box
        class="player-list__container"
        :class="{ 'player-list__container--hide': hidden }">

        <button
            @click="toggleHide"
            class="player-list__toggle-sticky"
            :class="{ 'player-list__toggle-sticky--enabled': !autoHide }"
            title="Toggle player list auto hide">
                <i class="fa fa-thumb-tack"></i>
        </button>

        <vue-scrollbar ref="player-list" class="player-list" :style="{ bottom: splitY + '%' }">
            <div
                v-on:mouseleave="mouseLeave"
                v-on:mouseenter="mouseEnter">

                <div v-for="faction in factions" class="player-list__faction">
                    <button
                        @click="toggleFaction(faction.id)"
                        class="player-list__expand-handle"
                        :class="{ 'player-list__expand-handle--collapsed': faction.collapsed }">

                        <span class="player-list__faction__name">{{ faction.meta.name }}</span>
                    </button>

                    <div
                        v-if="!faction.collapsed"
                        v-for="group in faction.groups"
                        class="player-list__group">

                        <button
                            @click="toggleGroup(faction.id, group.name)"
                            class="player-list__expand-handle player-list__expand-handle--group"
                            :class="{ 'player-list__expand-handle--collapsed': group.collapsed }">

                            <span class="player-list__group__name">{{ group.name }}</span>
                        </button>

                        <button
                            v-if="!group.collapsed"
                            v-for="player in group.members"
                            class="player-list__group-member"
                            :class="{ 'player-list__group-member--highlight': highlightUnit == player.entity_id }"
                            @click="toggleFollowingUnit(player.entity_id)">

                            <img :src="player.iconUrl" class="player-list__group-member__icon">
                            {{ player.name }}
                        </button>
                    </div>
                </div>
            </div>
        </vue-scrollbar>

        <div class="event-list-container" :style="{ height: splitY + '%' }">
            <div
                class="dragger"
                @mousemove="dragMoveY"
                @mouseup="dragEndY"
                @mousedown.prevent="dragStartY"
                @mouseleave="dragEndY"></div>
            <event-list></event-list>
        </div>
    </map-box>
</template>

<script>
    import _find from 'lodash.find'
    import _each from 'lodash.foreach'
    import _sortBy from 'lodash.sortby'
    import _keys from 'lodash.keys'

    import bus from 'eventBus'
    import VueScrollbar from 'vue2-scrollbar'

    import MapBox from 'components/MapBox.vue'
    import EventList from 'components/EventList.vue'

    import getFactionData from 'playback/helpers/getFactionData'
    import Playback from 'playback/index'
    import Infantry from 'playback/infantry'
    import Vehicles from 'playback/vehicles'
    import Map from 'playback/map'

    export default {

        components: {
            MapBox,
            EventList,
            VueScrollbar,
        },

        data () {
            return {
                autoHide: false,
                hidden: false,
                hideTimer: null,
                hideTime: 3, // seconds before player list fades out
                factions: {},
                highlightUnit: 0,
                splitY: 30,
                draggingY: false
            }
        },

        mounted () {

            this.startHideTimer()

            // Keep updating the list of players
            setInterval(this.prepListData, 3000)

            setTimeout(this.prepListData, 1000)

            bus.$on('followUnit', entityId => {
                this.toggleFollowingUnit(entityId)
            })
        },

        methods: {

            prepListData () {

                Infantry.getPlayers()
                    .then(infantryPlayers => {

                        return new Promise(function(resolve, reject) {

                            let playerList = infantryPlayers

                            resolve(infantryPlayers)
                        })
                    })
                    .then(playerList => {

                        _each(playerList, player => {

                            let factionData = getFactionData(player.faction)

                            // Do we have this faction setup yet?
                            if(!this.factions.hasOwnProperty(player.faction))
                                this.$set(this.factions, player.faction, {
                                    id: player.faction,
                                    collapsed: false,
                                    meta: factionData,
                                    groups: {}
                                })

                            // Does this player's group exist yet?
                            if (!this.factions[player.faction].groups.hasOwnProperty(player.group))
                                this.$set(this.factions[player.faction].groups, player.group, {
                                    collapsed: false,
                                    name: player.group,
                                    members: []
                                })

                            // Order groups alphabetically
                            this.factions[player.faction].groups = this.orderGroups(this.factions[player.faction].groups)

                            let groupMembers = this.factions[player.faction].groups[player.group].members

                            if (Vehicles.playersInVehicles.hasOwnProperty(player.entity_id))
                                player.iconUrl = `${Map.iconDomain}/${Vehicles.playersInVehicles[player.entity_id]}-${factionData.name}-trim.png`
                            else
                                player.iconUrl = `${Map.iconDomain}/${player.icon}-${factionData.name}-trim.png`

                            // Add them to the group, if they aren't already there...
                            if (_find(groupMembers, ['entity_id', player.entity_id]) === undefined)
                                groupMembers.push(player);
                        })
                    })
            },

            orderGroups (groups) {

                let keys = _sortBy(_keys(groups), (g) => { return g })

                let orderedGroups = {};

                _each(keys, (k) => {
                    orderedGroups[k] = groups[k]
                });

                return orderedGroups
            },

            toggleHide () {

                this.autoHide = !this.autoHide

                if (this.autoHide)
                    this.startHideTimer()
            },

            toggleFaction (faction) {

                this.$set(this.factions[faction], 'collapsed', !this.factions[faction].collapsed)
            },

            toggleGroup (faction, group) {

                this.$set(this.factions[faction].groups[group], 'collapsed', !this.factions[faction].groups[group].collapsed)
            },

            toggleFollowingUnit (entityId) {

                if (Playback.highlightUnit == entityId) {
                    Playback.stopHighlightingUnit(Playback.highlightUnit)
                    Playback.highlightUnit = 0
                    this.highlightUnit = 0
                    return
                }

                if (Playback.highlightUnit)
                    Playback.stopHighlightingUnit(Playback.highlightUnit)

                Playback.startHighlightingUnit(entityId)
                Playback.highlightUnit = entityId
                this.highlightUnit = entityId
            },

            mouseEnter () {

                clearTimeout(this.hideTimer);
                this.hidden = false
            },

            mouseLeave () {

                clearTimeout(this.hideTimer);
                this.startHideTimer();
            },

            startHideTimer (timeout = this.hideTime) {

                this.hideTimer = setTimeout(() => {

                    if(this.autoHide)
                        this.hidden = true

                }, timeout * 1000);
            },

            dragStartY (e) {
                this.draggingY = true
                this.startY = e.pageY
                this.startSplitY = this.splitY
            },

            dragMoveY (e) {
                if (this.draggingY) {
                    const dy = e.pageY - this.startY
                    const totalHeight = this.$el.offsetHeight
                    this.splitY = this.startSplitY + ~~(dy / totalHeight * 100)
                }
            },

            dragEndY () {
                this.draggingY = false
            },
        },
    }
</script>

<style lang="stylus">
    @import '~styles/config/variables.styl'
    @import '~styles/third-party/scrollbar.css'

    .player-list__container
        left 0
        top $headerHeight
        bottom 0
        width 186px
        color #FFF
        background rgba(0,0,0,.7)
        transition opacity 0.3s ease-in-out;
        transition background 0.3s ease-in-out;

        @media (max-width 650px)
            display none !important

    .player-list__container--hide
        opacity 0.3
        background rgba(0,0,0,0.1)

    .player-list__back
        display block
        width 100%
        color #DDD
        font-size 13px
        font-weight 500
        vertical-align middle
        padding 10px
        border-bottom 1px solid #666
        text-transform uppercase
        z-index 1
        position relative

    .player-list__back:hover
        color #FFF

    .player-list__back__icon
        display inline-block
        margin-right 5px
        vertical-align text-top

    .player-list__toggle-sticky
        position absolute
        top -3px
        right 2px
        color #ddd
        padding 10px
        z-index 2
        opacity 0.4

    .player-list__toggle-sticky:hover
        opacity 0.8
        cursor pointer

    .player-list__toggle-sticky--enabled
        opacity 0.9

    .player-list__container--hide .player-list__group-member__icon
        opacity 0.3

    .player-list
        padding 10px 10px 10px 10px
        overflow hidden
        position absolute
        top 0
        bottom 40%
        right 0
        left 0

    .dragger
        position absolute
        top 0
        left 0
        right 0
        height 4px

    .dragger:after
        content ''
        height 1px
        position absolute
        top 0px
        left 0
        right 0
        background #666

    .dragger:hover
        cursor ns-resize

    .event-list-container
        height 40%
        bottom 0
        position absolute
        left 0
        right 0

    .player-list__group
        text-transform none
        margin 5px 0 0 2px
        font-size 13px

    .player-list__faction
    .player-list__group
        padding-left 13px
        font-size 15px
        color #FFF
        font-weight 700
        position relative
        margin-bottom 10px

    .player-list__faction:last-child
        margin-bottom 40px

    .player-list__faction__name
        text-transform uppercase
        letter-spacing 0.03em

    .player-list__expand-handle
        color #FFF
        display block
        width 100%
        text-align left

    .player-list__expand-handle:hover
        cursor pointer

    .player-list__expand-handle:before
        left 0
        top 2px
        position absolute
        font-size 12px
        content "\f0da"
        font-family FontAwesome
        color #CCC

    .player-list__expand-handle--collapsed:before
        content "\f0d7"

    .player-list__expand-handle--collapsed + .player-list__expand-list
        display none

    .player-list__group-member
        padding 1px 10px 1px 5px
        color #FFF
        font-size 13px
        display block
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
        min-width 153px
        position relative
        text-align left
        vertical-align middle

    .player-list__group-member--highlight
        background #CCC
        color #000

    .player-list__group-member--stopping-tracking
        animation trackingFlash 0.3s
        animation-iteration-count 4

    @keyframes trackingFlash
        0%
            background #CCC
        100%
            background none

    .player-list__group-member__icon
        display inline-block
        margin-right 5px
        width 12px
        vertical-align sub


</style>
