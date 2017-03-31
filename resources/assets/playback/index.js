import axios from 'http'
import bus from 'eventBus'

class Playback {

    constructor () {

        this.missionId = 0
        this.highlightUnit = 0
        this.trackingHighlightedUnit = false
        this.centeredOnFirstPlayer = false
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

    startHighlightingUnit (entityId) {

        this.highlightUnit = entityId
        this.trackingHighlightedUnit = true
    }

    stopTrackingHighlightedUnit () {

        this.trackingHighlightedUnit = false
    }
}

export default new Playback
