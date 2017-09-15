<template>
    <div class="playback__container">

        <main-header v-if="!loading" :title="missionName" fixed="true"></main-header>

        <transition name="fade">
            <full-screen-loader
                v-if="loading"
                :text="currentLoadingStage"
                :title="missionName"
                :subTitle="terrainConfig.name">
            </full-screen-loader>
        </transition>

        <leaflet-map
            :terrainConfig="terrainConfig">
        </leaflet-map>

        <player-list v-if="!loading"></player-list>

        <map-box class="timeline" :hidden="loading">

            <button class="timeline__play" @click="togglePlay">
                <i v-if="!paused && !ended" class="fa fa-fw fa-pause"></i>
                <i v-if="paused && !ended" class="fa fa-fw fa-play"></i>
                <i v-if="ended" class="fa fa-fw fa-repeat"></i>
            </button>

            <speed-slider
                class="margin__left--small"
                :speed="currentSpeed"
                @change="changeSpeed">
            </speed-slider>

            <time-slider class="margin__left--small margin__right--small"></time-slider>

            <button class="timeline__share" @click="share">
                <i class="fa fa-share-alt"></i>
            </button>

            <button class="timeline__fullscreen margin__left--small" @click="fullscreen">
                <i class="fa fa-arrows-alt"></i>
            </button>
        </map-box>

        <share-modal :link="shareLink"></share-modal>
    </div>
</template>

