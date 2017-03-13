
class Playback {

    constructor (missionData, eventData) {
        this.missionData = missionData
        this.eventData = eventData
    }

    returnNumEvents () {
        return this.eventData.length
    }
}

export default Playback
