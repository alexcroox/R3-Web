import _keyBy from 'lodash.keyby'
import _groupBy from 'lodash.groupby'
import { each as λeach } from 'contra'
import axios from 'http'
import L from 'leaflet'

import Map from './map'

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

        console.log('loading positions', missionId)

        return new Promise((resolve, reject) => {

            axios.get(`/positions/infantry/${missionId}`)
                .then(response => {

                    console.log('Infantry: Got infantry positions', response.data.length);

                    this.positions = response.data

                    resolve()
                })
                .catch(error => {

                    console.error('Infantry: Error fetching infantry positions', error)

                    reject()
                })
        })
    }

    processTime (missionTime) {

        if (this.positions.hasOwnProperty(missionTime)) {

            λeach(this.positions[missionTime], posData => {

                this.updateEntityPosition(posData)
            })

        } else {

        }
    }

    updateEntityPosition (posData) {

        // Do we know of this entity? If not ignore
        if (!this.entities.hasOwnProperty(posData.entity_id)) {
            console.warn('Infantry: unknown entity', posData.entity_id)
            return
        }

        let entity = this.entities(posData.entity_id)

        // Has this entity ever been on the map?
        if (!entity.hasOwnProperty('layer')) {

            this.addEntityToMap(posData)
        } else {

            // Has this entity been on the map, but isn't right now?
            if (!this.layer.hasLayer(entity.layer))
                this.layer.addLayer(entity.layer)

            // Update entity position
        }
    }

    initMapLayer () {

        this.layer = new L.LayerGroup()
        this.layer.addTo(Map.handler)
    }

    clearMarkers () {

    }
}

export default new Infantry
