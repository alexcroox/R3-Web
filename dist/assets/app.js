function Events() {

    this.list = {};
};

Events.prototype.showNext = function() {

    var self = this;

    // Do we have any events for this mission time?
    if (typeof this.list[timeline.timePointer] !== "undefined") {

        //console.log(timeline.timePointer);

        // We might have more than one event for this mission time
        _.each(self.list[timeline.timePointer], function(replayEvent) {

            var type = replayEvent.type;
            var eventValue = self.parseData(replayEvent.value);

            if (eventValue)
                self.actionType(type, replayEvent, eventValue);

        });
    }

    timeline.timePointer += timeline.timeJump;
};

// Attempt to parse our event json
Events.prototype.parseData = function(json) {

    var self = this;

    try {

        var parsedData = JSON.parse(json);

        return parsedData;
    } catch (e) {

        console.error(e, json);

        // Stop playback on bad json
        timeline.stopTimer(true);

        return false;
    }
};

Events.prototype.actionType = function(type, replayEvent, eventValue) {

    var self = this;

    if (type == "positions_vehicles" || type == "positions_infantry") {

        markers.processPositionalUpdate(replayEvent, eventValue, type);

    } else {

        switch (type) {

            // If the unit gets into a vehicle we can remove their infantry icon immediately
            case "get_in":

                markers.remove(eventValue.unit);

                //console.log('get in', eventValue.id);

                if(eventValue.id != "")
                    setTimeout(players.updateList.bind(players), 500);

                break;

            case "get_out":

                //console.log('get out', eventValue.id);

                if(eventValue.id != "")
                    setTimeout(players.updateList.bind(players), 500);

                break;

            case "player_disconnected":

                var playerInfo = players.getInfo(eventValue.id);

                //console.log('Player disconnected', playerInfo);

                if (typeof playerInfo !== "undefined")
                    notifications.info(playerInfo.name + ' disconnected');

                markers.remove(eventValue.unit);

                break;

            case "player_connected":

                var playerInfo = players.getInfo(eventValue.id);

                //console.log('Player connected', playerInfo);

                if (typeof playerInfo !== "undefined")
                    notifications.info(playerInfo.name + ' connected');

                break;

            case "unit_awake":

                markers.remove(eventValue.unit);

                break;

            case "unit_unconscious":

                self.hit('downed', eventValue);

                break;

            case "unit_killed":

                self.hit('killed', eventValue);

                break;

            case "incoming_missile":

                self.projectileLaunch(eventValue);
                break;

            case "markers":


                break;

            default:
                console.warn('Unknown event', type);
        }
    }
};

// Killed or unconscious
Events.prototype.hit = function(hitType, eventData) {

    //console.log(hitType, eventData.victim);

    var victim = eventData.victim;
    var attacker = eventData.attacker;
    var attackerKnown = (typeof attacker !== "undefined")? true : false;
    var attackerIsPlayer = false;

    var playerInfo = players.getInfo(victim.id);

    // Did this hit/killed/unconscious event have an attacker we can draw a connection from?
    if (attackerKnown) {

        // Are both units on the map currently?
        if (typeof markers.list[victim.unit] !== "undefined" && typeof markers.list[attacker.unit] !== "undefined") {

            if(attacker.id != "") {

                var attackerInfo = players.getInfo(attacker.id);

                if (typeof attackerInfo !== "undefined") {

                    attackerIsPlayer = true;
                }
            }

            var unitsPos = [markers.list[victim.unit].getLatLng(), markers.list[attacker.unit].getLatLng()];
            var lineColor = '#ED5C66';

            // Work out our attacker faction's line color
            var factionData = markers.convertFactionIdToFactionData(attacker.faction);
            lineColor = factionData.color;

            // Draw a line between attacker and victim
            var killLine = L.polyline(unitsPos, {
                color: lineColor,
                weight: 1,
                clickable: false
            }).addTo(map.handler);

            setTimeout(function() {
                map.handler.removeLayer(killLine);
            }, 1000);
        }
    }

    // Lets mark the unit as unconscious so we can change the colour of their icon
    if(typeof markers.list[victim.unit] !== "undefined") {

        if(hitType == "unconscious") {
            markers.list[victim.unit].unconscious = true;
        } else {
            markers.list[victim.unit].setOpacity(0.4);
            markers.list[victim.unit].killed = true;
        }
    }

    // If this is a player lets show a notification
    if (typeof playerInfo !== "undefined") {

        var message = '';

        if (!attackerKnown) {

            message = '<span>' + playerInfo.name + '</span>' + ' ' + hitType + ' <span class="toast-smaller">himself!</span>';
        } else {

            if (attacker.weapon != "") {

                var byText = (!attackerIsPlayer)? '<span class="toast-smaller">' + attacker.weapon + '</span>' : '<span class="toast-smaller">' + attackerInfo.name + '</span> (' + attacker.weapon + ')';
                message = '<span>' + playerInfo.name + '</span>' + ' was ' + hitType + ' by ' + byText;
            } else {
                message = '<span>' + playerInfo.name + '</span>' + ' was ' + hitType;
            }
        }

        if(hitType == "killed")
            notifications.error(message);
        else
            notifications.warning(message);
    }
};

