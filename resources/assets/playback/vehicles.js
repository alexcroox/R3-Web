import _keyBy from 'lodash.keyby'
import _defaults from 'lodash.defaults'
import _each from 'lodash.foreach'
import axios from 'http'
import L from 'leaflet'
import 'leaflet-rotatedmarker'

import Map from './map'
import Infantry from './infantry'
import { gameToMapPosX, gameToMapPosY } from './helpers/gameToMapPos'
import getFactionData from './helpers/getFactionData'
import shortestRotation from './helpers/shortestRotation'

class Vehicles {

    constructor () {
        this.entities = {}
        this.positions = {}
        this.layer
    }

    loadEntities (missionId) {

        return new Promise((resolve, reject) => {
            axios.get(`/vehicles/${missionId}`)
                .then(response => {

                    console.log('Vehicles: Got vehicles', response.data.length);

                    let data = response.data

                    this.entities = _keyBy(data, 'entity_id')

                    resolve()
                })
                .catch(error => {

                    console.error('Vehicles: Error fetching mission vehicles', error)

                    reject()
                })
        })
    }

    loadPositions (missionId) {

        return new Promise((resolve, reject) => {

            axios.get(`/positions/vehicle/${missionId}`)
                .then(response => {

                    console.log('Vehicles: Got vehicle positions', response.data.length);

                    this.positions = response.data

                    // Pre-map all game points to map points to save processing time later
                    _each(this.positions, timeGroup => {

                        _each(timeGroup, pos => {

                            pos.x = gameToMapPosX(pos.x)
                            pos.y = gameToMapPosY(pos.y)

                        })

                    })

                    resolve()
                })
                .catch(error => {

                    console.error('Vehicles: Error fetching vehicle positions', error)

                    reject()
                })
        })
    }

    processTime (missionTime) {

        if (this.positions.hasOwnProperty(missionTime)) {

            _each(this.positions[missionTime], posData => {

                this.updateEntityPosition(posData)
            })

        }
    }

    updateEntityPosition (posData) {

        // Do we know of this entity? If not ignore
        if (!this.entities.hasOwnProperty(posData.entity_id)) {
            console.warn('Vehicles: unknown entity', posData.entity_id)
            return
        }

        // Do we know of the driver?
        if (!Infantry.entities.hasOwnProperty(posData.driver)) {
            console.warn('Vehicles: unknown driver', posData.driver)
            return
        }

        let entity = this.entities[posData.entity_id]
        let driver = Infantry.entities[posData.driver]

        // Has this entity ever been on the map?
        if (!entity.hasOwnProperty('layer'))
            this.addEntityToMap(entity, driver)

        // Has this entity been on the map, but isn't right now?
        if (!this.layer.hasLayer(entity.layer))
            this.layer.addLayer(entity.layer)

        // Update entity position
        entity.layer.setLatLng(Map.rc.unproject([posData.x, posData.y]))

        // Update rotation
        this.setEntityRotation(entity, posData.direction)
    }

    setEntityRotation (entity, newAngle) {

        // No point calculating for a rotation change if they are
        // facing the same direction
        if(newAngle == entity.currentAngle)
            return

        //let smoothAngle = shortestRotation(entity.currentAngle, newAngle);

        entity.currentAngle = newAngle

        entity.layer.setRotationAngle(newAngle);
    }

    addEntityToMap (entity, driver) {

        let entityIcon = entity.icon
        let factionData = getFactionData(driver.faction)

        // We need to store it's current faction to work out
        // if we need to change it's colour on the next position update
        // I.e if an enemy unit jumps in after
        entity.faction = driver.faction

        // Our unit marker image
        let icon = L.icon(_defaults({
            iconUrl: `${Map.iconMarkerDefaults.iconUrl}/${entityIcon}-${factionData.name}.png`
        }, Map.iconMarkerDefaults))

        let marker = L.marker([0,0], { icon })

        let label = (driver.player_id != "" && driver.player_id != "_SP_AI_") ? driver.name : false

        if (label)
            marker.bindTooltip(label, {
                className: `map__label map__label__vehicle`
            })

        // Create the marker, we aren't going to add it to the map
        // just yet so the position isn't important
        entity.layer = marker
    }

    initMapLayer () {

        this.layer = new L.LayerGroup()
        this.layer.addTo(Map.handler)
    }

    clearMarkers () {

    }
}

export default new Vehicles
