import axios from 'http'
import _groupBy from 'lodash.groupby'

class Events {

    constructor () {
        this.list = {}
    }

    load (missionId) {

        return new Promise((resolve, reject) => {

            axios.get(`/events/${missionId}`)
                .then(response => {

                    console.log('Events: Got mission events', response.data.length)

                    this.list = _groupBy(response.data, (event) => { return event.mission_time })

                    resolve()
                })
                .catch(error => {
                    console.error('Error fetching mission events', error)

                    reject(error)
                })
        })
    }
}

export default new Events
