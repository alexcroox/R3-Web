import L from 'leaflet'
import RasterCoords from 'leaflet-rastercoords'
import errorTile from 'images/map/error-tile.png'

import Poi from './poi'
import Playback from './index'

// Defaults for our tooltips
L.Tooltip.mergeOptions({
    direction: 'right',
    permanent: true
})

L.Marker.mergeOptions({
    interactive: false,
    keyboard: false,
    rotationAngle: 0,
    rotationOrigin: '50% 50%'
})

class Map {

    constructor () {

        this.hander = {}
        this.zooming = false
        this.currentZoom = 0

        // Raster coordinates, used for mapping game to browser positions
        this.rc = null

        // Defaults for our map markers
        this.iconMarkerDefaults = {
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            iconUrl: ''
        }
    }

    render (terrainConfig, tileDomain, iconDomain) {

        this.terrainConfig = terrainConfig
        this.tileDomain = tileDomain
        this.iconDomain = iconDomain

        this.iconMarkerDefaults.iconUrl = iconDomain

        console.log('Map: Rendering ', this.terrainConfig.name)

        this.handler = new L.Map('map', {
            minZoom: this.terrainConfig.minZoom,
            maxNativeZoom: this.terrainConfig.maxZoom,
            maxZoom: 10,
            zoom: this.terrainConfig.initZoom,
            attributionControl: false,
            zoomControl: false,
            zoomAnimation: true,
            fadeAnimation: true,
        })

        this.rc = new RasterCoords(this.handler, [this.terrainConfig.width, this.terrainConfig.height])

        // Set the bounds on the map, give us plenty of padding to avoid a map bouncing loop
        let southWest = this.rc.unproject([0, this.terrainConfig.height])
        let northEast = this.rc.unproject([this.terrainConfig.width, 0])

        let mapBounds = new L.LatLngBounds(southWest, northEast)
        let panningBounds = mapBounds.pad(1)

        this.handler.setMaxBounds(panningBounds)

        // We need to set an initial view for the tiles to render (center of terrain)
        this.setView(this.rc.unproject([this.terrainConfig.height / 2, this.terrainConfig.width / 2]), this.terrainConfig.initZoom)

        this.addHandlers()
        this.loadTiles()
        Poi.load()
    }

    addHandlers () {

        this.handler.on('zoomstart', () => this.zooming = true)
        this.handler.on('zoomend', () => this.zooming = false)

        this.handler.on('dragstart', (e) => Playback.stopTrackingHighlightedUnit())
    }

    loadTiles () {

        // Add our terrain generated tiles
        this.tileLayer = L.tileLayer(`${this.tileDomain.dynamic}/${this.terrainConfig.name}/tiles/{z}/{x}/{y}.png`, {
            noWrap: true,
            maxNativeZoom: this.terrainConfig.maxZoom,
            maxZoom: 10,
            errorTileUrl: errorTile
        }).addTo(this.handler);
    }

    // Move map viewport to certain position and zoom
    // position must be pre-projected
    setView (position, zoom) {

        console.log(`LeafletMap: Setting zoom ${zoom} on position `, position)

        this.handler.setView(position, zoom)

        this.currentZoom = zoom
    }
}

export default new Map
