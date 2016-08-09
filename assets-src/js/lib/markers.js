function Markers(playBack) {

    this.playBack = playBack;
    this.map = playBack.map;
    this.list = {};
    this.matchedIcons = {};
    this.eventGroups = {
        'positions_vehicles': {},
        'positions_infantry': {}
    };
    this.currentIds = {
        "positions_vehicles": [],
        "positions_infantry": []
    };
};

Markers.prototype.setupLayers = function() {

    // Setup seperate layers for vehicles and infantry
    this.eventGroups.positions_vehicles = new L.LayerGroup([], {
        makeBoundsAware: false
    });

    this.eventGroups.positions_infantry = new L.LayerGroup([], {
        makeBoundsAware: false
    });

    this.eventGroups.positions_vehicles.addTo(this.map.handler);
    this.eventGroups.positions_infantry.addTo(this.map.handler);
}

// Cleanup old units we are no longer receiving data for
Markers.prototype.findAndRemoveOld = function(replayEvent, eventValue) {

    var self = this;

    var tempIds = {
        "positions_vehicles": [],
        "positions_infantry": []
    };

    _.each(eventValue, function(pos, id) {

        self.add(id, pos, type, replayEvent.time);

        if (self.currentIds[type].indexOf(id) < 0)
            self.currentIds[type].push(id);

        tempIds[type].push(id);
    });

    var oldMarkers = _.difference(self.currentIds[type], tempIds[type]);

    _.each(oldMarkers, function(id) {

        if (typeof self.list[id] !== "undefined") {

            // When was this unit last updated?
            var timeDiff = replayEvent.time - self.list[id].timeUpdated;

            // If we've stopped receiving data lets remove it
            if (timeDiff > 30)
                self.removeUnit(id);
        }
    });
}

Markers.prototype.remove = function(id) {

    if (typeof this.list[id] !== "undefined") {

        playBack.eventGroups['positions_infantry'].removeLayer(this.list[id]._leaflet_id);
        playBack.eventGroups['positions_vehicles'].removeLayer(this.list[id]._leaflet_id);

        var infArrayIndex = playBack.currentIds['positions_infantry'].indexOf(id);
        var vehArrayIndex = playBack.currentIds['positions_vehicles'].indexOf(id);

        if (infArrayIndex > -1)
            playBack.currentIds['positions_infantry'].splice(infArrayIndex, 1);

        if (vehArrayIndex > -1)
            playBack.currentIds['positions_vehicles'].splice(vehArrayIndex, 1);

        delete this.list[id];
    }
};
