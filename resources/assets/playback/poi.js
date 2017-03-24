import axios from 'http'
import { each as λeach } from 'contra'
import _each from 'lodash.foreach'
import L from 'leaflet'
import gameToMapPos from './gameToMapPos'

class Poi {

    constructor (terrainConfig, map, rc, tileDomain) {
        this.tileDomain = tileDomain
        this.map = map
        this.rc = rc
        this.terrainConfig = terrainConfig
        this.layers = []
    }

    load () {

        axios.get(`${this.tileDomain.static}/${this.terrainConfig.name}/poi.json`)
            .then(response => {

                let data = response.data

                if (data.length)
                    this.addToMap(data)
            })
            .catch(error => {
                console.warn(`POI: ${this.terrainConfig.name} has no town labels, would you like to <a href="">add some?</a>`, error)
            })
    }

    addToMap (data) {

        λeach(data, (item, cb) => {

            let lg

            // Setup layer group for the type so we can toggle it's visibility based on zoom levels
            if (this.layers[item.type] === null) {

                lg = new L.featureGroup([])

                lg.addTo(this.map)

                this.layers[item.type] = lg

            } else {
                lg = this.layers[item.type]
            }

            // In previous versions of R3 we had support for rock areas etc
            // Therefore we still use L.icon in case a need to show icons along
            // side the labels arises again
            let poiIconName = 'blank'
            let poiOffset = [0, 0]
            let iconSize = [30, 30]
            let iconAnchor = [15, 15]

            let poiIcon = L.icon({
                iconUrl: `${this.tileDomain.static}/${poiIconName}.png`,
                iconSize: iconSize,
                iconAnchor: iconAnchor,
                className: `poi-image--${item.type}`
            });

            let pos = gameToMapPos({ x: item.x, y: item.y}, this.terrainConfig.height, this.terrainConfig.doubleSize);

            let poiLabel = L.marker(this.rc.unproject([pos[0], pos[1]]), {
                icon: poiIcon,
                clickable: false
            }).bindTooltip(item.label, {
                permanent: true,
                className: `poi poi--poi.type`,
                offset: poiOffset
            });

            lg.addLayer(poiLabel)

            cb()

        }).done(error => {

            if (error)
                return console.warn('POI: Error parsing', error)

            this.map.on('zoomend', this.filterZoomLayers)

            this.filterZoomLayers()
        });
    }

    // To avoid clutter hide smaller town names at higher zoom levels
    filterZoomLayers () {

        let zoom = this.map.getZoom()

        _each(this.layers, (layer, type) => {

            if (zoom < 4 && (type != 'namecitycapital' && type != 'namecity' && type != 'mount'))
                this.map.removeLayer(this.layers[type])

            if (zoom > 3)
                this.layers[type].addTo(this.map)
        });
    }
}

export default Poi
