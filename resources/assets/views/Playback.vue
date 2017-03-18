<template>
    <div class="playback__container">

        <full-screen-loader v-if="loading" :text="currentLoadingStage"></full-screen-loader>

        <leaflet-map v-if="foundTerrain" :terrainConfig="terrainConfig" :tileDomain="tileDomain"></leaflet-map>

        <slider v-if="!loading" :min="sliderMin" :max="sliderMax"></slider>
    </div>
</template>

<script>
    import axios from 'http'
    import router from 'routes'
    import _each from 'lodash.foreach'
    import _map from 'lodash.map'
    import _find from 'lodash.find'

    import LeafletMap from 'components/LeafletMap.vue'
    import FullScreenLoader from 'components/FullScreenLoader.vue'
    import Slider from 'components/Slider.vue'

    import Playback from 'playback/index'
    import Infantry from 'playback/infantry'
    import Vehicles from 'playback/vehicles'

    export default {
        components: {
            LeafletMap,
            FullScreenLoader,
            Slider
        },

        props: ['urlData'],

        data () {
            return {
                foundTerrain: false,
                missionData: { positions: {} },
                terrainConfig: {},
                missionId: this.urlData.params.id,
                missionInfo: {},
                sliderMin: 0,
                sliderMax: 0,
                tileDomain: {
                    static: 'https://r3tiles-a.titanmods.xyz',
                    dynamic: 'https://r3tiles-{s}.titanmods.xyz' // sub domain support for faster loading (non http/2 servers)
                },
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

        methods: {

            errorReturnToMissionList (errorText) {

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

                axios.get(`/missions/${this.missionId}`)
                    .then(response => {

                        console.log('Playback: Got mission info', response.data)

                        this.missionInfo = response.data

                        this.sliderMax = this.missionInfo.total_mission_time

                        this.completeLoadingStage('missionInfo')

                        this.playback = new Playback(this.missionInfo)

                        this.fetchMissionEvents()
                        this.fetchInfantry()
                        this.fetchInfantryPositions()
                        this.fetchVehicles()
                        this.fetchVehiclePositions()
                    })
                    .catch(error => {

                        console.error('Error fetching mission info', error)

                        this.errorReturnToMissionList('That mission cannot be found!')
                    })
            },

            fetchMissionEvents () {

                axios.get(`/events/${this.missionId}`)
                    .then(response => {

                        console.log('Playback: Got mission events', response.data.length);

                        this.missionData.events = response.data

                        this.completeLoadingStage('missionEvents')
                    })
                    .catch(error => {

                        console.error('Error fetching mission events', error)

                        this.errorReturnToMissionList('Error loading mission events')
                    })
            },

            fetchInfantry () {

                axios.get(`/infantry/${this.missionId}`)
                    .then(response => {

                        console.log('Playback: Got infantry', response.data.length);

                        let data = response.data

                        Infantry.loadEntities(data).then(() => {
                            this.completeLoadingStage('infantry')
                        })
                    })
                    .catch(error => {

                        console.error('Error fetching mission infantry', error)

                        this.errorReturnToMissionList('Error loading mission infantry')
                    })
            },

            fetchVehicles () {

                axios.get(`/vehicles/${this.missionId}`)
                    .then(response => {

                        console.log('Playback: Got vehicles', response.data.length);

                        let data = response.data

                        Vehicles.loadEntities(data).then(() => {
                            this.completeLoadingStage('vehicles')
                        })
                    })
                    .catch(error => {

                        console.error('Error fetching mission vehicles', error)

                        this.errorReturnToMissionList('Error loading mission vehicles')
                    })
            },

            fetchInfantryPositions () {

                axios.get(`/positions/infantry/${this.missionId}`)
                    .then(response => {

                        console.log('Playback: Got infantry positions', response.data.length);

                        let data = response.data

                        Infantry.loadPositions(data).then(() => {
                            this.completeLoadingStage('infantryPositions')
                        })
                    })
                    .catch(error => {

                        console.error('Error fetching mission infantryPositions', error)

                        this.errorReturnToMissionList('Error loading mission infantryPositions')
                    })
            },

            fetchVehiclePositions () {

                axios.get(`/positions/vehicle/${this.missionId}`)
                    .then(response => {

                        console.log('Playback: Got vehicle positions', response.data.length);

                        let data = response.data

                        Infantry.loadPositions(data).then(() => {
                            this.completeLoadingStage('vehiclePositions')
                        })
                    })
                    .catch(error => {

                        console.error('Error fetching mission vehiclePositions', error)

                        this.errorReturnToMissionList('Error loading mission vehiclePositions')
                    })
            },

            completeLoadingStage (stageType) {

                this.loadingStages[stageType].complete = true
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
            unitName (name) {
                document.title = (!this.missionInfo.name)? `Mission Playback - ${this.unitName}` : `${this.missionInfo.name} - ${this.unitName}`
            },

            loadingStages: {
                handler: function () {

                    this.loading = (_find(this.loadingStages, ['complete', false ])) ? true : false

                    if (!this.loading && !this.initiatedPlayback) {

                        this.initiatedPlayback = true
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
</style>
