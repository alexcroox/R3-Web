import axios from 'http'
import _groupBy from 'lodash.groupby'
import _each from 'lodash.foreach'
import _defaults from 'lodash.defaults'
import L from 'leaflet'
import moment from 'moment'

import Playback from './index'
import Map from './map'
import Infantry from './infantry'
import Vehicles from './vehicles'
import getFactionData from './helpers/getFactionData'

import bus from 'eventBus'

class PlaybackEvents {

    constructor () {
        this.list = {}
    }

    load (missionId) {

        return new Promise((resolve, reject) => {

            axios.get(`/events/${missionId}`)
                .then(response => {

                    this.list = _groupBy(response.data, (event) => { return event.mission_time })

                    console.log('Events: Got mission events', this.list)

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

                console.log(event.type, event)

                switch (event.type) {

                    case "get_in":

                        Infantry.getIn(event.entity_unit)

                        break

                    case "get_out":

                        Vehicles.getOut(event.entity_unit)

                        break

                    case "killed":
                    case "unconscious":

                        this.killed(event)

                        break

                    case "awake":

                        Infantry.awake(event.entity_victim)

                        break

                    case "missile":
                    case "rocket":

                        this.selfPropelledLaunch(event)

                        break

                    case "grenade":
                    case "smoke":

                        this.projectileLaunch(event)

                        break

                    case "connect":
                    case "disconnect":

                        bus.$emit('notification', {
                            message: `<span class="uppercase">${event.player_name}</span> ${event.type}ed`,
                            type: 'info',
                            position: false,
                            entityId: false
                        })

                        break
                }
            })

        }
    }

    killed (event) {

        let attacker = Playback.findEntity(event.entity_attacker, false)
        let attackerOnMap = Playback.findEntity(event.entity_attacker, true)
        let victim = Playback.findEntity(event.entity_victim, false)
        let victimOnMap = Playback.findEntity(event.entity_victim, true)

        // Draw a kill line between attacker and victim if
        // both exist on the map
        if (attackerOnMap && victimOnMap) {

            let lineData = [attackerOnMap.layer.getLatLng(), victimOnMap.layer.getLatLng()]

            // Work out our attackerOnMap faction's line color
            let factionData = getFactionData(attackerOnMap.faction);
            let lineColor = factionData.color;

            // Draw a line between attackerOnMap and victimOnMap
            let killLine = L.polyline(lineData, {
                color: lineColor,
                weight: 1,
                interactive: false
            }).addTo(Map.handler);

            let lineCreatedTime = moment()

            let trackAnchorLine = () => {

                let lineData = [attackerOnMap.layer.getLatLng(), victimOnMap.layer.getLatLng()]

                killLine.setLatLngs(lineData)

                let timeLineAlive = moment().diff(lineCreatedTime, 'milliseconds')

                if (timeLineAlive >= 1000)
                    Map.handler.removeLayer(killLine);
                else
                    window.requestAnimationFrame(trackAnchorLine)
            }

            trackAnchorLine()

            if (event.type == "unconscious")
                victimOnMap.unconscious = true
            else if (event.type == "killed")
                victimOnMap.dead = true

            victimOnMap.layer.setOpacity(0.4)
        }

        // If an AI was killed by a player or vice versa show notification
        if (!victim.isPlayer && !attacker.isPlayer)
            return

        let type = (victim.isPlayer)? 'kill-player' : 'kill-ai'

        // Position is used to focus on the victim if the event is clicked and
        // we time travel to focus on the event
        let position = victim.layer.getLatLng()
        let entityId = (victim.isPlayer)? victim.entity_id : attacker.entity_id

        let victimName = (victim.isPlayer)? victim.name : victim.class
        let victimHighlightClass = (victim.isPlayer)? 'uppercase' : ''

        let attackerName = (attacker.isPlayer)? attacker.name : attacker.class
        let attackerHighlightClass = (attacker.isPlayer)? 'uppercase' : ''

        bus.$emit('notification', {
            message: `
                <span class="${victimHighlightClass}">${victimName}</span>
                was killed by
                <span class="${attackerHighlightClass}">${attackerName}</span>`,
            type,
            position,
            entityId
        })
    }

    // Missile or rocket launch
    selfPropelledLaunch (event) {

        let attacker = Playback.findEntity(event.entity_attacker, true)
        let victim = Playback.findEntity(event.entity_victim, true)

        if (attacker) {

            let launchPosition = attacker.layer.getLatLng()

            this.pulseCircle(launchPosition)

            // Animate a M m m towards victim
            if (victim) {

                let victimPosition = victim.layer.getLatLng()

                console.log(event.type)

                let icon = L.icon(_defaults({
                    iconUrl: `${Map.iconMarkerDefaults.iconUrl}/${event.type}.png`,
                    className: `projectile__${event.type}`
                }, Map.iconMarkerDefaults))

                let projectileIcon = L.marker(launchPosition, {
                    icon,
                    interactive: false
                }).addTo(Map.handler)

                setTimeout(() => projectileIcon.setLatLng(victimPosition), 50)
                setTimeout(() => Map.handler.removeLayer(projectileIcon), 1000)

                // Position is used to focus on the victim if the event is clicked and
                // we time travel to focus on the event
                if (!victim.isPlayer)
                    return

                bus.$emit('notification', {
                    message: `${event.type} launch at <span class="uppercase">${victim.name}</span>`,
                    type: 'self-propelled-launch',
                    position: victimPosition,
                    entityId: victim.entity_id
                })
            }
        }
    }

    // Pulse a large circle around the attacker
    pulseCircle (launchPosition, color = 'red', className = 'projectile__launch-pulse') {

        let launchPulse = L.circle(launchPosition, 50, {
            weight: 1,
            color,
            fillColor: '#f03',
            fillOpacity: 0.5,
            className,
            interactive: false
        }).addTo(Map.handler)

        setTimeout(() => Map.handler.removeLayer(launchPulse), 1000)
    }

    // Throwing or firing HE or Smoke
    // Pulse a large circle around the attacker and animate a smoke or explosion
    // where the projectile lands
    projectileLaunch (event) {

        let attacker = Playback.findEntity(event.entity_attacker, true)

        if (attacker) {

            let launchPosition = attacker.layer.getLatLng()

            this.pulseCircle(launchPosition, 'black')

            let projectileExplodePosition = Map.rc.unproject([event.x, event.y])

            if (event.type == 'grenade') {

                console.warn('nade', projectileExplodePosition);

                let explodePulse = L.circle(projectileExplodePosition, 15, {
                    weight: 1,
                    color: 'black',
                    opacity: 0.6,
                    fill: true,
                    className: 'projectile__grenade',
                    clickable: false
                }).addTo(Map.handler)

                setTimeout(() => Map.handler.removeLayer(explodePulse), 1000)

            } else {

                let color = '#CCC';
                let projectileName = event.projectile_name.toLowerCase()

                if(projectileName.indexOf('purple') > -1)
                    color = 'purple';

                if(projectileName.indexOf('green') > -1)
                    color = 'green';

                if(projectileName.indexOf('red') > -1)
                    color = 'red';

                if(projectileName.indexOf('blue') > -1)
                    color = 'blue';

                console.warn(projectileName, color);

                let smokeCircle = L.circle(projectileExplodePosition, 50, {
                    weight: 40,
                    color: color,
                    opacity: 0.5,
                    className: 'projectile__smoke',
                    clickable: false
                }).addTo(Map.handler);

                setTimeout(() => Map.handler.removeLayer(smokeCircle), 5000)
            }

            // Position is used to focus on the victim if the event is clicked and
            // we time travel to focus on the event
            if (!attacker.isPlayer)
                return

            bus.$emit('notification', {
                message: `<span class="uppercase">${attacker.name}</span> fired ${event.projectile_name}`,
                type: 'projectile-launch',
                position: launchPosition,
                entityId: attacker.entity_id
            })
        }
    }
}

export default new PlaybackEvents
