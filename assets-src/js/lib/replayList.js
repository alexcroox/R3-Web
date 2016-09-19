function ReplayList() {

    this.list = {};
};

ReplayList.prototype.init = function() {

    console.log('Replay list init');

    this.list = new List('replay-list', {
        valueNames: [
            'mission-list__item__name',
            'mission-list__item__map',
            'mission-list__item__length',
            'mission-list__item__date'
        ],
        searchClass: 'mission-list__search',
        sortClass: 'mission-list__sort',
        plugins: [ListFuzzySearch()]
    });

    this.setupInteractionHandlers();
};

ReplayList.prototype.setupInteractionHandlers = function() {

};