<script>
    import axios from 'http'
    import router from 'routes'
    import _each from 'lodash.foreach'
    import _map from 'lodash.map'
    import _find from 'lodash.find'
    import moment from 'moment'
    import screenfull from 'screenfull'
    import bus from 'eventBus'

    import LeafletMap from 'components/LeafletMap.vue'
    import FullScreenLoader from 'components/FullScreenLoader.vue'
    import TimeSlider from 'components/TimeSlider.vue'
    import SpeedSlider from 'components/SpeedSlider.vue'
    import MapBox from 'components/MapBox.vue'
    import ShareModal from 'views/modals/ShareModal.vue'
    import PlayerList from 'components/PlayerList.vue'
    import MainHeader from 'components/MainHeader.vue'

    import Playback from 'playback/index'
    import PlaybackTime from 'playback/time'
    import Map from 'playback/map'
    import Infantry from 'playback/infantry'
    import Vehicles from 'playback/vehicles'
    import Events from 'playback/events'

    export default {

        components: {
            LeafletMap,
            FullScreenLoader,
            TimeSlider,
            SpeedSlider,
            MapBox,
            ShareModal,
            PlayerList,
            MainHeader,
        },

        props: ['urlData'],

        data () {
            return {
                foundTerrain: false,
                terrainConfig: {},
                missionId: this.urlData.params.id,
                missionName: '',
                currentSpeed: this.$store.state.preference.playbackSpeed || 10,
                shareLink: '',
                paused: true,
                ended: false,
                tileDomain: {
                    static: 'https://r3tiles-a.titanmods.xyz',
                    dynamic: 'https://r3tiles-{s}.titanmods.xyz' // sub domain support for faster loading (non http/2 servers)
                },
                iconDomain: 'https://r3icons.titanmods.xyz',
                loading: true,
                initiatedPlayback: false,
                loadingStages: {
                    terrain: {
                        complete: false,
                        text: 'Loading terrain'
                    },
                    vehicleIcons: {
                        complete: false,
                        text: 'Loading vehicle icons'
                    },
                    missionInfo: {
                        complete: false,
                        text: 'Loading mission'
                    },
                    missionEvents: {
                        complete: false,
                        text: 'Loading events'
                    },
                    vehicles: {
                        complete: false,
                        text: 'Loading vehicles'
                    },
                    vehiclePositions: {
                        complete: false,
                        text: 'Loading vehicle movements'
                    },
                    infantry: {
                        complete: false,
                        text: 'Loading infantry'
                    },
                    infantryPositions: {
                        complete: false,
                        text: 'Loading infantry movements'
                    }
                }
            }
        },

        created () {

            if (this.urlData.params.terrain == null)
                return this.errorReturnToMissionList('No terrain specified in URL!?')

            // If any of our api calls return 403 it's because the mission hasn't finished
            axios.interceptors.response.use(response => {
                return response;
            }, error => {

                const originalRequest = error.config

                // Ignore any requests to our terrain server
                if (originalRequest.url.includes('r3tiles'))
                    return Promise.reject(error);

                if (error.response.status == 403)
                    return this.errorReturnToMissionList('That mission is still in progress')
                else
                    return Promise.reject(error);
            });

            this.getTerrainInfo()
            this.getVehicleIcons()
            this.fetchMissionInfo()
        },

        mounted () {

            console.log(this.urlData)

            this.startTime = moment()

            bus.$on('paused', (paused) => {
                this.paused = paused
            })

            bus.$on('ended', (ended) => {
                this.ended = ended
            })
        },

        beforeDestroy () {
            // If we navigate away from playback lets stop our timers
            PlaybackTime.end()
        },

        methods: {

            errorReturnToMissionList (errorText, errorDetail) {

                if (errorDetail != null)
                    console.error(errorDetail);

                router.push({ name: 'missions.list', params: { error: errorText } })
            },

            getTerrainInfo () {

                let matchedTerrain = this.urlData.params.terrain

                if (this.$store.state.settings.mappingAliases[matchedTerrain] != null)
                    matchedTerrain = this.$store.state.settings.mappingAliases[matchedTerrain]

                axios.get(`${this.tileDomain.static}/${matchedTerrain}/config.json`)
                    .then(response => {

                        console.log('Playback: Got terrain config', response.data);

                        this.terrainConfig = response.data
                        this.foundTerrain = true

                        Map.render(this.terrainConfig, this.tileDomain, this.iconDomain)

                        this.completeLoadingStage('terrain')
                    })
                    .catch(error => {
                        console.error('Error fetching terrain config', error)

                        this.errorReturnToMissionList(`
                            The terrain ${matchedTerrain} is missing,
                            <a href="https://github.com/alexcroox/R3-Web/wiki/Adding-new-terrains"
                                target="_blank"
                                class="text-link text-link--with-underline">
                                why don't you add it?
                            </a>`)
                    })
            },

            getVehicleIcons () {

                axios.get(`${this.iconDomain}/config.json`)
                    .then(response => {

                        console.log('Playback: Got vehicle icons', response.data);

                        Vehicles.icons = response.data

                        this.completeLoadingStage('vehicleIcons')
                    })
                    .catch(error => {
                        console.error('Error fetching vehicle icon config', error)

                        this.errorReturnToMissionList('Cannot download vehicle icons, please try again')
                    })
            },

            fetchMissionInfo () {

                Playback.load(this.missionId).then(missionInfo => {

                    PlaybackTime.initScrubber(0, missionInfo.last_mission_time)
                    this.missionName = (missionInfo.display_name != "")? missionInfo.display_name : missionInfo.name
                    this.missionPlayed = missionInfo.played_human

                    this.completeLoadingStage('missionInfo')

                    this.fetchMissionEvents()
                    this.fetchInfantry()
                    this.fetchInfantryPositions()
                    this.fetchVehicles()
                    this.fetchVehiclePositions()

                }).catch(error => this.errorReturnToMissionList('That mission cannot be found!', error))
            },

            fetchMissionEvents () {

                Events.load(this.missionId)
                    .then(response => this.completeLoadingStage('missionEvents'))
                    .catch(error => this.errorReturnToMissionList('Error loading mission events'))
            },

            fetchInfantry () {

                Infantry.loadEntities(this.missionId)
                    .then(response => this.completeLoadingStage('infantry'))
                    .catch(error => this.errorReturnToMissionList('Error loading mission infantry'))
            },

            fetchVehicles () {

                Vehicles.loadEntities(this.missionId)
                    .then(response => this.completeLoadingStage('vehicles'))
                    .catch(error => this.errorReturnToMissionList('Error loading mission vehicles'))
            },

            fetchInfantryPositions () {

                Infantry.loadPositions(this.missionId)
                    .then(response => {

                        Infantry.initMapLayer()
                        this.completeLoadingStage('infantryPositions')
                    })
                    .catch(error => this.errorReturnToMissionList('Error loading mission infantryPositions'))
            },

            fetchVehiclePositions () {

                Vehicles.loadPositions(this.missionId)
                    .then(response => {

                        Vehicles.initMapLayer()
                        this.completeLoadingStage('vehiclePositions')
                    })
                    .catch(error => this.errorReturnToMissionList('Error loading mission vehiclePositions'))
            },

            completeLoadingStage (stageType) {

                this.loadingStages[stageType].complete = true
            },

            togglePlay () {

                PlaybackTime.toggle()
            },

            changeSpeed (newSpeed) {

                console.log('Playback: new speed', newSpeed)

                this.currentSpeed = newSpeed
                PlaybackTime.changeSpeed(this.currentSpeed)
            },

            initPlayback () {

                this.initiatedPlayback = true
                this.loading = false

                PlaybackTime.play()

                setTimeout(() => {
                    bus.$emit('notification', {
                        message: `
                            ${this.missionName.toUpperCase()} -
                            ${this.terrainConfig.name.toUpperCase()} -
                            ${this.missionPlayed}`,
                        type: 'info'
                    })
                }, 1000)
            },

            share () {

                this.shareLink = 'https://google.com'
                bus.$emit('showShareModal')
            },

            fullscreen () {

                if (screenfull.enabled)
                    screenfull.toggle()
            },
        },

        computed: {

            unitName () {
                return this.$store.state.settings.unitName
            },

            currentLoadingStage () {

                let activeText = ''

                _each(this.loadingStages, stage => {

                    if (!stage.complete)
                        activeText = stage.text
                })

                return activeText
            },
        },

        watch: {
            unitName () {
                document.title = (!this.missionName)? `Mission Playback - ${this.unitName}` : `${this.missionName} - ${this.unitName}`
            },

            loadingStages: {
                handler: function () {

                    let stillLoading = (_find(this.loadingStages, ['complete', false ])) ? true : false;

                    if (!stillLoading && !this.initiatedPlayback) {

                        let timeSpentLoading = moment().diff(this.startTime, 'seconds')
                        let minLoadingTime = 3

                        console.log('Playback: Time spent loading', timeSpentLoading)

                        // If we've seen the loading screen for long enough lets immediately proceeed
                        // Otherwise wait until x seconds has passed
                        if (timeSpentLoading >= minLoadingTime)
                            this.initPlayback()
                        else
                            setTimeout(this.initPlayback, Math.round((minLoadingTime - timeSpentLoading) * 1000))

                    } else {

                        this.loading = stillLoading
                    }
                },
                deep: true
            },
        },
    }
</script>

<style lang="stylus">
    .playback__container
        position absolute
        top 0px
        right 0px
        bottom 0px
        left 0px
        z-index 1

    .timeline__play
        color #FFF
        display inline-block
        font-size 19px

    .timeline__play:hover
        opacity .8
        cursor pointer

    .timeline__share
    .timeline__fullscreen
        color #FFF
        display inline-block
        font-size 19px

        &:hover
            opacity .8
            cursor pointer

</style>

<style lang="stylus" scoped>
    .timeline
        left 50%
        right 10px
        bottom 10px
        height 36px
        display flex
        align-items center
        padding 0 10px
        z-index 2

        @media (max-width 900px)
            left 10px

    .fade-enter-active, .fade-leave-active
        transition opacity 1s

    .fade-enter
    .fade-leave-to
        opacity 0

</style>
