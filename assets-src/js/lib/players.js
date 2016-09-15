function Players() {

    this.masterList = {};
    this.currentList = {};
    this.groups = {};
};

Players.prototype.init = function() {

    this.prepData(playerList);
};

Players.prototype.prepData = function(allPlayers) {

    console.log('Prepping master list');

    var self = this;

    _.each(allPlayers, function(p) {

        self.masterList[p.id] = p;
    });

    this.updateList();
}

Players.prototype.add = function(id, name, group) {

    console.log('Adding player', name);

    this.currentList[id] = {
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

    $('.player-list').html('');

    var playerListHtml = '';

    var sortedGroups = this.sortGroups(this.groups);

    _.each(sortedGroups, function(groupData, groupName) {

        playerListHtml += '<ul><li>' + groupName + '</li><ul>';

        _.each(groupData, function(groupMember) {

            var playerName = self.getNameFromId(groupMember);

            playerListHtml += '<li>' + playerName + '</li>';
        });

        playerListHtml += '</ul></ul>';
    });

    $('.player-list').html(playerListHtml);
};

Players.prototype.sortGroups = function(map) {

    var keys = _.sortBy(_.keys(map), function(a) { return a; });
    var newmap = {};
    _.each(keys, function(k) {
        newmap[k] = map[k];
    });
    return newmap;
};
