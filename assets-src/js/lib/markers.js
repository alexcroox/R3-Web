function Markers() {

    this.list = {};
    this.matchedIcons = {};
    this.icons = {};
    this.maxZoomLevelForIndividualPlayerLabels = 7;
    this.eventGroups = {
        'positions_vehicles': {},
        'positions_infantry': {}
    };
    this.currentIds = {
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
}

// Cleanup old units we are no longer receiving data for and add update others
Markers.prototype.process = function(replayEvent, eventValue, type) {

    var self = this;

    console.log('process');

    var tempIds = {
        "positions_vehicles": [],
        "positions_infantry": []
    };

    // Loop through all events, process them and keep a list of which we've seen
    _.each(eventValue, function(pos, id) {

        // Add a new marker
        self.add(id, pos, type, replayEvent.missionTime);

        if (self.currentIds[type].indexOf(id) < 0)
            self.currentIds[type].push(id);

        tempIds[type].push(id);
    });

    // Work out which markers we previous had but no longer have
    var oldMarkers = _.difference(self.currentIds[type], tempIds[type]);

    // Loop through markers we no longer have and work out if it's time to remove them yet
    _.each(oldMarkers, function(id) {

        if (typeof self.list[id] !== "undefined") {

            // When was this unit last updated?
            var timeDiff = replayEvent.missionTime - self.list[id].timeUpdated;

            // If we've stopped receiving data lets remove it
            if (timeDiff > 30)
                self.removeUnit(id);
        }
    });
}

Markers.prototype.remove = function(id) {

    if (typeof this.list[id] !== "undefined") {

        this.eventGroups['positions_infantry'].removeLayer(this.list[id]._leaflet_id);
        this.eventGroups['positions_vehicles'].removeLayer(this.list[id]._leaflet_id);

        var infArrayIndex = playBack.currentIds['positions_infantry'].indexOf(id);
        var vehArrayIndex = playBack.currentIds['positions_vehicles'].indexOf(id);

        if (infArrayIndex > -1)
            playBack.currentIds['positions_infantry'].splice(infArrayIndex, 1);

        if (vehArrayIndex > -1)
            playBack.currentIds['positions_vehicles'].splice(vehArrayIndex, 1);

        delete this.list[id];
    }
};

Markers.prototype.convertFactionIdToSide = function(factionId) {

    var factionName = 'unknown';

    switch (factionId) {

        case 0:

            factionName = 'east';
            break;

        case 1:

            factionName = 'west';
            break;

        case 2:

            factionName = 'independant';
            break;

        case 3:
            factionName = 'civilian';
            break;
    }

    return factionName;
}

Markers.prototype.add = function(id, data, type, timeUpdated) {

    //console.log('Adding marker', data);

    // Lets extract the horrible abbreviated data and make sense of it
    var icon = data.ico;

    if (icon == "iconLogic" || icon == "iconVirtual")
        return;

    var isInfantry = (type == "positions_infantry");
    var isVehicle = (type == "positions_vehicles");
    var iconType = (isVehicle)? 'vehicles' : 'infantry';
    var iconClass = data.cls;
    var group = data.grp;
    var crew = data.crw;
    var cargo = data.cgo;
    var direction = data.dir;
    var isLeader = data.ldr;
    var position = map.gamePointToMapPoint(data.pos[0], data.pos[1]);
    var faction = this.convertFactionIdToSide(data.fac);

    console.log(data);

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

    if (isVehicle)
        icon = this.matchClassToIcon(iconClass, icon);

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
        className: 'unit-marker unit-marker--' + icon + ' unit-marker__id--' + data.id,
        iconUrl: webPath + '/assets/images/map/markers/' + iconType + '/'
    };

    // This marker isn't on the map yet
    if (typeof this.list[id] === "undefined") {

        var mapIcon = L.icon(_.extend(iconMarkerDefaults, {
            iconUrl: iconMarkerDefaults.iconUrl + faction + '-' + icon + '.png'
        }));

        this.list[id] = L.marker(map.rc.unproject([position[0], position[1]]), {
            icon: mapIcon,
            clickable: false,
            iconAngle: direction
        }).bindLabel(label, {
            noHide: true,
            className: 'unit-marker__label unit-marker__label--' + type
        });

        // Save some data to reference later
        this.list[id].posType = type;
        this.list[id].originalLabel = label;
        this.list[id].faction = faction;

        this.eventGroups[type].addLayer(this.list[id]);

        this.list[id].showLabel();

        // Lets zoom to the first player on playback initialisation
        if (isPlayer && !playBack.zoomedToFirstPlayer && isInfantry) {

            map.m.setView(map.rc.unproject([position[0], position[1]]), 6);
            playBack.zoomedToFirstPlayer = true;
        }

    // The marker already exists, let's update it
    } else {

        this.list[id].setLatLng(map.rc.unproject([position[0], position[1]]));

        var markerDomElement = $('.unit-marker__id--' + data.id);

        // Lets rotate the marker to it's latest heading
        if (markerDomElement.length) {

            var smoothAngle = this.calcShortestRotationAdjustment(this.getRotation(markerDomElement.get(0)), direction);
            this.list[id].setIconAngle(smoothAngle);
        }

        if (typeof this.list[id].unconscious !== "undefined" && this.list[id].unconscious) {

            var mapIcon = L.icon(_.extend(iconMarkerDefaults, {
                iconUrl: iconMarkerDefaults.iconUrl + '/unconscious.png',
                className: iconMarkerDefaults.className + ' unit-marker__label--unconscious'
            }));

            this.list[id].setIcon(mapIcon);

        // Has the type changed?
        } else if (this.list[id].posType != type && !emptyVehicle) {

            var mapIcon = L.icon(_.extend(iconMarkerDefaults, {
                iconUrl: iconMarkerDefaults.iconUrl + faction + '-' + icon + '.png'
            }));

            this.list[id].setIcon(mapIcon);
            this.list[id].posType = type;
        }

        this.list[id].originalLabel = label;

        this.list[id].label.setContent(label);

        // If we are flying (air vehicle or parachute (or otherwise!)) lets show height label
        if (position[2] > 10) {
            this.list[id].label.setContent(this.list[id].originalLabel + '<span class="player-marker-stat">' + String(Math.round(position[2])) + 'm</span>');
        }
    }

    // Store that we've just seen this unit so we don't delete it on the next cleanup
    this.list[id].timeUpdated = timeUpdated;

    // Are we tracking this unit? Let's highlight it!
    if (playBack.trackTarget && playBack.trackTarget == data.id) {

        // Highlight
        this.list[id].setZIndexOffset(9999);
        $('.unit-marker--tracking').removeClass('unit-marker--tracking');
        markerDomElement.addClass('unit-marker--tracking');

        // Has the map view moved away from the tracked player? Lets bring it back into view
        var point = map.m.latLngToLayerPoint(this.list[id].getLatLng());
        var distance = point.distanceTo(map.m.latLngToLayerPoint(map.m.getCenter()));

        if (distance > 200)
            map.m.panTo(map.rc.unproject([position[0], position[1]]));
    }
};

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

Markers.prototype.matchClassToIcon = function(className, fallBackIcon) {

    var self = this;

    // We keep a list of already matched icons for speedier recuring lookups
    if (typeof this.matchedIcons[className] === "undefined") {

        var matchedIcon = fallBackIcon;
        var found = false;

        _.each(this.icons, function(i) {

            if (className.indexOf(i.name) > -1) {
                matchedIcon = i.icon;
                self.matchedIcons[className] = i.icon;
                found = true;
            }
        });

        if (!found) {

            if (self.unknownClasses.indexOf(className) == -1) {
                console.warn(className, fallBackIcon);

                self.unknownClasses.push(className);
            }
        }

        return matchedIcon;

    } else {
        return self.matchedIcons[className];
    }
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
