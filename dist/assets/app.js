function Events() {

    this.list = {};
};

Events.prototype.showNext = function() {

    var self = this;

    // Do we have any events for this mission time?
    if (typeof this.list[timeline.timePointer] !== "undefined") {

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

        console.error(json);

        // Stop playback on bad json
        timeline.stopTimer(true);

        return false;
    }
};

Events.prototype.actionType = function(type, replayEvent, eventValue) {

    var self = this;

    if (type == "positions_vehicles" || type == "positions_infantry") {

        markers.process(replayEvent, eventValue, type);

    } else {

        switch (type) {

            // If the unit gets into a vehicle we can remove their infantry icon immediately
            case "get_in":

                markers.removeUnit(Object.keys(eventValue)[0]);

                break;

            case "player_disconnected":

                var playerId = eventValue[Object.keys(eventValue)[0]].id;
                var playerInfo = players.getInfo(playerId);

                //console.log('Player disconnected', playerInfo);

                if (typeof playerInfo !== "undefined")
                    notifications.info(playerInfo.name + ' disconnected');

                markers.removeUnit(Object.keys(eventValue)[0]);

                break;

            case "player_connected":

                var playerId = eventValue[Object.keys(eventValue)[0]].id;
                var playerInfo = players.getInfo(playerId);

                //console.log('Player connected', playerInfo);

                if (typeof playerInfo !== "undefined")
                    notifications.info(playerInfo.name + ' connected');

                break;

            case "unit_awake":

                markers.removeUnit(Object.keys(eventValue)[0]);

                break;

            case "unit_unconscious":

                //self.attacked('downed', eventValue);

                break;

            case "unit_killed":

                //self.attacked('killed', eventValue);

                break;

            case "incoming_missile":

                self.projectileLaunch(eventValue);
                break;

            default:
                console.warn('Unknown event', type);
        }
    }
};

// Pulse a large circle around the attacker and animate a M m m towards the victim
Events.prototype.projectileLaunch = function(eventData) {

    var self = this;

    var victim = eventData.victim;
    var attacker = eventData.attacker;
    var launchPos = map.gamePointToMapPoint(attacker.pos[0], attacker.pos[1]);
    var victimMarker = this.markers.list[victim.unit];

    var targetPos = (typeof victimMarker !== "undefined") ? victimMarker.getLatLng() : false;

    var playerInfo = players.getInfo(victim.id);

    var launchPulse = L.circle(map.rc.unproject([launchPos[0], launchPos[1]]), 50, {
        weight: 1,
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        className: 'missile-launch',
        clickable: false
    }).addTo(map.m);

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
};

Map.prototype.init = function(terrainName, tileSubDomains, cb) {

    var self = this;

    this.terrain = terrainName;
    this.tileSubDomains = tileSubDomains;

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
        "minZoom": this.config.minZoom,
        "maxZoom": this.config.maxZoom,
        "zoom": this.config.initZoom,
        "attributionControl": false,
        //"measureControl": true
    });

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

    // Add our terrain generated tiles
    this.layer = L.tileLayer(tileUrl + '/maps/' + this.terrain + '/tiles/{z}/{x}/{y}.png', {
        noWrap: true,
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

    // We need to store our current map center for sharing playback positions
    this.handler.on('dragend', function(e) {

        var currentCenter = self.rc.project(self.handler.getCenter());
        var currentZoom = self.handler.getZoom();

        console.log(currentCenter, currentZoom);
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

function Notifications() {

    this.enabled = true;
    this.minWidth = 800;
};

Notifications.prototype.setup = function() {


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

    console.log(message);
};

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

function Players() {

    this.list = {};
    this.groups = {};
};

Players.prototype.init = function() {

};

Players.prototype.add = function(id, name, group) {

    this.list[id] = {
        "name": name
    };

    // Does this player's group exist yet?
    if (typeof this.groups[group] === "undefined")
        this.groups[group] = [];

    // Add them to the group
    this.groups[group].push(id);

    // Update our sidebar list
    this.updateList();
}

Players.prototype.getInfo = function(id) {

    return _.find(this.list, function(player) {
        return player.id == id;
    });
};

Players.prototype.getNameFromId = function(id) {

    var playerInfo = this.getInfo(id);

    return (typeof playerInfo === "undefined")? "Unknown" : playerInfo.name;
};

// Update the sidebar player list
Players.prototype.updateList = function() {

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

            // Setup layer group for POI so we can toggle it based on zoom levels
            if (typeof self.poiLayers[poi.type] === "undefined") {

                if (poi.type != "mount") {

                    lg = new L.featureGroup();

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

};

ReplayList.prototype.init = function() {

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
    this.speed = 30;
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

    // Has the user shared a playback with a specific speed?
    if (typeof playBack.sharedPresets.speed !== "undefined")
        this.speed = playBack.sharedPresets.speed;

    this.scrubber = document.getElementById('timeline__silder');

    $('.timeline__silder__value').html(0);
    $('.timeline__silder').removeClass('timeline__silder--loading');

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

    $('body').on('click', '.timeline__share', function(e) {
        e.preventDefault();

        self.stopTimer();

        var shareUrl = webPath + '/' + playBack.replayDetails.id + '/' + playBack.replayDetails.slug + '?playback';

        var center = playBack.map.handler.getCenter();
        shareUrl += '&centerLat=' + center.lat;
        shareUrl += '&centerLng=' + center.lng;

        shareUrl += '&zoom=' + playBack.map.handler.getZoom();
        shareUrl += '&time=' + self.timePointer;
        shareUrl += '&speed=' + self.speed;

        if (playBack.trackTarget)
            shareUrl += '&track=' + playBack.trackTarget

        $('.timeline__share__details input').val(shareUrl);

        // Show modal here
    });

    $('body').on('click', '.timeline__fullscreen', function(e) {

        e.preventDefault();

        if (screenfull.enabled) {
            screenfull.toggle();
        }
    });
}

Timeline.prototype.changeSpeed = function(speed) {

    $('.timeline__speed.active').removeClass('timeline__speed--active');

    $('.timeline__speed[data-speed="' + speed + '"]').addClass('timeline__speed--active');

    this.speed = speed;

    // If we increase the speed too much chances are the browser can't
    // keep up with the rendering so we need to start skipping events entirely
    if(this.speed == 60)
        this.timeJump = 5;
    else
        this.timeJump = 1;
}

Timeline.prototype.skipTime = function(value) {

    this.timePointer = Math.round(value);

    // Clear down the map of existing markers, ready to time warp...
    markers.eventGroups.positions_vehicles.clearLayers();
    markers.eventGroups.positions_infantry.clearLayers();
    markers.list = {};
    markers.currentIds.positions_vehicles = [];
    markers.currentIds.positions_infantry = [];

    if (!this.playing)
        this.startTimer();
};

Timeline.prototype.startTimer = function () {

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

        if (self.delta > interval) {

            console.log(self.timePointer, self.playing);

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
    notifications = new Notifications();

$('document').ready(function() {

    if($('.playback-list').length)
        replayList.init();

    if(typeof replayDetails !== "undefined")
        playBack.init(replayDetails, sharedPresets, cacheAvailable);
});
