import axios from 'http'

class Playback {

    constructor () {
        this.missionId = 0
    }

    load (missionId) {

        this.missionId = missionId

        return new Promise((resolve, reject) => {

            axios.get(`/missions/${this.missionId}`)
                .then(response => {

                    console.log('Playback: Got mission info', response.data)

                    this.missionInfo = response.data

                    resolve(response.data)
                })
                .catch(error => {
                    console.error('Error fetching mission info', error)

                    reject(error)
                })
        })
    }
}

export default new Playback
