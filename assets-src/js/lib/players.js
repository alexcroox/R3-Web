function Players() {

    this.masterList = {};
    this.currentList = {};
    this.groups = {};
    this.trackTarget = false;
    this.collapseList = {};
    this.listInactiveTimer = null;
    this.listFadeTime = 3; // seconds before player list fades out
};

Players.prototype.init = function() {

    this.prepData(playerList);

    this.setupInteractionHandlers();
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

        $(this).next('.expand-list').slideToggle();
        $(this).toggleClass('expand');

        var groupName = $(this).parent().attr('data-group');

        if(!$(this).hasClass('expand'))
            self.collapseList[groupName] = true;
        else
            delete self.collapseList[groupName];
    });
}

// Countdown to hiding the player list
Players.prototype.startInactiveListTimer = function(timeout) {

    // Did we specify a custom timeout? If not use default
    timeout = timeout || this.listFadeTime;

    this.listInactiveTimer = setTimeout(function() {

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

    // Does this player's group exist yet?
    if (typeof this.groups[group] === "undefined")
        this.groups[group] = {
            "factionData": factionData,
            "members": []
        };

    // Add them to the group
    this.groups[group].members.push(id);

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
Players.prototype.updateList = function() {

    console.log('Updating player list', this.groups);

    var self = this;

    var $playerListContainer = $('.player-list');
    var $playerList = $('.player-list__content');
    $playerList.html('');

    var sortedGroups = this.sortGroups(this.groups);
    var factionsUsed = [];

    _.each(sortedGroups, function(groupData, groupName) {

        var factionName = groupData.factionData.name;

        if(factionsUsed.indexOf(factionName) === -1) {

            // Since we are rebuilding the list every time we need to restore the expand/collapse state
            var expandClass = (typeof self.collapseList[factionName] === "undefined")? 'expand' : 'collapse';
            $playerList.append('<div class="player-list__faction" data-group="' + factionName + '"><a href="#" class="expand-handle ' + expandClass + '">' + factionName + '</a> <div class="expand-list"></div></div>');
            factionsUsed.push(factionName);
        }

        var expandClass = (typeof self.collapseList[groupName] === "undefined")? 'expand' : 'collapse';
        $('.player-list__faction[data-group="' + factionName + '"]').find('.expand-list').eq(0).append('<div class="player-list__group" data-group="' + groupName + '"><a href="#" class="expand-handle ' + expandClass + '">' + groupName + '</a> <div class="expand-list"></div></div>');

        _.each(groupData.members, function(playerId) {

            var playerData = self.getInfo(playerId);

            var imgUrl = (typeof markers.list[playerData.unit] !== "undefined")? markers.list[playerData.unit].iconUrl : webPath + '/assets/images/map/markers/blank.png';
            imgUrl = imgUrl.replace(".png", "-trim.png");

            var trackingClass = (self.trackTarget == playerId)? 'player-list__group__member--tracking' : '';

            $('.player-list__group[data-group="' + groupName + '"]').find('.expand-list').eq(0).append('\
                <a href="#" class="player-list__group__member ' + trackingClass + '" data-id="' + playerId + '">\
                    <img src="' + imgUrl + '">\
                    ' + playerData.name + '\
                </a>');
        });
    });

    $playerListContainer.show();
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
}

Players.prototype.sortGroups = function(map) {

    var keys = _.sortBy(_.keys(map), function(a) { return a; });
    var newmap = {};
    _.each(keys, function(k) {
        newmap[k] = map[k];
    });
    return newmap;
};
