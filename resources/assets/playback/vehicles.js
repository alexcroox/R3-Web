import _keyBy from 'lodash.keyby'

class Vehicles {

    constructor () {
        this.entities = {}
        this.positions = []
    }

    loadEntities (data) {

        return new Promise((resolve, reject) => {

            this.entities = _keyBy(data, 'entity_id');
            console.log('Vehicles: Entities', this.entities)

            resolve()
        })
    }

    loadPositions (data) {

        return new Promise((resolve, reject) => {

            // Group positional data by mission time
            this.positions = _groupBy(data, (pos) => { return pos.mission_time })
            //console.log('Vehicles: Positions', this.positions)

            resolve()
        })
    }
}

export default new Vehicles
