<template>
    <div class="playback__container">

        <transition name="fade">
            <full-screen-loader
                v-if="loading"
                :text="currentLoadingStage"
                :title="missionName"
                :subTitle="terrainConfig.name">
            </full-screen-loader>
        </transition>

        <leaflet-map
            v-if="foundTerrain"
            :terrainConfig="terrainConfig"
            :tileDomain="tileDomain"
            :iconDomain="iconDomain">
        </leaflet-map>

        <map-box class="timeline" :hidden="loading">

            <button class="timeline__play" @click="togglePlay">
                <i v-if="!paused" class="fa fa-pause"></i>
                <i v-if="paused" class="fa fa-play"></i>
            </button>

            <div class="timeline__speed__container">
                <button
                    class="timeline__speed"
                    :class="{ 'timeline__speed--active': currentSpeed == 5 }"
                    @click="changeSpeed(5)">
                    5x
                </button>

                <button
                    class="timeline__speed"
                    :class="{ 'timeline__speed--active': currentSpeed == 10 }"
                    @click="changeSpeed(10)">
                    10x
                </button>

                <button
                    class="timeline__speed"
                    :class="{ 'timeline__speed--active': currentSpeed == 30 }"
                    @click="changeSpeed(30)">
                    30x
                </button>
            </div>

            <slider></slider>
        </map-box>
    </div>
</template>

<script>
    import axios from 'http'
    import router from 'routes'
    import _each from 'lodash.foreach'
    import _map from 'lodash.map'
    import _find from 'lodash.find'
    import moment from 'moment'

    import LeafletMap from 'components/LeafletMap.vue'
    import FullScreenLoader from 'components/FullScreenLoader.vue'
    import Slider from 'components/Slider.vue'
    import MapBox from 'components/MapBox.vue'

    import Playback from 'playback/index'
    import Infantry from 'playback/infantry'
    import Vehicles from 'playback/vehicles'
    import Events from 'playback/events'

    export default {

        components: {
            LeafletMap,
            FullScreenLoader,
            Slider,
            MapBox
        },

        props: ['urlData'],

        data () {
            return {
                foundTerrain: false,
                terrainConfig: {},
                missionId: this.urlData.params.id,
                missionName: '',
                currentSpeed: 5,
                paused: true,
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

                if (error.response.status == 403)
                    return this.errorReturnToMissionList('That mission is still in progress')
                else
                    return Promise.reject(error);
            });

            this.getTerrainInfo()
            this.fetchMissionInfo()
        },

        mounted () {

            this.startTime = moment()
        },

        methods: {

            errorReturnToMissionList (errorText, errorDetail) {

                if (errorDetail != null)
                    console.error(errorDetail);

                //router.push({ name: 'missions.list', params: { error: errorText } })
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

            fetchMissionInfo () {

                Playback.load(this.missionId).then(missionInfo => {

                    Playback.initScrubber(0, missionInfo.total_mission_time)
                    this.missionName = missionInfo.display_name

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
                    .then(response => this.completeLoadingStage('infantryPositions'))
                    .catch(error => this.errorReturnToMissionList('Error loading mission infantryPositions'))
            },

            fetchVehiclePositions () {

                Vehicles.loadPositions(this.missionId)
                    .then(response => this.completeLoadingStage('vehiclePositions'))
                    .catch(error => this.errorReturnToMissionList('Error loading mission vehiclePositions'))
            },

            completeLoadingStage (stageType) {

                this.loadingStages[stageType].complete = true
            },

            togglePlay () {

                Playback.toggle()
            },

            changeSpeed (newSpeed) {

                this.currentSpeed = newSpeed
                Playback.changeSpeed(this.currentSpeed)
            },

            initPlayback () {

                this.initiatedPlayback = true
                this.loading = false
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
        position absolute
        display block
        left 10px
        top 9px

    .timeline__play:hover
        opacity .8
        cursor pointer

    .timeline__speed__container
        position absolute
        left 35px
        top 8px

    .timeline__speed
        display inline-block
        color #AAA
        font-size 14px
        font-weight 700
        margin-right 4px

    .timeline__speed:last-child
        margin-right 0

    .timeline__speed--active
        color #FFF

    .timeline__speed:hover
        color #EEE
        cursor pointer
</style>

<style lang="stylus" scoped>
    .timeline
        left 50%
        right 10px
        bottom 10px
        height 36px

        @media (max-width 900px)
            left 10px

    .fade-enter-active, .fade-leave-active
        transition opacity 1s

    .fade-enter
    .fade-leave-to
        opacity 0

</style>
