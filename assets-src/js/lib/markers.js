function Markers() {

    this.list = {};
    this.matchedIcons = {};
    this.icons = (typeof icons !== "undefined") ? icons : {};
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
}

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
            if (timeDiff > 100)
                self.remove(unit);
        }
    });
}

Markers.prototype.remove = function(unit) {

    //console.log('removing', unit);

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
    var isLeader = (typeof data.ldr !== "undefined")? (data.ldr.toLowerCase() === 'true') : false;
    var position = map.gamePointToMapPoint(data.pos[0], data.pos[1]);
    var faction = this.convertFactionIdToFactionData(data.fac);
    var newMarker = false;

    var label = '';
    var isPlayer = false;
    var emptyVehicle = false;

    // Is this AI?
    if(data.id != "") {

        isPlayer = true;

        // Is this the first time we are seeing this player in the data?
        if (typeof players.currentList[data.id] === "undefined")
            players.add(data.id, label, group, faction, unit);

        label = (!isVehicle)? players.getNameFromId(data.id) : '<span class="operation-driver unit-marker__label--' + data.id + '">' + players.getNameFromId(data.id) + '</span>';
    }

    var markerId = (isPlayer)? data.id : this.cleanUnitName(unit);

    // If this is a vehicle and we have crew lets add them to the label
    if (isVehicle && crew.length && crew.length > 1)
        label += this.addCrewCargoToLabel('crew', crew, data.id);

    // If this is a vehicle and we have cargo lets add them to the label
    if (isVehicle && cargo.length && cargo.length > 1)
        label += this.addCrewCargoToLabel('cargo', cargo, data.id);

    // Only show individual player names if zoomed in far enough, otherwise show group label next to leader
    if (isInfantry && isPlayer && map.currentZoomLevel < this.maxZoomLevelForIndividualPlayerLabels)
        label = (!isLeader) ? ' ' : group.toUpperCase();

    var iconMarkerDefaults = {
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: 'unit-marker unit-marker__class--' + iconClass + ' unit-marker--' + icon + ' unit-marker__id--' + markerId,
        iconUrl: 'https://r3icons.titanmods.xyz/'
    };

    // This marker isn't on the map yet
    if (typeof this.list[unit] === "undefined") {

        newMarker = true;

        var iconUrl = iconMarkerDefaults.iconUrl + self.getIconWithFaction(isVehicle, iconPath, icon, faction);

        var mapIcon = L.icon(_.extend(iconMarkerDefaults, {
            iconUrl: iconUrl
        }));

        this.list[unit] = L.marker(map.rc.unproject([position[0], position[1]]), {
            icon: mapIcon,
            clickable: false,
            rotationAngle: direction,
            rotationOrigin: '50% 50%'
        }).bindLabel(label, {
            noHide: true,
            className: 'unit-marker__label unit-marker__label--' + type + ' unit-marker__label--' + data.id
        });

        this.eventGroups[type].addLayer(this.list[unit]);

        this.list[unit].showLabel();

        // Lets zoom to the first player on playback initialisation
        if (isPlayer && !playBack.zoomedToFirstPlayer && isInfantry) {

            map.handler.setView(map.rc.unproject([position[0], position[1]]), 4);
            playBack.zoomedToFirstPlayer = true;
        }

    // The marker already exists, let's update it
    } else {

        this.list[unit].setLatLng(map.rc.unproject([position[0], position[1]]));

        // Lets rotate the marker to it's latest heading
        if(direction != this.list[unit].angle) {

            var smoothAngle = this.calcShortestRotationAdjustment(this.list[unit].angle, direction);
            this.list[unit].angle = smoothAngle;
            this.list[unit].setRotationAngle(smoothAngle);
        }

        if (typeof this.list[unit].unconscious !== "undefined" && this.list[unit].unconscious) {

            var iconUrl = iconMarkerDefaults.iconUrl + 'iconMan-unconcious.png';

            var mapIcon = L.icon(_.extend(iconMarkerDefaults, {
                iconUrl: iconUrl,
                className: iconMarkerDefaults.className + ' unit-marker__label--unconscious'
            }));

            this.list[unit].setIcon(mapIcon);

        // Has the type changed?
        } else if ((this.list[unit].posType != type && !emptyVehicle) || typeof this.list[unit].killed !== "undefined") {

            if(typeof this.list[unit].killed !== "undefined") {
                delete this.list[unit].killed;
                this.list[unit].setOpacity(1);
            }

            var iconUrl = iconMarkerDefaults.iconUrl + self.getIconWithFaction(isVehicle, iconPath, icon, faction);

            var mapIcon = L.icon(_.extend(iconMarkerDefaults, {
                iconUrl: iconUrl
            }));

            this.list[unit].setIcon(mapIcon);
        } else {
            var iconUrl = this.list[unit].iconUrl;
        }

        // Type changed? Have they moved in and out of a vehicle recently?
        if(this.list[unit].posType != type) {

            if(type == "positions_vehicles")
                $('.unit-marker__label--' + data.id).removeClass('unit-marker__label--positions_infantry').addClass('unit-marker__label--positions_vehicles');

            if(type == "positions_infantry")
                $('.unit-marker__label--' + data.id).removeClass('unit-marker__label--positions_vehicles').addClass('unit-marker__label--positions_infantry');

            this.list[unit].posType = type;
        }

        this.list[unit].originalLabel = label;

        this.list[unit].label.setContent(label);

        // If we are flying (air vehicle or parachute (or otherwise!)) lets show height label
        if (position[2] > 10)
            this.list[unit].label.setContent(this.list[unit].originalLabel + '<span class="player-marker-stat">' + String(Math.round(position[2])) + 'm</span>');
    }

    // Store that we've just seen this unit so we don't delete it on the next cleanup
    this.list[unit].timeUpdated = timeUpdated;

    // Save some data to reference later
    this.list[unit].posType = type;
    this.list[unit].angle = direction;
    this.list[unit].originalLabel = label;
    this.list[unit].faction = faction.name;
    this.list[unit].iconUrl = iconUrl;

    // Store crew and cargo against the unit as we need to query this later for player list sidebar
    this.list[unit].crew = crew;
    this.list[unit].cargo = cargo;

    // We need to update the list with current icons
    if(isPlayer && newMarker)
        players.updateList();

    // Are we tracking this unit? Let's highlight it!
    if (players.trackTarget) {

        if(players.trackTarget == data.id || (isVehicle && (~crew.indexOf(players.trackTarget) || ~cargo.indexOf(players.trackTarget)))) {

            // Highlight
            this.list[unit].setZIndexOffset(9999);
            $('.unit-marker--tracking').removeClass('unit-marker--tracking');
            //markerDomElement.addClass('unit-marker--tracking');

            $('.unit-marker__label--tracking').removeClass('unit-marker__label--tracking');

            if(isVehicle && !$('.unit-marker__label--' + players.trackTarget).length) {
                $('.unit-marker__label__group--' + group).not('.unit-marker__label--positions_vehicles').addClass('unit-marker__label--tracking').css('z-index', 99999);
            } else {
                $('.unit-marker__label--' + players.trackTarget).not('.unit-marker__label--positions_vehicles').addClass('unit-marker__label--tracking').css('z-index', 99999);
            }

            if(label == " ")
                this.list[unit].label.setContent(players.getNameFromId(data.id));

            // Has the map view moved away from the tracked player? Lets bring it back into view
            var point = map.handler.latLngToLayerPoint(this.list[unit].getLatLng());
            var distance = point.distanceTo(map.handler.latLngToLayerPoint(map.handler.getCenter()));

            if (distance > 200)
                map.handler.panTo(map.rc.unproject([position[0], position[1]]));
        }
    }
};

