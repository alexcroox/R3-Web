function Events(playBack) {

    this.playBack = playBack;
    this.markers = playBack.markers;
    this.map = playBack.map;
};

Events.prototype.actionType = function(type, replayEvent, eventValue) {

    var self = this;

    if (type == "positions_vehicles" || type == "positions_infantry") {

        self.markers.findAndRemoveOld(replayEvent, eventValue);

    } else {

        switch (type) {

            // If the unit gets into a vehicle we can remove their infantry icon immediately
            case "get_in":

                self.markers.removeUnit(Object.keys(eventValue)[0]);

                break;

            case "player_disconnected":

                var playerId = eventValue[Object.keys(eventValue)[0]].id;
                var playerInfo = self.playBack.getPlayerInfo(playerId);

                //console.log('Player disconnected', playerInfo);

                if (typeof playerInfo !== "undefined")
                    self.playback.notifications.info(playerInfo.name + ' disconnected');

                self.markers.removeUnit(Object.keys(eventValue)[0]);

                break;

            case "player_connected":

                var playerId = eventValue[Object.keys(eventValue)[0]].id;
                var playerInfo = self.playBack.getPlayerInfo(playerId);

                //console.log('Player connected', playerInfo);

                if (typeof playerInfo !== "undefined")
                    self.playback.notifications.info(playerInfo.name + ' connected');

                break;

            case "unit_awake":

                self.markers.removeUnit(Object.keys(eventValue)[0]);

                break;

            case "unit_unconscious":

                self.attacked('downed', eventValue);

                break;

            case "unit_killed":

                self.attacked('killed', eventValue);

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
    var launchPos = this.map.gamePointToMapPoint(attacker.pos[0], attacker.pos[1]);
    var victimMarker = this.list[victim.unit];

    var targetPos = (typeof victimMarker !== "undefined") ? victimMarker.getLatLng() : false;

    var playerInfo = this.playBack.getPlayerInfo(victim.id);

    var launchPulse = L.circle(this.map.rc.unproject([launchPos[0], launchPos[1]]), 50, {
        weight: 1,
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        className: 'missile-launch',
        clickable: false
    }).addTo(map.m);

    setTimeout(function() {
        self.map.handler.removeLayer(launchPulse);
    }, 1000);

    if (targetPos) {

        var projectileIcon = L.marker(this.map.rc.unproject([launchPos[0], launchPos[1]]), {
            icon: L.icon({
                iconUrl: webPath + '/assets/images/map/markers/' + attacker.ammoType.toLowerCase() + '.png',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                className: 'projectile-' + attacker.ammoType.toLowerCase()
            }),
            clickable: false
        }).addTo(this.map.handler);

        setTimeout(function() {
            projectileIcon.setLatLng(targetPos);
        }, 50);

        setTimeout(function() {
            self.map.handler.removeLayer(projectileIcon);
        }, 1000);
    }

    if (typeof playerInfo !== "undefined")
        self.playBack.notifications.info(attacker.ammoType + ' Launch at ' + playerInfo.name);
};
