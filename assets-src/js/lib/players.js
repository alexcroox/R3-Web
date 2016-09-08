function Players() {

    this.list = {};
    this.groups = {};
};

Players.prototype.init = function() {

};

Players.prototype.fetch = function(replayId) {

    var self = this;

    $.ajax({
        url: webPath + '/fetch-players',
        type: 'POST',
        dataType: 'json',
        data: { "id": replayId },
        success: this.prepData.bind(self),
        error: function(jq, status, message) {
            console.log('Error fetching player data - Status: ' + status + ' - Message: ' + message);
        }
    });
};

Players.prototype.prepData = function(players) {

    var self = this;

    _.each(players, function(p) {

        self.list[p.id] = p;
    });
}

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
