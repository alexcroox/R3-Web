function PlayBack() {

    this.zoomedToFirstPlayer = false;
    this.sharedPresets = {};
};

PlayBack.prototype.init = function(replayDetails, sharedPresets, cacheAvailable) {

    var self = this;

    this.replayDetails = replayDetails;
    this.sharedPresets = sharedPresets;

    // If we are loading a shared POV then we don't want to shift the view to the first player we see
    if(typeof this.sharedPresets.centerLat !== "undefined")
        this.zoomedToFirstPlayer = true;

    // Setup map with our chosen terrain
    map.init(this.replayDetails.map, this.replayDetails.tileSubDomains, function(error) {

        if (error) {

            window.location = webPath + '?missing-terrain&terrain=' + this.replayDetails.map;
            return;
        }

        // Fetch our event data from the server
        self.fetch(cacheAvailable);
        players.init();
    });
}

PlayBack.prototype.fetch = function(cacheAvailable) {

    var eventSourceUrl = (!cacheAvailable) ? webPath + '/fetch-events' : webPath + '/cache/events/' + this.replayDetails.id + '.json';
    var fetchType = (!cacheAvailable) ? 'POST' : 'GET';

    var self = this;

    $.ajax({
        url: eventSourceUrl,
        type: fetchType,
        dataType: 'json',
        data: { "id": this.replayDetails.id },
        success: this.prepData.bind(self),
        error: function(xhr, errorType, message) {
            console.log('Error fetching playback data - Status: ' + errorType + ' - Message: ' + message);

            var errorCode = (xhr.status >= 200 && xhr.status < 400)? message : xhr.status;

            window.location = webPath + '?events-error&code=' + errorCode;
        }
    });
};

PlayBack.prototype.prepData = function(eventList) {

    // Did our /fetch-events endpoint get hit instead of the json file?
    // Let's go get the json then!
    if(typeof eventList.id !== "undefined") {
        return this.fetch(true);
    }

    var self = this;

    $('#timeline__silder .progress').remove();

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

        console.log('This is a shared playback', this.sharedPresets);

        map.handler.setView([this.sharedPresets.centerLat, this.sharedPresets.centerLng], this.sharedPresets.zoom);

        timeline.skipTime(parseInt(this.sharedPresets.time));
    } else {
        timeline.startTimer();
    }

    // Slightly extended fadeout time on first load
    players.startInactiveListTimer(5);
};