// Pulse a large circle around the attacker and animate a M m m towards the victim
Events.prototype.projectileLaunch = function(eventData) {

    var self = this;

    var victim = eventData.victim;
    var attacker = eventData.attacker;
    var launchPos = map.gamePointToMapPoint(attacker.pos[0], attacker.pos[1]);
    var victimMarker = markers.list[victim.unit];

    var targetPos = (typeof victimMarker !== "undefined") ? victimMarker.getLatLng() : false;

    var playerInfo = players.getInfo(victim.id);

    var launchPulse = L.circle(map.rc.unproject([launchPos[0], launchPos[1]]), 50, {
        weight: 1,
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        className: 'missile-launch',
        clickable: false
    }).addTo(map.handler);

    setTimeout(function() {
        map.handler.removeLayer(launchPulse);
    }, 1000);

    if (targetPos) {

        var projectileIcon = L.marker(map.rc.unproject([launchPos[0], launchPos[1]]), {
            icon: L.icon({
                iconUrl: webPath + '/assets/images/map/markers/' + attacker.ammoType.toLowerCase() + '.png',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                className: 'projectile-' + attacker.ammoType.toLowerCase()
            }),
            clickable: false
        }).addTo(map.handler);

        setTimeout(function() {
            projectileIcon.setLatLng(targetPos);
        }, 50);

        setTimeout(function() {
            map.handler.removeLayer(projectileIcon);
        }, 1000);
    }

    if (typeof playerInfo !== "undefined")
        notifications.info(attacker.ammoType + ' Launch at ' + playerInfo.name);
};

function Map() {

    this.terrain;
    this.tileSubDomains = false;
    this.zooming = false;
};

Map.prototype.init = function(terrainName, tileSubDomains, cb) {

    var self = this;

    this.terrain = terrainName.toLowerCase();
    this.tileSubDomains = tileSubDomains;

    if(typeof mappingConfig[this.terrain] !== "undefined")
        this.terrain = mappingConfig[this.terrain];

    $.getJSON(webPath + '/maps/' + this.terrain + '/config.json', function(configJson) {
        self.config = configJson;
        self.render(cb);
    })
    .fail(function() {
        console.log("Error loading terrain config");
        cb(true);
    });
};

Map.prototype.render = function(cb) {

    // Create the base map using our terrain settings
    this.handler = new L.Map('map', {
        minZoom: this.config.minZoom,
        maxNativeZoom: this.config.maxZoom,
        maxZoom: 10,
        zoom: this.config.initZoom,
        attributionControl: false,
        zoomControl: false,
        zoomAnimation: true,
        fadeAnimation: true,
        //"measureControl": true
    });

    console.log((this.config.maxZoom + 4));

    this.currentZoomLevel = this.config.initZoom;

    $('#map').css('background-color', this.config.bgColor);

    // Assign map and image dimensions
    this.rc = new L.RasterCoords(this.handler, [this.config.width, this.config.height]);

    // Set the bounds on the map, give us plenty of padding to avoid a map bouncing loop
    var southWest = this.rc.unproject([0, this.config.height]);
    var northEast = this.rc.unproject([this.config.width, 0]);

    this.mapBounds = new L.LatLngBounds(southWest, northEast);
    var panningBounds = this.mapBounds.pad(1);

    this.handler.setMaxBounds(panningBounds);

    // We need to set an initial view for the tiles to render
    this.setView([this.config.height / 2, this.config.width / 2], this.config.initZoom);

    // Inject sub domain support for faster tile loading (if supported)
    var tileUrl = (this.tileSubDomains) ? webPath.replace("//", "//{s}.") : webPath;

    if(webPath == "http://aar.local")
        tileUrl = 'https://titanmods.xyz/r3/ark';

    // Add our terrain generated tiles
    this.layer = L.tileLayer(tileUrl + '/maps/' + this.terrain + '/tiles/{z}/{x}/{y}.png', {
        noWrap: true,
        maxNativeZoom: this.config.maxZoom,
        maxZoom: 10,
        errorTileUrl: webPath + '/assets/images/map/error-tile.png'
    }).addTo(this.handler);

    this.setupInteractionHandlers();

    poi.init(this.terrain);

    cb(false);
};

