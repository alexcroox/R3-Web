import _keyBy from 'lodash.keyby'
import _defaults from 'lodash.defaults'
import _each from 'lodash.foreach'
import axios from 'http'
import L from 'leaflet'
import 'leaflet-rotatedmarker'

import Playback from './index'
import Map from './map'
import Time from './time'
import { gameToMapPosX, gameToMapPosY } from './helpers/gameToMapPos'
import getFactionData from './helpers/getFactionData'
import shortestRotation from './helpers/shortestRotation'

class Infantry {

    constructor () {
        this.entities = {}
        this.positions = {}
        this.layer
    }

    loadEntities (missionId) {

        return new Promise((resolve, reject) => {
            axios.get(`/infantry/${missionId}`)
                .then(response => {

                    console.log('Infantry: Got infantry', response.data.length);

                    let data = response.data

                    this.entities = _keyBy(data, 'entity_id')

                    resolve()
                })
                .catch(error => {

                    console.error('Infantry: Error fetching mission infantry', error)

                    reject()
                })
        })
    }

    loadPositions (missionId) {

        return new Promise((resolve, reject) => {

            axios.get(`/positions/infantry/${missionId}`)
                .then(response => {

                    console.log('Infantry: Got infantry positions', response.data.length);

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

                    console.error('Infantry: Error fetching infantry positions', error)

                    reject()
                })
        })
    }

    // Lets look over what we have on the map and decide
    // if we need to remove anything
    reviewExistingMarkers () {

        _each(this.entities, entity => {

            // Auto cleanup dead vehicles
            // TODO make this optional
            if (
                entity.hasOwnProperty('dead') &&
                entity.dead &&
                Time.currentMissionTime - entity.missionTimeLastUpdated > (Time.speed * 5)
            )
                this.removeEntity(entity)
        })
    }

    removeEntity (entity) {

        console.warn('Vehicles: removing old layer', entity.icon)

        this.layer.removeLayer(entity.layer)
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
            console.warn('Infantry: unknown entity', posData.entity_id)
            return
        }

        let entity = this.entities[posData.entity_id]

        // Has this entity ever been on the map?
        if (!entity.hasOwnProperty('layer'))
            this.addEntityToMap(entity)

        // Has this entity been on the map, but isn't right now?
        if (!this.layer.hasLayer(entity.layer))
            this.layer.addLayer(entity.layer)

        // Store when we last moved this unit so we can decide to clean up later
        entity.missionTimeLastUpdated = posData.mission_time

        let mapPosition = Map.rc.unproject([posData.x, posData.y])

        // Update entity position
        entity.layer.setLatLng(mapPosition)

        // Update rotation
        this.setEntityRotation(entity, posData.direction)

        // Let's move the view to the starting area
        if (!Playback.centeredOnFirstPlayer && this.isPlayer(entity)) {

            Map.setView(mapPosition, 4)
            Playback.centeredOnFirstPlayer = true
        }
    }

    setEntityRotation (entity, newAngle) {

        // No point calculating for a rotation change if they are
        // facing the same direction
        if(newAngle == entity.currentAngle)
            return

        //let smoothAngle = shortestRotation(entity.currentAngle, newAngle);

        //console.log(`${entity.currentAngle} - ${newAngle} - ${smoothAngle}`)

        entity.currentAngle = newAngle

        entity.layer.setRotationAngle(newAngle);
    }

    addEntityToMap (entity) {

        let entityIcon = entity.icon
        let factionData = getFactionData(entity.faction)

        // Our unit marker image
        let icon = L.icon(_defaults({
            iconUrl: `${Map.iconMarkerDefaults.iconUrl}/${entityIcon}-${factionData.name}.png`
        }, Map.iconMarkerDefaults))

        let marker = L.marker([0,0], { icon })

        let label = (this.isPlayer(entity)) ? entity.name : false

        if (label)
            marker.bindTooltip(label, {
                className: `map__label map__label__infantry`
            })

        // Create the marker, we aren't going to add it to the map
        // just yet so the position isn't important
        entity.layer = marker
    }

    isPlayer (entity) {

        return (entity.player_id != "" && entity.player_id != "_SP_AI_") ? true : false
    }

    // If the unit is on the map lets remove it as
    // it is now in a vehicle
    getIn (entityId) {

        if (
            this.entities.hasOwnProperty(entityId) &&
            this.entities[entityId].hasOwnProperty('layer') &&
            this.layer.hasLayer(this.entities[entityId].layer)
        )
            this.layer.removeLayer(this.entities[entityId].layer)
    }

    getPlayers () {

        return new Promise((resolve, reject) => {

            let players = []

            _each(this.entities, entity => {

                // Is this unit a player?
                if (this.isPlayer(entity))
                    players.push(entity)
            })

            resolve(players)
        })
    }

    initMapLayer () {

        this.layer = new L.LayerGroup()
        this.layer.addTo(Map.handler)
    }

    clearMarkers () {

    }
}

export default new Infantry
