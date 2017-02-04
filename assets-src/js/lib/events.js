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

            case "projectile":

                self.projectileExplode(eventValue);

                break;

            case "markers":

                objectiveMarkers.add(eventValue);

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

    //console.log(markers.list[victim.unit]);

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
                iconUrl: 'https://r3icons.titanmods.xyz/' + attacker.ammoType.toLowerCase() + '.png',
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

// Pulse a large circle around the attacker and animate a smoke or explosion where the projectile lands
Events.prototype.projectileExplode = function(eventData) {

    var self = this;

    var unit = eventData.unit;
    var projectileType = eventData.type;
    var ammoName = eventData.ammo.toLowerCase();
    var explodedPos = map.gamePointToMapPoint(eventData.position[0], eventData.position[1]);
    var unitMarker = markers.list[unit];

    var sourcePos = (typeof unitMarker !== "undefined") ? unitMarker.getLatLng() : false;

    var playerInfo = players.getInfo(eventData.id);

    if(projectileType == "grenade") {

        var explodePulse = L.circle(map.rc.unproject([explodedPos[0], explodedPos[1]]), 15, {
            weight: 1,
            color: 'black',
            opacity: 0.6,
            fill: true,
            className: 'projectile-grenade',
            clickable: false
        }).addTo(map.handler);

        setTimeout(function() {
            map.handler.removeLayer(explodePulse);
        }, 1000);
    } else {

        var color = '#CCC';

        if(ammoName.indexOf('purple') > -1)
            color = 'purple';

        if(ammoName.indexOf('green') > -1)
            color = 'green';

        if(ammoName.indexOf('red') > -1)
            color = 'red';

        if(ammoName.indexOf('blue') > -1)
            color = 'blue';

        //console.log(ammoName, color);

        var smokeCircle = L.circle(map.rc.unproject([explodedPos[0], explodedPos[1]]), 50, {
            weight: 40,
            color: color,
            opacity: 0.5,
            className: 'projectile-smoke',
            clickable: false
        }).addTo(map.handler);

        setTimeout(function() {
            map.handler.removeLayer(smokeCircle);
        }, 5000);
    }
};
