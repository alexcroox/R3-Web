import axios from 'http'
import bus from 'eventBus'

import Playback from './index'
import Time from './time'
import Map from './map'

class Share {

    getLink () {

        Time.pause()

        return new Promise((resolve, reject) => {

            let rawShareUrl = `${window.location.origin}/${Playback.missionInfo.id}/${Playback.missionInfo.terrain}/${Playback.missionInfo.slug}?share`

            let mapCenter = Map.handler.getCenter()
            rawShareUrl += `&centerLat=${mapCenter.lat}`
            rawShareUrl += `&centerLng=${mapCenter.lng}`

            rawShareUrl += `&zoom=${Map.handler.getZoom()}`
            rawShareUrl += `&time=${Time.currentMissionTime}`
            rawShareUrl += `&speed=${Time.speed}`

            if (Playback.highlightUnit)
                rawShareUrl += `&track=${Playback.highlightUnit}`

            console.log('Share: rawShareUrl', rawShareUrl)

            axios.post(`/shares`, {
                mission: Playback.missionInfo.id,
                url: rawShareUrl
            }).then(response => {
                console.log('Share: Got share link', response.data);

                if (response.data.id)
                    resolve(`${window.location.origin}/share/${response.data.id}`)
                else
                    reject('Failed to get share URL')
            })
            .catch(error => {
                console.error('Share: Failed to get URL', error)
                reject('Failed to get share URL')
            })
        })
    }

    load (shareSettings) {

        if (shareSettings.speed)
            bus.$emit('changeSpeed', parseInt(shareSettings.speed))

        if (shareSettings.centerLat)
            Map.setView([shareSettings.centerLat, shareSettings.centerLng], shareSettings.zoom)

        if (typeof shareSettings.time !== "undefined")
            Time.skipTime(parseInt(shareSettings.time))
        else
            Time.play()

        if (typeof shareSettings.track !== "undefined")
            Playback.startHighlightingUnit(shareSettings.track)
    }
}

export default new Share
