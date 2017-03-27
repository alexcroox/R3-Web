import axios from 'http'

class Events {

    constructor () {
        this.list = []
    }

    load (missionId) {

        return new Promise((resolve, reject) => {

            axios.get(`/events/${missionId}`)
                .then(response => {

                    console.log('Events: Got mission events', response.data.length)

                    this.list = response.data

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