Map.prototype.setupInteractionHandlers = function() {

    var self = this;

    // We need to store our current zoom level for toggling visibility on terrain points of interest (height markers, town names)
    this.handler.on('zoomend', function(e) {

        self.currentZoomLevel = e.target._zoom;

        console.log('Zoom changed', self.currentZoomLevel);
    });

    this.handler.on('dragstart', function(e) {

        players.stopTracking();
    });

    // We need to store our current map center for sharing playback positions
    this.handler.on('dragend', function(e) {

        var currentCenter = self.rc.project(self.handler.getCenter());
        var currentZoom = self.handler.getZoom();

        console.log(currentCenter, currentZoom);
    });

    this.handler.on('zoomstart', function() {

        self.zooming = true;
    });

    this.handler.on('zoomend', function() {

        self.zooming = false;
    });
};

Map.prototype.setView = function(pos, zoom) {

    this.handler.setView(this.rc.unproject(pos), zoom);
};

Map.prototype.gamePointToMapPoint = function(x, y) {

    if (this.config.doubleSize == "1") {

        var convertedX = x * 2;
        var convertedY = Math.abs((y - (this.config.height / 2)) * 2);

    } else {

        var convertedX = x;
        var convertedY = Math.abs(parseFloat(y) - parseFloat(this.config.height));
    }

    return [convertedX, convertedY];
}

Map.prototype.mapPointToGamePoint = function(x, y, grid) {

    grid = grid || false;

    if (typeof x === "object") {
        y = x.y;
        x = x.x;
    }

    if (this.config.doubleSize == "1") {

        var convertedX = x / 2;
        var convertedY = Math.abs((y - this.config.height) / 2);
    } else {

        var convertedX = x;
        var convertedY = Math.abs(parseFloat(y) + parseFloat(this.config.height));
    }

    if (!grid)
        return [convertedX, convertedY];
    else
        return map.gameToGrid(convertedX, convertedY);
}

Map.prototype.gameToGrid = function(x, y) {

    var gridX = Math.round((x * 100) / 100) / 100;
    var gridY = Math.round((y * 100) / 100) / 100;

    //gridY = (gridY * 100) / 100;

    return [gridX, gridY];
};

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

    // Show height markers on AI aircraft, but we need a name for it to display nicely
    if (icon == "iconPlane" && !isPlayer)
        label = 'Jet';

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
        iconUrl: webPath + '/assets/images/map/markers/' + iconType + '/'
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

            var iconUrl = webPath + '/assets/images/map/markers/' + iconType + '/iconMan-unconcious.png';

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
            $('.unit-marker__label--' + players.trackTarget).not('.unit-marker__label--positions_vehicles').addClass('unit-marker__label--tracking').css('z-index', 99999);

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

    if (typeof iconPath !== "undefined")
        iconPath = iconPath.toLowerCase();

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
                label += '<span class="operation-cargo__unit unit-marker__label--' + c + '">' + playerInfo.name + '</span>';
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

function Modal() {

}

Modal.prototype.setupInteractionHandlers = function() {

    var self = this;

    $('body').on('click', '.modal__close', function(e) {
        e.preventDefault();

        self.hide();
    });
}

Modal.prototype.hide = function(modalId) {

    $('.modal').removeClass('modal--show');
};

Modal.prototype.show = function(modalId, loadedCallback) {

    $('#' + modalId).addClass('modal--show');
};

function Notifications() {

    this.enabled = true;
    this.minWidth = 800;
};

Notifications.prototype.init = function() {

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "target": '.playback-container'
    };

    this.setupInteractionHandlers();
};

Notifications.prototype.setupInteractionHandlers = function() {

    var self = this;

    $(window).resize(this.checkWindowWidth);
};

Notifications.prototype.checkWindowWidth = function() {

    this.enabled = ($(window).width() >= this.minWidth)? true : false;
};

