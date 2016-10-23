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
            'mission-list__item__player-count',
            'mission-list__item__date'
        ],
        searchClass: 'mission-list__search',
        sortClass: 'mission-list__sort',
        plugins: [ListFuzzySearch()]
    });

    this.setupInteractionHandlers();
};

ReplayList.prototype.setupInteractionHandlers = function() {

    $('body').on('click', '.mission-list__sort', function(e) {

        if($(this).hasClass('mission-list__sort--asc'))
            $(this).removeClass('mission-list__sort--asc').addClass('mission-list__sort--desc');
        else
            $(this).removeClass('mission-list__sort--desc').addClass('mission-list__sort--asc');
    });

    $('body').on('focus', '.text-input--with-icon .text-input', function(e) {

        $(this).parent().removeClass('text-input--with-icon--unfocused');
    });

    $('body').on('blur', '.text-input--with-icon .text-input', function(e) {

        $(this).parent().addClass('text-input--with-icon--unfocused');
    });
};
