function PlayBack(replayDetails, sharedPresets, cacheAvailable) {

    this.eventGroups = {
        'positions_vehicles': {},
        'positions_infantry': {}
    };
    this.currentIds = {
        "positions_vehicles": [],
        "positions_infantry": []
    };
    this.map = {};
    this.events = {};
    this.timeline = {};
    this.playerList = {};
    this.playerGroups = {};
    this.players = {};
    this.markers = {};
    this.matchedIcons = {};
    this.trackTarget = false;
    this.zoomedToFirstPlayer = false;
    // Used to debug missing icons
    this.unknownClasses = [];

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
};

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

    // Setup seperate layers for vehicles and infantry
    this.eventGroups.positions_vehicles = new L.LayerGroup([], {
        makeBoundsAware: false
    });

    this.eventGroups.positions_infantry = new L.LayerGroup([], {
        makeBoundsAware: false
    });

    this.eventGroups.positions_vehicles.addTo(this.map.handler);
    this.eventGroups.positions_infantry.addTo(this.map.handler);

    // Calculate our time range and combine events with the same mission time
    _.each(eventList, function(e) {

        if (typeof self.eventList[e.time] === "undefined")
            self.eventList[e.time] = [];

        self.eventList[e.time].push(e);
    });

    this.timeline = new Timeline(this);
    this.timeline.setupScrubber(this.eventList);
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
