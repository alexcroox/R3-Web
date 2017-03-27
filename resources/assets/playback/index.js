import axios from 'http'
import noUiSlider from 'nouislider'
import bus from 'eventBus'

class Playback {

    constructor () {
        this.missionId = 0
        this.maxTime = 0
        this.scrubberConfig = {
            animate: false,
            connect: 'lower',
            step: 1,
            cssPrefix: 'slider__'
        }
        this.paused = false
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

    initScrubber (min, max) {

        console.log('Playback: init scrubber')

        this.maxTime = max

        this.scrubberConfig.range = {
            'min': 0,
            'max': this.maxTime
        }

        this.scrubberConfig.start = 0

        this.scrubber = document.getElementById('slider__rail')
        noUiSlider.create(this.scrubber, this.scrubberConfig)
    }

    changeSpeed (speed) {

    }

    toggle () {

        bus.$emit('paused', this.paused)
    }
}

export default new Playback