Notifications.prototype.info = function(message) {

    if(!this.enabled)
        return;

    toastr.info(message);
};

Notifications.prototype.warning = function(message) {

    if(!this.enabled)
        return;

    toastr.warning(message);
};

Notifications.prototype.error = function(message) {

    if(!this.enabled)
        return;

    toastr.error(message);
};

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

function Players() {

    this.masterList = {};
    this.currentList = {};
    this.factionGroups = {};
    this.trackTarget = false;
    this.collapseList = {};
    this.listFadeEnabled = true;
    this.listInactiveTimer = null;
    this.listFadeTime = 3; // seconds before player list fades out
    this.updateFrequency = 3; // seconds between auto player sidebar refreshes
    this.updateTimer = null;
    this.updateLock = false;
    this.delayedUpdateTimer = null;
};

Players.prototype.init = function() {

    this.prepData(playerList);

    this.setupInteractionHandlers();

    $('.player-list__content').perfectScrollbar({
        suppressScrollX: true
    });

    $('.player-list__content .ps-scrollbar-y-rail').unbind('click');
    $('.player-list__content .ps-scrollbar-y').unbind('mousedown');

    if(typeof playBack.sharedPresets.track !== "undefined")
        this.trackTarget = playBack.sharedPresets.track;

    //this.updateTimer = setInterval(this.updateList.bind(this), this.updateFrequency * 1000);
};

Players.prototype.setupInteractionHandlers = function() {

    var self = this;

    // Show the player list on hover
    $('.player-list').on('mouseenter', function() {

        clearTimeout(self.listInactiveTimer);
        $(this).removeClass('player-list--inactive');
    });

    // Hide the player list again
    $('.player-list').on('mouseleave', function() {

        clearTimeout(self.listInactiveTimer);
        self.startInactiveListTimer();
    });

    $('body').on('click', '.player-list__group__member', function(e) {

        e.preventDefault();

        $('.player-list__group__member--tracking').removeClass('player-list__group__member--tracking');
        $(this).addClass('player-list__group__member--tracking');

        self.trackTarget = $(this).attr('data-id');
    });

    $('body').on('click', '.expand-handle', function(e) {

        e.preventDefault();

        $(this).next('.expand-list').slideToggle(200);
        $(this).toggleClass('expand');

        var groupName = $(this).parent().attr('data-group');

        if(!$(this).hasClass('expand'))
            self.collapseList[groupName] = true;
        else
            delete self.collapseList[groupName];
    });

    $('body').on('click', '.player-list__toggle-sticky', function(e) {

        e.preventDefault();

        if($(this).hasClass('player-list__toggle-sticky--inactive')) {

            $(this).removeClass('player-list__toggle-sticky--inactive');
            self.listFadeEnabled = true;
        } else {
            $(this).addClass('player-list__toggle-sticky--inactive');
            clearTimeout(self.listInactiveTimer);
            self.listFadeEnabled = false;
        }

    });
}

// Countdown to hiding the player list
Players.prototype.startInactiveListTimer = function(timeout) {

    // Did we specify a custom timeout? If not use default
    timeout = timeout || this.listFadeTime;

    var self = this;

    this.listInactiveTimer = setTimeout(function() {

        if(self.listFadeEnabled)
            $('.player-list').addClass('player-list--inactive');

    }, timeout * 1000);
}

Players.prototype.prepData = function(allPlayers) {

    console.log('Prepping master list');

    var self = this;

    _.each(allPlayers, function(p) {

        self.masterList[p.id] = p;
    });

    this.updateList();
}

Players.prototype.add = function(id, name, group, factionData, unit) {

    console.log('Adding player', name);

    this.currentList[id] = {
        "name": name
    };

    if(typeof this.masterList[id] !== "undefined")
        this.masterList[id].unit = unit;

    // Do we have this faction setup yet?
    if(typeof this.factionGroups[factionData.name] === "undefined")
        this.factionGroups[factionData.name] = {
            meta: factionData,
            groups: {}
        };

    // Does this player's group exist yet?
    if (typeof this.factionGroups[factionData.name].groups[group] === "undefined")
        this.factionGroups[factionData.name].groups[group] = {
            "members": []
        };

    // Add them to the group
    this.factionGroups[factionData.name].groups[group].members.push(id);

    // Update our sidebar list
    this.updateList();
}

