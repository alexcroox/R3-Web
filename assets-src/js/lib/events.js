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

                setTimeout(players.updateList, 500);

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

    var playerInfo = players.getInfo(victim.id);

    // Did this hit/killed/unconscious event have an attacker we can draw a connection from?
    if (attackerKnown) {

        // Are both units on the map currently?
        if (typeof markers.list[victim.unit] !== "undefined" && typeof markers.list[attacker.unit] !== "undefined") {

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

            message = playerInfo.name + ' ' + hitType + ' himself!';
        } else {

            if (attacker.weapon != "")
                message = playerInfo.name + ' was ' + hitType + ' by ' + attacker.weapon;
            else
                message = playerInfo.name + ' was ' + hitType;
        }

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
