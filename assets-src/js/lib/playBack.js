function PlayBack() {

    this.map = {};
    this.playerList = {};
    this.playerGroups = {};
    this.players = {};
    this.trackTarget = false;
    this.zoomedToFirstPlayer = false;

    // Used to debug missing icons
    this.unknownClasses = [];
};

PlayBack.prototype.init = function(replayDetails, sharedPresets, cacheAvailable) {

    var self = this;

    this.replayDetails = JSON.parse(replayDetails);
    this.sharedPresets = JSON.parse(sharedPresets);

    // Setup map with our chosen terrain
    this.map = new Map(this.replayDetails.map, this.replayDetails.tileSubDomains, function(error) {

        if (error)
            return;

        // Fetch our event data from the server
        self.fetch(cacheAvailable);
    });

    this.markers = new Markers(this);
    this.timeline = new Timeline(this);
    this.events = new Events(this);
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

    this.markers.setupLayers();

    // Calculate our time range and combine events with the same mission time
    _.each(eventList, function(e) {

        if (typeof self.events.list[e.time] === "undefined")
            self.events.list[e.time] = [];

        self.events.list[e.time].push(e);
    });
    this.timeline.setupScrubber(eventList);
    this.timeline.changeSpeed(this.timeline.speed);

    // Are we loading a shared playback? If so load their POV at time of sharing
    if (this.sharedPresets.centerLat) {

        this.map.handler.setView([this.sharedPresets.centerLat, this.sharedPresets.centerLng], this.sharedPresets.zoom);

        this.timeline.timePointer = this.sharedPresets.time;

        this.timeline.skipTime(this.sharedPresets.time);
    } else {
        this.timeline.startTimer();
    }
};