Players.prototype.getInfo = function(id) {

    return _.find(this.masterList, function(player) {
        return player.id == id;
    });
};

Players.prototype.getNameFromId = function(id) {

    var playerInfo = this.getInfo(id);

    return (typeof playerInfo === "undefined")? "Unknown" : playerInfo.name;
};

// Update the sidebar player list
Players.prototype.updateList = function(forceUpdate) {

    forceUpdate = forceUpdate || false;

    if(this.updateLock && !forceUpdate) {

        clearTimeout(this.delayedUpdateTimer);

        this.delayedUpdateTimer = setTimeout(function() {
            players.updateList();
        }, 500);

        return;
    }

    this.updateLock = true;

    var self = this;

    if(!_.size(this.factionGroups)) {
        self.updateLock = false;
        return;
    }

    clearTimeout(this.delayedUpdateTimer);

    var $playerListContainer = $('.player-list');
    var $playerList = $('.player-list__content');
    $playerList.html('');

    _.each(this.factionGroups, function(factionData, factionName) {

        // Since we are rebuilding the list every time we need to restore the expand/collapse state
        var expandClass = (typeof self.collapseList[factionName] === "undefined")? 'expand' : 'collapse';
        $playerList.append('<div class="player-list__faction" data-group="' + factionName + '"><a href="#" class="expand-handle ' + expandClass + '">' + factionName + '</a> <div class="expand-list"></div></div>');

        var sortedGroups = self.sortGroups(factionData.groups);

        _.each(sortedGroups, function(groupData, groupName) {

            var expandClass = (typeof self.collapseList[groupName] === "undefined")? 'expand' : 'collapse';
            $('.player-list__faction[data-group="' + factionName + '"]').find('.expand-list').eq(0).append('<div class="player-list__group" data-group="' + groupName + '"><a href="#" class="expand-handle ' + expandClass + '">' + groupName + '</a> <div class="expand-list"></div></div>');

            _.each(groupData.members, function(playerId) {

                var playerData = self.getInfo(playerId);

                var imgUrl = webPath + '/assets/images/map/markers/blank.png';

                //console.log('p', playerData);
                //console.log(markers.list);

                // Is this player on foot or driving a vehicle?
                if(typeof markers.list[playerData.unit] !== "undefined") {

                    imgUrl = markers.list[playerData.unit].iconUrl;
                } else {
                    // If not there is a good chance they are in a vehicle, lets show which one
                    var driverVehicle = markers.findPlayerInCrew(playerData.playerId);

                    if(driverVehicle)
                        imgUrl = driverVehicle.iconUrl;
                }

                imgUrl = imgUrl.replace(".png", "-trim.png");

                var trackingClass = (self.trackTarget == playerId)? 'player-list__group__member--tracking' : '';

                $('.player-list__faction[data-group="' + factionName + '"] .player-list__group[data-group="' + groupName + '"]').find('.expand-list').eq(0).append('\
                    <a href="#" class="player-list__group__member ' + trackingClass + '" data-id="' + playerId + '">\
                        <img src="' + imgUrl + '">\
                        ' + playerData.name + '\
                    </a>');
            });
        });
    });

    $playerListContainer.show();

    $('.player-list__content').perfectScrollbar('update');

    setTimeout(function() {
        self.updateLock = false;
    }, 1000);
};

Players.prototype.stopTracking = function() {

    if(!this.trackTarget)
        return;

    this.trackTarget = false;
    var $originalTrackerPlayerInList = $('.player-list .player-list__group__member--tracking');

    $originalTrackerPlayerInList.removeClass('player-list__group__member--tracking');
    $('.unit-marker__label--tracking').removeClass('unit-marker__label--tracking');

    // Flash animation to show we are no longer tracking target
    $originalTrackerPlayerInList.addClass('player-list__group__member--stop-tracking');

    $('.player-list').removeClass('player-list--inactive');
    this.startInactiveListTimer();

    setTimeout(function() {
        $originalTrackerPlayerInList.removeClass('player-list__group__member--stop-tracking');
    }, 3000);
};

Players.prototype.sortGroups = function(map) {

    var keys = _.sortBy(_.keys(map), function(a) { return a; });
    var newmap = {};
    _.each(keys, function(k) {
        newmap[k] = map[k];
    });
    return newmap;
};

function Poi() {

    this.ready = false;
    this.poiLayers = {};
};

