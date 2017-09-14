import _keyBy from 'lodash.keyby'
import _defaults from 'lodash.defaults'
import _each from 'lodash.foreach'
import axios from 'http'
import L from 'leaflet'
import 'leaflet-rotatedmarker'

import Map from './map'
import Infantry from './infantry'
import Time from './time'
import { gameToMapPosX, gameToMapPosY } from './helpers/gameToMapPos'
import getFactionData from './helpers/getFactionData'
import shortestRotation from './helpers/shortestRotation'
import emptyEntity from './helpers/emptyEntity'
import calculateVehicleLabel from './helpers/calculateVehicleLabel'

class Vehicles {

    constructor () {
        this.entities = {}
        this.positions = {}
        this.playersInVehicles = {}
        this.icons = {}
        this.timeLastSeenKeyFrame = 10
        this.layer
    }

    loadEntities (missionId) {

        return new Promise((resolve, reject) => {
            axios.get(`/vehicles/${missionId}`)
                .then(response => {

                    console.log('Vehicles: Got vehicles', response.data.length);

                    let data = response.data

                    this.entities = _keyBy(data, 'entity_id')

                    console.log('Vehicles: entities', this.entities)

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

    removeEntity (entity) {

        console.warn('Vehicles: removing old layer', entity.icon)

        this.layer.removeLayer(entity.layer)
    }

    processTime (missionTime) {

        if (this.positions.hasOwnProperty(missionTime)) {

            _each(this.positions[missionTime], posData => {
                // If this is the first key frame we've seen since the last batch
                // lets clear all current markers and prepare for the up to date ones
                // that are about to be added
                if (
                    posData.key_frame == '1' &&
                    (Time.currentMissionTime - this.timeLastSeenKeyFrame > 9)
                ) {
                    this.timeLastSeenKeyFrame = Time.currentMissionTime
                    this.clearMarkers()
                }

                this.updateEntityPosition(posData)
            })
        }
    }

    // To avoid having to wait for up to 20 seconds for all static units to re-appear
    // we must look back in time to find our last key frame and populate the map with
    // that positional data first, then quickly skip ahead to the time we want
    processLastKeyFrame (missionTime) {

        if (missionTime < 1)
            return

        if (this.positions.hasOwnProperty(missionTime) && this.positions[missionTime][0].key_frame == '1') {
            this.processTime(missionTime)
        } else {
            missionTime--
            this.processLastKeyFrame(missionTime)
        }
    }

    updateEntityPosition (posData) {

        // Do we know of this entity? If not ignore
        if (!this.entities.hasOwnProperty(posData.entity_id)) {
            console.warn('Vehicles: unknown entity', posData.entity_id)
            return
        }

        let vehicleEntity = this.entities[posData.entity_id]
        let driver = Infantry.entities[posData.driver]
        let crew = (posData.crew == '')? [] : posData.crew.split(',')
        let cargo = (posData.cargo == '')? [] : posData.cargo.split(',')

        if (driver == null)
            driver = {...emptyEntity}

        if (vehicleEntity.customIcon == null)
            vehicleEntity.customIcon = this.getVehicleIcon(vehicleEntity.icon_path, vehicleEntity.icon)

        let factionData = getFactionData(driver.faction)

        // We need to change a player's icon to the vehicle they are in, lets work
        // out who is in this vehicle and assign this vehicle class to their entity_id
        if (Infantry.isPlayer(driver)) {
            this.playersInVehicles[driver.entity_id] = vehicleEntity.customIcon
        }

        // Set the vehicle icon for all crew members, but skip the driver if duplicated in crew list
        _each(crew, crewEntityId => {
            if (crewEntityId != driver.entity_id) {
                let crewEntity = Infantry.getEntityById(crewEntityId)
                factionData = getFactionData(crewEntity.faction)
                this.playersInVehicles[crewEntityId] = vehicleEntity.customIcon
            }
        })

        _each(cargo, cargoEntityId => {
            let cargoEntity = Infantry.getEntityById(cargoEntityId)
            factionData = getFactionData(cargoEntity.faction)
            this.playersInVehicles[cargoEntityId] = vehicleEntity.customIcon
        })

        // Has this vehicleEntity ever been on the map?
        if (!vehicleEntity.hasOwnProperty('layer'))
            this.addEntityToMap(vehicleEntity, factionData)

        // Has this vehicleEntity been on the map, but isn't right now?
        if (!this.layer.hasLayer(vehicleEntity.layer))
            this.layer.addLayer(vehicleEntity.layer)

        // Store when we last moved this unit so we can decide to clean up later
        vehicleEntity.missionTimeLastUpdated = posData.mission_time

        // Update vehicleEntity position
        vehicleEntity.layer.setLatLng(Map.rc.unproject([posData.x, posData.y]))

        // Update rotation
        this.setEntityRotation(vehicleEntity, posData.direction)

        // Is this unit dead? This helps when skipping back and forth through time
        if (vehicleEntity.dead == null && posData.is_dead == '1') {
            vehicleEntity.dead = true
            vehicleEntity.layer.setOpacity(0.4)
        } else if (vehicleEntity.dead != null && posData.is_dead == '0') {
            vehicleEntity.dead = null
            vehicleEntity.layer.setOpacity(1)
        }

        // Update label
        vehicleEntity.layer.setTooltipContent(calculateVehicleLabel(driver, crew, cargo))

        // Update icon
        let markerIcon = Map.prepareIcon(vehicleEntity.customIcon, factionData)
        vehicleEntity.layer.setIcon(markerIcon)
    }

    setEntityRotation (entity, newAngle) {

        // No point calculating for a rotation change if they are
        // facing the same direction
        if(newAngle == entity.currentAngle)
            return

        //let smoothAngle = shortestRotation(entity.currentAngle, newAngle);

        entity.currentAngle = newAngle

        entity.layer.setRotationAngle(newAngle)
    }

    addEntityToMap (entity, factionData) {

        // We need to store it's current faction to work out
        // if we need to change it's colour on the next position update
        // I.e if an enemy unit jumps in after
        entity.faction = factionData.id

        // Our unit marker image
        let icon = Map.prepareIcon(entity.customIcon, factionData)

        let marker = L.marker([0,0], { icon })

        marker.bindTooltip('', {
            className: `map__label map__label__vehicle`
        })

        // Create the marker, we aren't going to add it to the map
        // just yet so the position isn't important
        entity.layer = marker
    }

    // Infantry has gotten out of vehicle, let's remove them as being in a vehicle
    getOut (entityId) {
        delete this.playersInVehicles[entityId]
    }

    getVehicleIcon (iconPath, defaultIcon) {

        let icon = `${defaultIcon}`

        if (iconPath && this.icons.hasOwnProperty(iconPath.toLowerCase()))
            icon = `${this.icons[iconPath.toLowerCase()]}`

        return icon
    }

    initMapLayer () {

        this.layer = new L.LayerGroup()
        this.layer.addTo(Map.handler)
    }

    clearMarkers () {
        console.log('Clearing vehicle markers')
        this.layer.clearLayers()
        this.playersInVehicles = {}
    }
}

export default new Vehicles
