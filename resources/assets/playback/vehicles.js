import _keyBy from 'lodash.keyby'
import _groupBy from 'lodash.groupby'
import axios from 'http'

class Vehicles {

    constructor () {
        this.entities = {}
        this.positions = {}
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

        console.log('loading positions', missionId)

        return new Promise((resolve, reject) => {

            axios.get(`/positions/vehicle/${missionId}`)
                .then(response => {

                    console.log('Vehicles: Got vehicle positions', response.data.length);

                    // Group positional data by mission time
                    this.positions = _groupBy(response.data, (pos) => { return pos.mission_time })

                    resolve()
                })
                .catch(error => {

                    console.error('Vehicles: Error fetching vehicle positions', error)

                    reject()
                })
        })
    }
}

export default new Vehicles