Poi.prototype.init = function(terrainName) {

    this.terrain = terrainName;
    this.setupInteractionHandlers();
    this.add();
}

Poi.prototype.setupInteractionHandlers = function() {

    var self = this;

    // When we zoom we need to filter our POIs from view to avoid clutter
    map.handler.on('zoomend', function(e) {

        self.filterZoomLayers();
    });
};

Poi.prototype.add = function() {

    var self = this;

    $.getJSON(webPath + '/maps/' + this.terrain + '/poi.json', function(poiJson) {

        async.forEachOf(poiJson, function(poi, key, callback) {

            var lg;

            if(poi.type == "mount")
                return;

            // Setup layer group for POI so we can toggle it based on zoom levels
            if (typeof self.poiLayers[poi.type] === "undefined") {

                if (poi.type != "mount") {

                    lg = new L.featureGroup([]);

                    lg.addTo(map.handler);
                } else {

                    lg = new L.LayerGroup([], {
                        makeBoundsAware: true
                    });
                }

                self.poiLayers[poi.type] = lg;
            } else {
                lg = self.poiLayers[poi.type];
            }

            var poiIconName = 'blank';
            var poiOffset = [0, 0];
            var iconSize = [30, 30];
            var iconAnchor = [15, 15];

            switch (poi.type) {

                case "hill":
                    poiIconName = 'hill_ca';
                    poiOffset = [10, 0];
                    iconSize = [15, 15];
                    iconAnchor = [7, 7];
                    break;

                case "rockarea":
                    poiIconName = 'rockarea_ca';
                    poiOffset = [10, 0];
                    iconSize = [15, 15];
                    iconAnchor = [7, 7];
                    break;
            }

            var poiIcon = L.icon({
                iconUrl: webPath + '/assets/images/map/markers/poi/' + poiIconName + '.png',
                iconSize: iconSize,
                iconAnchor: iconAnchor,
                className: 'poi-image--' + poi.type
            });

            var pos = map.gamePointToMapPoint(poi.x, poi.y);

            var poiLabel = L.marker(map.rc.unproject([pos[0], pos[1]]), {
                icon: poiIcon,
                clickable: false
            }).bindLabel(poi.label, {
                noHide: true,
                className: 'poi poi-' + poi.type,
                offset: poiOffset
            });

            lg.addLayer(poiLabel);

            callback();
        }, function(err) {

            self.ready = true;
            self.filterZoomLayers();
        });
    })
    .fail(function(err) {
        console.log("Error loading terrain POI, does the JSON file exist and is it valid JSON?", err);
    });
};

// Filter out poi layers based on current zoom level.
// Keeps map clutter free at lower zoom levels
Poi.prototype.filterZoomLayers = function() {

    if(!this.ready)
        return;

    var self = this;
    var zoom = map.handler.getZoom();

    _.each(this.poiLayers, function(layer, type) {

        if(zoom < 4 && (type != 'namecitycapital' && type != 'namecity' && type != 'mount'))
            map.handler.removeLayer(self.poiLayers[type]);

        if(zoom > 3 && type != 'mount')
            self.poiLayers[type].addTo(map.handler);

        if(zoom > 5 && type == 'mount')
            self.poiLayers[type].addTo(map.handler);

        if(zoom < 6 && type == 'mount')
            map.handler.removeLayer(self.poiLayers[type]);
    });
};

function ReplayList() {

    this.lists = {
        "missions-all": null,
        "missions-mine": null
    };
};

ReplayList.prototype.init = function(listId) {

    if(this.lists[listId])
        return;

    this.lists[listId] = new List(listId, {
        valueNames: [
            listId + '-mission-list__item__name',
            listId + '-mission-list__item__map',
            listId + '-mission-list__item__length',
            listId + '-mission-list__item__player-count',
            listId + '-mission-list__item__date'
        ],
        searchClass: listId + '-mission-list__search',
        sortClass: listId + '-mission-list__sort',
        listClass: listId + '-list',
        plugins: [ListFuzzySearch()]
    });
};