Markers.prototype.findPlayerInCrew = function(id) {

    return _.find(markers.list, function(unit) {

        //console.log(unit.crew);

        if(typeof unit.crew !== "undefined" && unit.crew.length)
            return unit.crew.indexOf(id);
        else if (typeof unit.cargo !== "undefined" && unit.cargo.length)
            return unit.cargo.indexOf(id);
        else return false;
    });
}

Markers.prototype.getIconWithFaction = function(isVehicle, iconPath, defaultIcon, faction) {

    var icon = defaultIcon + '.png';

    if(typeof iconPath === "undefined")
        iconPath = defaultIcon;

    if (typeof this.icons[iconPath.toLowerCase()] !== "undefined")
        icon = this.icons[iconPath.toLowerCase()] + '.png';

    // Add our faction to the icon name so we get a colour specific version
    return icon.replace(".png", "-" + faction.name + ".png");
}

Markers.prototype.addCrewCargoToLabel = function(type, data, unitId) {

    var label = '<span class="operation-' + type + '">';

    var groupCargo = {};

    _.each(data, function(c) {

        // We don't want to include the driver
        if (c != unitId) {

            var playerInfo = players.getInfo(c);

            if (typeof playerInfo !== "undefined") {

                if(type == "cargo" && data.length > 5) {

                    if(typeof groupCargo[playerInfo.group] === "undefined") {
                        groupCargo[playerInfo.group] = 1;
                        label += '<span class="operation-cargo__unit unit-marker__label__group--' + playerInfo.group + '">' + playerInfo.group + '</span>';
                    } else {
                        groupCargo[playerInfo.group]++;
                    }
                } else {
                    label += '<span class="operation-cargo__unit unit-marker__label--' + c + '">' + playerInfo.name + '</span>';
                }
            }
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

    factionId = parseInt(factionId);

    switch (factionId) {

        case 0:

            factionData.name = 'east';
            factionData.color = '#ED5C66';
            break;

        case 1:

            factionData.name = 'west';
            factionData.color = '#2848E9';
            break;

        case 2:

            factionData.name = 'independant';
            factionData.color = '#518245';
            break;

        case 3:
            factionData.name = 'civilian';
            factionData.color = '#7D26CD';
            break;
    }

    return factionData;
};

Markers.prototype.cleanUnitName = function(name) {

    return name;
}

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
