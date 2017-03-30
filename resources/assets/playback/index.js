import axios from 'http'
import noUiSlider from 'nouislider'
import bus from 'eventBus'
import $ from 'cash-dom'
import _each from 'lodash.foreach'

import Map from './map'
import Infantry from './infantry'
import Vehicles from './vehicles'

class Playback {

    constructor () {

        this.missionId = 0
        this.maxMissionTime = 0
        this.speed = 5
        this.timeJump = 1
        this.now
        this.then = Date.now()
        this.delta
        this.currentMissionTime = 0
        this.scrubberConfig = {
            animate: false,
            connect: 'lower',
            step: 1,
            cssPrefix: 'slider__'
        }
        this.paused = true
        this.ended = false
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

        this.maxMissionTime = max

        this.scrubberConfig.range = {
            'min': 0,
            'max': this.maxMissionTime
        }

        this.scrubberConfig.start = 0

        this.scrubber = document.getElementById('slider__rail')
        noUiSlider.create(this.scrubber, this.scrubberConfig)

        this.scrubber.noUiSlider.on('slide', (value) => this.skipTime(value[0]))
    }

    updateScrubber () {

        this.scrubber.noUiSlider.set(this.currentMissionTime)

        let date = new Date(null)
        date.setSeconds(this.currentMissionTime)

        $('.slider__handle').html('<span class="slider__time">' + date.toISOString().substr(11, 8) + '</span>')

        // Show current mission time left or right of the scrubber handle
        if (parseInt($('.slider__origin').css('left')) > 70)
            $('.slider__handle').addClass('slider__handle--left-time')
        else
            $('.slider__handle').removeClass('slider__handle--left-time')
    }

    skipTime (value) {

        this.currentMissionTime = Math.round(value)

        console.log('Playback: skipping time', this.currentMissionTime)

        // Clear down the map of existing markers, ready to time warp...
        Infantry.clearMarkers()
        //this.controllers.vehicles.clearMarkers()

        this.ended = false
        bus.$emit('ended', this.ended)

        if (this.paused)
            this.play()
    }

    changeSpeed (speed) {

        this.speed = speed

        // If we increase the speed too much chances are the browser can't
        // keep up with the rendering so we need to start skipping events entirely
        // TODO: Need to avoid skipping events, just positional updates
        if (this.speed > 30)
            this.timeJump = 5
        else
            this.timeJump = 1
    }

    toggle () {

        if (this.ended) {
            this.skipTime(0)
            return
        }

        if (this.paused)
            this.play()
        else
            this.pause()
    }

    play () {

        console.log('Playback: playing...')

        this.paused = false
        this.ended = false

        bus.$emit('paused', this.paused)
        bus.$emit('ended', this.ended)

        this.animationLoop()
    }

    pause () {

        console.log('Playback: paused')

        this.paused = true

        bus.$emit('paused', this.paused)
    }

    end () {

        this.pause()

        this.ended = true
        bus.$emit('ended', this.ended)
    }

    processAllEvents () {

        console.log('Playback: procesing events', this.currentMissionTime)

        Infantry.processTime(this.currentMissionTime)

        this.currentMissionTime += this.timeJump
    }

    animationLoop () {

        if (this.paused)
            return

        // Let's show events as fast as the browser can render them to avoid choking
        // Especially useful on mobile / weaker CPUs
        window.requestAnimationFrame(this.animationLoop.bind(this))

        this.now = Date.now()
        this.delta = this.now - this.then

        let interval = 1000 / this.speed

        // TODO
        let mapZooming = false

        if (this.delta > interval && !mapZooming) {

            this.updateScrubber()

            if (this.currentMissionTime >= this.maxMissionTime)
                this.end()
            else
                this.processAllEvents()

            this.then = this.now - (this.delta % interval)
        }
    }
}

export default new Playback
