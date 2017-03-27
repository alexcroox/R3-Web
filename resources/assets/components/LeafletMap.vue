<template>
    <div id="map" v-bind:style="{ backgroundColor: terrainConfig.bgColor }">

    </div>
</template>

<script>
    import L from 'leaflet'
    import RasterCoords from 'leaflet-rastercoords'

    import errorTile from 'images/map/error-tile.png'

    import Poi from 'playback/poi'

    export default {
        props: ['terrainConfig', 'tileDomain', 'iconDomain'],

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

                let poi = new Poi(
                    this.terrainConfig,
                    this.map,
                    this.rc,
                    this.tileDomain,
                    this.iconDomain)

                poi.load()
            }
        }
    }
</script>

<style lang="stylus">
    @import '~leaflet/dist/leaflet.css'

    #map
        position relative
        width 100%
        height 100%
        background-color #C7E6FC
        z-index 1

    .leaflet-control-zoom
        @media (max-width 450px)
            display none

    .map__label
        background-clip padding-box
        color #000
        display block
        font 11px/22px "Helvetica Neue", Arial, Helvetica, sans-serif
        font-weight bold
        margin-top 4px
        padding 0 0 0 10px
        border none
        background none
        position absolute
        user-select none
        pointer-events none
        white-space nowrap
        z-index 6

    .map__label__poi
        padding 0
        line-height 0px
        font-size 11px
        color #444

    .map__label__poi--namelocal
        color #71624d

    .map__label__poi--namemarine
        color #2471c6

    .map__label__poi--viewpoint
        color #c7010e

    .map__label__poi--strongpointarea
    .map__label__poi--airport
        color #607c4f

</style>