ReplayList.prototype.setupInteractionHandlers = function() {

    var self = this;

    $('body').on('click', '.mission-list__sort', function(e) {

        if($(this).hasClass('mission-list__sort--asc'))
            $(this).removeClass('mission-list__sort--asc').addClass('mission-list__sort--desc');
        else
            $(this).removeClass('mission-list__sort--desc').addClass('mission-list__sort--asc');
    });

    $('body').on('focus', '.text-input--with-icon .text-input', function(e) {

        $(this).parent().removeClass('text-input--with-icon--unfocused');
    });

    $('body').on('blur', '.text-input--with-icon .text-input', function(e) {

        $(this).parent().addClass('text-input--with-icon--unfocused');
    });

    $('body').on('click', '.mission-list__tab', function(e) {

        e.preventDefault();

        var currentList = $('.mission-list__tab--active').attr('data-list');
        var targetList = $(this).attr('data-list');

        $('.mission-list__tab--active').removeClass('mission-list__tab--active');
        $('.mission-list--active').removeClass('mission-list--active');

        $(this).addClass('mission-list__tab--active');
        $('#' + targetList).addClass('mission-list--active');

        if(!$('#' + targetList + ' input[name="my-player-id"]').length)
            self.init(targetList);
        else
            return;

        // Set the search input to match previous tab
        var currentSearchTerm = $('.' + currentList + '-mission-list__search').val();
        $('.' + targetList + '-mission-list__search').val(currentSearchTerm);
        self.lists[targetList].search(currentSearchTerm);
    });

    $('body').on('click', '.new-user__save', function(e) {
        e.preventDefault();

        $.ajax({
            url: webPath + '/save-player-id',
            type: 'POST',
            dataType: 'json',
            data: { id: $('input[name="my-player-id"]').val() },
            success: function(response) {

                if(!response.error) {

                    $('#missions-mine').html(response.myReplaysHtml);
                    self.init('missions-mine');
                } else {
                    alert(response.error);
                }
            },
            error: function(error) {
                console.log('Error saving player ID', error);
            }
        });
    });
};

// Let's show events as fast as the browser can render them to avoid choking
// Especially useful on mobile / weaker CPUs
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 100);
        };
})();

function Timeline() {

    this.scrubber = null;
    this.speed = configDefaults.speed;
    this.timeJump = 1;
    this.timePointer = 0;
    this.playing = false;
    this.now;
    this.then = Date.now();
    this.delta;
    this.timeBounds = {
        "min": 0,
        "max": 0
    };
};

Timeline.prototype.setupScrubber = function(eventList) {

    var self = this;

    this.timeBounds.min = parseInt(eventList[0].missionTime);
    this.timeBounds.max = parseInt(eventList[eventList.length - 1].missionTime);

    //console.log(eventList);

    // Has the user shared a playback with a specific speed?
    if (typeof playBack.sharedPresets.speed !== "undefined")
        this.speed = playBack.sharedPresets.speed;

    this.scrubber = document.getElementById('timeline__silder');

    $('.timeline__silder__value').html(0);
    $('.timeline').removeClass('timeline--loading');

    this.timePointer = this.timeBounds.min;

    noUiSlider.create(this.scrubber, {
        start: this.timeBounds.min,
        animate: false,
        connect: 'lower',
        step: 1,
        range: {
            'min': this.timeBounds.min,
            'max': this.timeBounds.max
        }
    });

    //playBack.scrubber.noUiSlider.set(0);
    this.setupInteractionHandlers();
};

Timeline.prototype.setupInteractionHandlers = function() {

    var self = this;

    this.scrubber.noUiSlider.on('slide', function(value) {

        console.log('Sliding', Math.round(value[0]));

        self.skipTime(value[0]);
    });

    $('body').on('click', '.timeline__toggle-playback', function(e) {
        e.preventDefault();

        if (!self.playing) {

            $('.timeline__toggle-playback .fa').removeClass('fa-play').addClass('fa-pause');
            self.startTimer();

        } else {

            $('.timeline__toggle-playback .fa').removeClass('fa-pause').addClass('fa-play');
            self.stopTimer();
        }
    });

    $('body').on('click', '.timeline__speed', function(e) {

        e.preventDefault();

        self.changeSpeed($(this).data('speed'));
    });

    // Share button
    $('body').on('click', '.timeline__share', function(e) {
        e.preventDefault();

        self.stopTimer();

        var shareUrl = webPath + '/' + playBack.replayDetails.id + '/' + playBack.replayDetails.slug + '?share';

        var center = map.handler.getCenter();
        shareUrl += '&centerLat=' + center.lat;
        shareUrl += '&centerLng=' + center.lng;

        shareUrl += '&zoom=' + map.handler.getZoom();
        shareUrl += '&time=' + self.timePointer;
        shareUrl += '&speed=' + self.speed;

        if (players.trackTarget)
            shareUrl += '&track=' + players.trackTarget

        console.log(shareUrl);

        $.ajax({
            url: webPath + '/fetch-share-url',
            type: 'POST',
            dataType: 'json',
            data: { "url": shareUrl },
            success: function(shareUrl) {

                $('#modal__share .share__copy-link').val(shareUrl);

                modal.show('modal__share');

                var shareCopy = new Clipboard('.share__copy-link', {
                    text: function() {
                        return shareUrl;
                    }
                });

                shareCopy.on('success', function(e) {

                    // Highlight input on click for easier copy/paste
                    $('.share__copy-link').select();

                    $('.share__copy-link__container').addClass('share__copy-link__container--copied');

                    setTimeout(function() {
                        $('.share__copy-link__container').removeClass('share__copy-link__container--copied');
                        shareCopy.destroy();
                    }, 2000);
                });

                if (typeof window.history.pushState !== "undefined")
                    window.history.pushState({}, null, shareUrl);
            },
            error: function(jq, status, message) {
                console.log('Error fetching share URL - Status: ' + status + ' - Message: ' + message);
            }
        });
    });

    $('body').on('click', '.timeline__fullscreen', function(e) {

        e.preventDefault();

        if (screenfull.enabled) {
            screenfull.toggle();
        }
    });
}

