function Markers() {

    this.list = {};
    this.matchedIcons = {};
    this.icons = {};
    this.vehicleIcons = {};
    this.maxZoomLevelForIndividualPlayerLabels = 7;
    this.eventGroups = {
        'positions_vehicles': {},
        'positions_infantry': {}
    };
    this.currentUnits = {
        "positions_vehicles": [],
        "positions_infantry": []
    };

    // Used to debug missing icons
    this.unknownClasses = [];
};

Markers.prototype.setupLayers = function() {

    // Setup seperate layers for vehicles and infantry
    this.eventGroups.positions_vehicles = new L.LayerGroup([], {
        makeBoundsAware: false
    });

    this.eventGroups.positions_infantry = new L.LayerGroup([], {
        makeBoundsAware: false
    });

    this.eventGroups.positions_vehicles.addTo(map.handler);
    this.eventGroups.positions_infantry.addTo(map.handler);

    this.fetchVehicleIcons();
}

Markers.prototype.fetchVehicleIcons = function() {

    var self = this;

    $.ajax({
        url: webPath + '/fetch-vehicle-icons',
        type: 'GET',
        dataType: 'json',
        success: function(responseData) {
            self.vehicleIcons = responseData;

            console.log(self.vehicleIcons);
        },
        error: function(jq, status, message) {
            console.log('Error fetching playback data - Status: ' + status + ' - Message: ' + message);
        }
    });
};

// Cleanup old units we are no longer receiving data for and add update others
Markers.prototype.processPositionalUpdate = function(replayEvent, eventValue, type) {

    var self = this;

    var tempIds = {
        "positions_vehicles": [],
        "positions_infantry": []
    };

    // Loop through all events, process them and keep a list of which we've seen
    _.each(eventValue, function(unitData) {

        // Add a new marker
        self.add(unitData.unit, unitData, type, replayEvent.missionTime);

        if (self.currentUnits[type].indexOf(unitData.unit) < 0)
            self.currentUnits[type].push(unitData.unit);

        tempIds[type].push(unitData.unit);
    });

    // Work out which markers we previous had but no longer have
    var oldMarkers = _.difference(self.currentUnits[type], tempIds[type]);

    // Loop through markers we no longer have and work out if it's time to remove them yet
    _.each(oldMarkers, function(unit) {

        if (typeof self.list[unit] !== "undefined") {

            // When was this unit last updated?
            var timeDiff = replayEvent.missionTime - self.list[unit].timeUpdated;

            // If we've stopped receiving data lets remove it
            if (timeDiff > 30)
                self.remove(unit);
        }
    });
}

Markers.prototype.remove = function(unit) {

    if (typeof this.list[unit] !== "undefined") {

        this.eventGroups['positions_infantry'].removeLayer(this.list[unit]._leaflet_id);
        this.eventGroups['positions_vehicles'].removeLayer(this.list[unit]._leaflet_id);

        var infArrayIndex = this.currentUnits['positions_infantry'].indexOf(unit);
        var vehArrayIndex = this.currentUnits['positions_vehicles'].indexOf(unit);

        if (infArrayIndex > -1)
            this.currentUnits['positions_infantry'].splice(infArrayIndex, 1);

        if (vehArrayIndex > -1)
            this.currentUnits['positions_vehicles'].splice(vehArrayIndex, 1);

        delete this.list[unit];
    }
};

