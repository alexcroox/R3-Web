function Stats() {

    this.list;
};

Stats.prototype.init = function(listId) {

    console.log('stats init');

    this.lists = new List('stats-terrains', {
        valueNames: [
            'stats-list__item__map',
            'stats-list__item__play-count',
            'stats-list__item__last-played'
        ],
        searchClass: 'terrain-list__search',
        sortClass: 'missions-list__sort',
        listClass: 'list',
        plugins: [ListFuzzySearch()]
    });
};

Stats.prototype.setupInteractionHandlers = function() {

    var self = this;

    $('body').on('click', '.mission-list__sort', function(e) {

        if($(this).hasClass('mission-list__sort--asc'))
            $(this).removeClass('mission-list__sort--asc').addClass('mission-list__sort--desc');
        else
            $(this).removeClass('mission-list__sort--desc').addClass('mission-list__sort--asc');
    });
};
