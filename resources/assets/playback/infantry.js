import _keyBy from 'lodash.keyby'
import _groupBy from 'lodash.groupby'

class Infantry {

    constructor () {
        this.entities = {}
        this.positions = []
    }

    loadEntities (data) {

        return new Promise((resolve, reject) => {

            this.entities = _keyBy(data, 'entity_id');
            console.log('Infantry: Entities', this.entities)

            resolve()
        })
    }

    loadPositions (data) {

        return new Promise((resolve, reject) => {

            // Group positional data by mission time
            this.positions = _groupBy(data, (pos) => { return pos.mission_time })
            //console.log('Infantry: Positions', this.positions)

            resolve()
        })
    }
}

export default new Infantry
