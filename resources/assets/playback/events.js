import axios from 'http'
import _groupBy from 'lodash.groupby'
import _each from 'lodash.foreach'
import L from 'leaflet'
import moment from 'moment'

import Playback from './index'
import Map from './map'
import Infantry from './infantry'
import Vehicles from './vehicles'
import getFactionData from './helpers/getFactionData'

class PlaybackEvents {

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

    processTime (missionTime) {

        if (this.list.hasOwnProperty(missionTime)) {

            _each(this.list[missionTime], event => {

                switch (event.type) {

                    case "get_in":

                        Infantry.getIn(event.entity_unit)

                        break

                    case "killed":
                    case "unconscious":

                        this.killed(event)

                        break

                    case "awake":

                        break
                }
            })

        }
    }

    killed (event) {

        let attacker = Playback.findEntity(event.entity_attacker, true)
        let victim = Playback.findEntity(event.entity_victim, true)

        // Draw a kill line between attacker and victim if
        // both exist on the map
        if (attacker && victim) {

            let lineData = [attacker.layer.getLatLng(), victim.layer.getLatLng()]

            // Work out our attacker faction's line color
            let factionData = getFactionData(attacker.faction);
            let lineColor = factionData.color;

            // Draw a line between attacker and victim
            let killLine = L.polyline(lineData, {
                color: lineColor,
                weight: 1,
                interactive: false
            }).addTo(Map.handler);

            let lineCreatedTime = moment()

            let trackAnchorLine = () => {

                let lineData = [attacker.layer.getLatLng(), victim.layer.getLatLng()]

                killLine.setLatLngs(lineData)

                let timeLineAlive = moment().diff(lineCreatedTime, 'milliseconds')

                if (timeLineAlive >= 1000)
                    Map.handler.removeLayer(killLine);
                else
                    window.requestAnimationFrame(trackAnchorLine)
            }

            trackAnchorLine()

            victim.dead = true
            victim.layer.setOpacity(0.4)
        }
    }
}

export default new PlaybackEvents
