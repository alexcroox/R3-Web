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

    if(typeof this.masterList[id] !== "undefined") {
        this.masterList[id].unit = unit;
        this.masterList[id].group = group;
    }

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
