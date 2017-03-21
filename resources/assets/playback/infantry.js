import _keyBy from 'lodash.keyby'
import _groupBy from 'lodash.groupby'
import axios from 'http'

class Infantry {

    constructor () {
        this.entities = {}
        this.positions = []
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

                    // Group positional data by mission time
                    this.positions = _groupBy(response.data, (pos) => { return pos.mission_time })

                    resolve()
                })
                .catch(error => {

                    console.error('Infantry: Error fetching infantry positions', error)

                    reject()
                })
        })
    }
}

export default new Infantry