Markers.prototype.add = function(unit, data, type, timeUpdated) {

    var self = this;

    // Lets extract the horrible abbreviated data and make sense of it
    var icon = data.ico;

    if (icon == "iconLogic" || icon == "iconVirtual")
        return;

    var isInfantry = (type == "positions_infantry");
    var isVehicle = (type == "positions_vehicles");
    var iconType = (isVehicle)? 'vehicles' : 'infantry';
    var iconClass = data.cls;
    var iconPath = data.icp;
    var group = data.grp;
    var crew = data.crw;
    var cargo = data.cgo;
    var direction = data.dir;
    var isLeader = data.ldr;
    var position = map.gamePointToMapPoint(data.pos[0], data.pos[1]);
    var faction = this.convertFactionIdToFactionData(data.fac);

    var label = '';
    var isPlayer = false;
    var emptyVehicle = false;

    // Is this AI?
    if(data.id != "") {

        isPlayer = true;

        label = players.getNameFromId(data.id);

        // Is this the first time we are seeing this player in the data?
        if (typeof players.list[data.id] === "undefined")
            players.add(data.id, label, group);
    }

    // Show height markers on AI aircraft, but we need a name for it to display nicely
    if (icon == "iconPlane" && !isPlayer)
        label = 'Jet';

    // If this is a vehicle and we have crew lets add them to the label
    if (isVehicle && crew.length && crew.length > 1)
        label += this.addCrewCargoToLabel('crew', crew, data.id);

    // If this is a vehicle and we have crew lets add them to the label
    if (isVehicle && cargo.length && cargo.length > 1)
        label += this.addCrewCargoToLabel('cargo', cargo, data.id);

    // Only show individual player names if zoomed in far enough, otherwise show group label next to leader
    if (isInfantry && isPlayer && map.currentZoomLevel < this.maxZoomLevelForIndividualPlayerLabels)
        label = (!isLeader) ? ' ' : group.toUpperCase();

    var iconMarkerDefaults = {
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: 'unit-marker unit-marker__class--' + iconClass + ' unit-marker--' + icon + ' unit-marker__id--' + data.id,
        iconUrl: webPath + '/assets/images/map/markers/' + iconType + '/'
    };

    // This marker isn't on the map yet
    if (typeof this.list[unit] === "undefined") {

        var mapIcon = L.icon(_.extend(iconMarkerDefaults, {
            iconUrl: iconMarkerDefaults.iconUrl + self.getIconWithFaction(isVehicle, iconPath, icon, faction)
        }));

        this.list[unit] = L.marker(map.rc.unproject([position[0], position[1]]), {
            icon: mapIcon,
            clickable: false,
            iconAngle: direction
        }).bindLabel(label, {
            noHide: true,
            className: 'unit-marker__label unit-marker__label--' + type
        });

        // Save some data to reference later
        this.list[unit].posType = type;
        this.list[unit].originalLabel = label;
        this.list[unit].faction = faction.name;

        this.eventGroups[type].addLayer(this.list[unit]);

        this.list[unit].showLabel();

        // Lets zoom to the first player on playback initialisation
        if (isPlayer && !playBack.zoomedToFirstPlayer && isInfantry) {

            map.handler.setView(map.rc.unproject([position[0], position[1]]), 6);
            playBack.zoomedToFirstPlayer = true;
        }

    // The marker already exists, let's update it
    } else {

        this.list[unit].setLatLng(map.rc.unproject([position[0], position[1]]));

        var markerDomElement = $('.unit-marker__id--' + data.id);

        // Lets rotate the marker to it's latest heading
        if (markerDomElement.length) {

            var smoothAngle = this.calcShortestRotationAdjustment(this.getRotation(markerDomElement.get(0)), direction);
            this.list[unit].setIconAngle(smoothAngle);
        }

        if (typeof this.list[unit].unconscious !== "undefined" && this.list[unit].unconscious) {

            var mapIcon = L.icon(_.extend(iconMarkerDefaults, {
                iconUrl: iconMarkerDefaults.iconUrl + '/iconMan-unconcious.png',
                className: iconMarkerDefaults.className + ' unit-marker__label--unconscious'
            }));

            this.list[unit].setIcon(mapIcon);

        // Has the type changed?
        } else if (this.list[unit].posType != type && !emptyVehicle) {

            var mapIcon = L.icon(_.extend(iconMarkerDefaults, {
                iconUrl: iconMarkerDefaults.iconUrl + self.getIconWithFaction(isVehicle, iconPath, icon, faction)
            }));

            this.list[unit].setIcon(mapIcon);
            this.list[unit].posType = type;
        }

        this.list[unit].originalLabel = label;

        this.list[unit].label.setContent(label);

        // If we are flying (air vehicle or parachute (or otherwise!)) lets show height label
        if (position[2] > 10) {
            this.list[unit].label.setContent(this.list[unit].originalLabel + '<span class="player-marker-stat">' + String(Math.round(position[2])) + 'm</span>');
        }
    }

    // Store that we've just seen this unit so we don't delete it on the next cleanup
    this.list[unit].timeUpdated = timeUpdated;

    // Are we tracking this unit? Let's highlight it!
    if (playBack.trackTarget && playBack.trackTarget == data.id) {

        // Highlight
        this.list[unit].setZIndexOffset(9999);
        $('.unit-marker--tracking').removeClass('unit-marker--tracking');
        markerDomElement.addClass('unit-marker--tracking');

        // Has the map view moved away from the tracked player? Lets bring it back into view
        var point = map.handler.latLngToLayerPoint(this.list[unit].getLatLng());
        var distance = point.distanceTo(map.handler.latLngToLayerPoint(map.handler.getCenter()));

        if (distance > 200)
            map.handler.panTo(map.rc.unproject([position[0], position[1]]));
    }
};

