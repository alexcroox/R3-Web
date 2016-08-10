function PlayBack() {

    this.trackTarget = false;
    this.zoomedToFirstPlayer = false;
};

PlayBack.prototype.init = function(replayDetails, sharedPresets, cacheAvailable) {

    var self = this;

    this.replayDetails = JSON.parse(replayDetails);
    this.sharedPresets = JSON.parse(sharedPresets);

    // Setup map with our chosen terrain
    map.init(this.replayDetails.map, this.replayDetails.tileSubDomains, function(error) {

        if (error)
            return;

        // Fetch our event data from the server
        self.fetch(cacheAvailable);
    });
}

PlayBack.prototype.fetch = function(cacheAvailable) {

    var eventSourceUrl = (!cacheAvailable) ? webPath + '/fetch-data' : webPath + '/cache/events/' + this.replayDetails.id + '.json';
    var fetchType = (!cacheAvailable) ? 'POST' : 'GET';

    var self = this;

    $.ajax({
        url: eventSourceUrl,
        type: fetchType,
        dataType: 'json',
        data: { "id": this.replayDetails.id },
        success: this.prepData.bind(self),
        error: function(jq, status, message) {
            console.log('Error fetching playback data - Status: ' + status + ' - Message: ' + message);
        }
    });
};

PlayBack.prototype.prepData = function(eventList) {

    var self = this;

    markers.setupLayers();

    // Calculate our time range and combine events with the same mission time
    _.each(eventList, function(e) {

        if (typeof events.list[e.missionTime] === "undefined")
            events.list[e.missionTime] = [];

        events.list[e.missionTime].push(e);
    });

    timeline.setupScrubber(eventList);
    timeline.changeSpeed(timeline.speed);

    // Are we loading a shared playback? If so load their POV at time of sharing
    if (this.sharedPresets.centerLat) {

        map.handler.setView([this.sharedPresets.centerLat, this.sharedPresets.centerLng], this.sharedPresets.zoom);

        timeline.timePointer = this.sharedPresets.time;

        timeline.skipTime(this.sharedPresets.time);
    } else {
        timeline.startTimer();
    }
};
