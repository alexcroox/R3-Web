<template>
    <div class="playback__container">

        <full-screen-loader v-if="loading" :text="currentLoadingStage"></full-screen-loader>

        <leaflet-map v-if="foundTerrain" :terrainConfig="terrainConfig" :tileDomain="tileDomain"></leaflet-map>
    </div>
</template>

<script>
    import axios from 'http'
    import router from 'routes'
    import _each from 'lodash.foreach'
    import _map from 'lodash.map'
    import _find from 'lodash.map'

    import LeafletMap from 'components/LeafletMap.vue'
    import FullScreenLoader from 'components/FullScreenLoader.vue'

    export default {
        components: {
            LeafletMap,
            FullScreenLoader
        },

        props: ['urlData'],

        data () {
            return {
                foundTerrain: false,
                playbackData: {},
                terrainConfig: {},
                missionId: this.urlData.params.id,
                tileDomain: {
                    static: 'https://r3tiles-a.titanmods.xyz',
                    dynamic: 'https://r3tiles-{s}.titanmods.xyz' // sub domain support for faster loading (non http/2 servers)
                },
                loading: true,
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
                }
            }
        },

        created () {

            console.log('urlData', this.urlData)

            if (this.urlData.params.terrain == null)
                return this.errorReturnToMissionList('No terrain specified in URL!?')

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

                        console.log('Got terrain config', response.data);

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

                        console.log('Got mission info', response.data);

                        this.completeLoadingStage('missionInfo')

                        this.fetchMissionEvents()
                    })
                    .catch(error => {

                        console.error('Error fetching mission info', error)

                        if (error.response.status == 403)
                            this.errorReturnToMissionList('That mission is still in progress')
                        else
                            this.errorReturnToMissionList('That mission cannot be found!')
                    })
            },

            fetchMissionEvents () {

                axios.get(`/events/${this.missionId}`)
                    .then(response => {

                        console.log('Got mission events', response.data.length);

                        this.completeLoadingStage('missionEvents')
                    })
                    .catch(error => {

                        console.error('Error fetching mission events', error)

                        if (error.response.status == 403)
                            this.errorReturnToMissionList('That mission is still in progress')
                        else
                            this.errorReturnToMissionList('Error loading mission events')
                    })
            },

            completeLoadingStage (stageType) {

                console.log('completing stage', stageType)

                this.loadingStages[stageType].complete = true

                console.log(this.loadingStages)
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
                document.title = (!this.playbackData.missionName)? `Mission Playback - ${this.unitName}` : `${this.playbackData.missionName} - ${this.unitName}`
            },

            loadingStages (stages) {
                console.log('loading stages changed')
                this.loading = (_find(stages, function(stage) { return stage.complete === false; })) ? false : true
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