Markers.prototype.getIconWithFaction = function(isVehicle, iconPath, defaultIcon, faction) {

    var icon = defaultIcon + '.png';

    if (isVehicle && typeof this.vehicleIcons[iconPath] !== "undefined")
        icon = 'mod-specific' + this.vehicleIcons[iconPath];

    // Add our faction to the icon name so we get a colour specific version
    return icon.replace(".png", "-" + faction.name + ".png");
}

Markers.prototype.addCrewCargoToLabel = function(type, data, unitId) {

    var label = '<span class="operation-' + type + '">';

    _.each(data, function(c) {

        // We don't want to include the driver
        if (c != unitId) {

            var playerInfo = players.getInfo(c);

            if (typeof playerInfo !== "undefined")
                label += '<br>' + playerInfo.name;
        }
    });

    label += '</span>';

    return label;
}

Markers.prototype.convertFactionIdToFactionData = function(factionId) {

    var factionData = {
        "name": "unknown",
        "color": '#CCCCCC'
    };

    switch (factionId) {

        case "0":

            factionData.name = 'east';
            factionData.color = '#ED5C66';
            break;

        case "1":

            factionData.name = 'west';
            factionData.color = '#2848E9';
            break;

        case "2":

            factionData.name = 'independant';
            factionData.color = '#00FF00';
            break;

        case "3":
            factionData.name = 'civilian';
            factionData.color = '#7D26CD';
            break;
    }

    return factionData;
};

// Get the current rotation value from dom element
Markers.prototype.getRotation = function(el) {

    var st = window.getComputedStyle(el, null);
    var tr = st.getPropertyValue("-webkit-transform") ||
        st.getPropertyValue("-moz-transform") ||
        st.getPropertyValue("-ms-transform") ||
        st.getPropertyValue("-o-transform") ||
        st.getPropertyValue("transform") ||
        "fail...";

    if (tr !== "none") {

        var values = tr.split('(')[1];
        values = values.split(')')[0];
        values = values.split(',');
        var a = values[0];
        var b = values[1];
        var c = values[2];
        var d = values[3];

        var scale = Math.sqrt(a * a + b * b);

        var radians = Math.atan2(b, a);
        var angle = Math.round(radians * (180 / Math.PI));

    } else {
        var angle = 0;
    }

    return angle;
}

// Find out which way we should re-rotate so it takes the shortest path instead of doing a spinning dance every time
Markers.prototype.calcShortestRotationAdjustment = function(previousRot, requiredRot) {

    var previousRot, apparentRot;
    previousRot = previousRot || 0;
    apparentRot = previousRot % 360;
    if (apparentRot < 0) {
        apparentRot += 360;
    }
    if (apparentRot < 180 && (requiredRot > (apparentRot + 180))) {
        previousRot -= 360;
    }
    if (apparentRot >= 180 && (requiredRot <= (apparentRot - 180))) {
        previousRot += 360;
    }
    previousRot += (requiredRot - apparentRot);
    return previousRot;
};