Timeline.prototype.changeSpeed = function(speed) {

    $('.timeline__speed--active').removeClass('timeline__speed--active');

    $('.timeline__speed[data-speed="' + speed + '"]').addClass('timeline__speed--active');

    this.speed = speed;

    // If we increase the speed too much chances are the browser can't
    // keep up with the rendering so we need to start skipping events entirely
    if (this.speed == 60)
        this.timeJump = 5;
    else
        this.timeJump = 1;
}

Timeline.prototype.skipTime = function(value) {

    this.timePointer = Math.round(value);

    console.log('Skipping time', this.timePointer);

    // Clear down the map of existing markers, ready to time warp...
    markers.eventGroups.positions_vehicles.clearLayers();
    markers.eventGroups.positions_infantry.clearLayers();
    markers.currentList = {};
    markers.list = {};
    markers.currentUnits.positions_vehicles = [];
    markers.currentUnits.positions_infantry = [];

    if (!this.playing)
        this.startTimer();

    setTimeout(function() {
        players.updateList(true);
    }, 1000);
};

Timeline.prototype.startTimer = function() {

    var self = this;

    this.stopTimer();

    this.playing = true;

    $('.timeline__toggle-playback .fa').removeClass('fa-play').addClass('fa-pause');

    if (playBack.sharedPresets.trackPlayer)
        playBack.trackTarget = playBack.sharedPresets.trackPlayer;

    (function animloop() {

        if (!self.playing)
            return;

        requestAnimFrame(animloop);

        self.now = Date.now();
        self.delta = self.now - self.then;

        var interval = 1000 / self.speed;

        if (self.delta > interval && !map.zooming) {

            //console.log(self.timePointer, self.playing);

            self.scrubber.noUiSlider.set(self.timePointer);

            var date = new Date(null);
            date.setSeconds(self.timePointer);

            $('.noUi-handle').html(date.toISOString().substr(11, 8));

            if (parseInt($('.noUi-origin').css('left')) > 70)
                $('.noUi-handle').addClass('left-time');
            else
                $('.noUi-handle').removeClass('left-time');

            if (self.timePointer >= self.timeBounds.max)
                self.stopTimer();
            else
                events.showNext();

            self.then = self.now - (self.delta % interval);
        }
    })();
};

Timeline.prototype.stopTimer = function() {

    this.playing = false;

    console.warn('Timer stopped');

    $('.timeline__toggle-playback .fa').removeClass('fa-pause').addClass('fa-play');
};

var replayList = new ReplayList(),
    playBack = new PlayBack(),
    events = new Events(),
    players = new Players(),
    markers = new Markers(),
    poi = new Poi(),
    map = new Map(),
    timeline = new Timeline(),
    notifications = new Notifications(),
    modal = new Modal();

$('document').ready(function() {

    modal.setupInteractionHandlers();

    if($('.mission-list__tab').length) {
        replayList.init('missions-all');
        replayList.setupInteractionHandlers();
    }

    if(typeof replayDetails !== "undefined") {
        playBack.init(replayDetails, sharedPresets, cacheAvailable);
        notifications.init();
    }
});
