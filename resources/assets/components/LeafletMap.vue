<template>
    <div id="map" v-bind:style="{ backgroundColor: terrainConfig.bgColor }">

    </div>
</template>

<script>
    import L from 'leaflet'
    import 'leaflet/dist/leaflet.css'
    import RasterCoords from 'leaflet-rastercoords'
    import axios from 'http'

    import errorTile from 'images/map/error-tile.png'

    export default {
        props: ['terrainConfig', 'tileDomain'],

        data () {
            return {
                map: {},
                zooming: false,
                rc: null, // Raster coordinates, used for mapping game to browser positions
                currentZoom: this.terrainConfig.initZoom
            }
        },

        mounted () {

            this.render()
        },

        methods: {

            render () {

                console.log('LeafletMap: Rendering ', this.terrainConfig.name)

                this.map = new L.Map('map', {
                    minZoom: this.terrainConfig.minZoom,
                    maxNativeZoom: this.terrainConfig.maxZoom,
                    maxZoom: 10,
                    zoom: this.terrainConfig.initZoom,
                    attributionControl: false,
                    zoomControl: false,
                    zoomAnimation: true,
                    fadeAnimation: true,
                })

                this.rc = new RasterCoords(this.map, [this.terrainConfig.width, this.terrainConfig.height])

                // Set the bounds on the map, give us plenty of padding to avoid a map bouncing loop
                let southWest = this.rc.unproject([0, this.terrainConfig.height])
                let northEast = this.rc.unproject([this.terrainConfig.width, 0])

                let mapBounds = new L.LatLngBounds(southWest, northEast)
                let panningBounds = mapBounds.pad(1)

                this.map.setMaxBounds(panningBounds)

                // We need to set an initial view for the tiles to render (center of terrain)
                this.setView([this.terrainConfig.height / 2, this.terrainConfig.width / 2], this.terrainConfig.initZoom)

                this.loadTiles()
                this.loadPoi()
            },

            loadTiles () {

                // Add our terrain generated tiles
                this.layer = L.tileLayer(`${this.tileDomain.dynamic}/${this.terrainConfig.name}/tiles/{z}/{x}/{y}.png`, {
                    noWrap: true,
                    maxNativeZoom: this.terrainConfig.maxZoom,
                    maxZoom: 10,
                    errorTileUrl: errorTile
                }).addTo(this.map);
            },

            // Move map viewport to certain position and zoom
            setView (pos, zoom) {

                console.log(`LeafletMap: Setting zoom ${zoom} on pos `, pos)

                this.map.setView(this.rc.unproject(pos), zoom);
            },

            loadPoi () {

                axios.get(`${this.tileDomain.static}/${this.terrainConfig.name}/poi.json`)
                    .then(response => {

                        let poiData = response.data

                        console.log('poi data', poiData)
                    })
                    .catch(error => {
                        console.warn(`${this.terrainConfig.name} has no POI, would you like to <a href="">add some?</a>`)
                    })
            }
        }
    }
</script>

<style lang="stylus">
    #map
        position relative
        width 100%
        height 100%
        background-color #C7E6FC
        z-index 1

    .leaflet-control-zoom
        @media (max-width 450px)
            display none
</style>
