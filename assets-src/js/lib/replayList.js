function ReplayList() {

    this.lists = {
        "missions-all": null,
        "missions-mine": null
    };
};

ReplayList.prototype.init = function(listId) {

    if(this.lists[listId])
        return;

    this.lists[listId] = new List(listId, {
        valueNames: [
            listId + '-mission-list__item__name',
            listId + '-mission-list__item__map',
            listId + '-mission-list__item__length',
            listId + '-mission-list__item__player-count',
            listId + '-mission-list__item__date'
        ],
        searchClass: listId + '-mission-list__search',
        sortClass: listId + '-mission-list__sort',
        listClass: listId + '-list',
        plugins: [ListFuzzySearch()]
    });
};

ReplayList.prototype.setupInteractionHandlers = function() {

    var self = this;

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

    $('body').on('click', '.mission-list__tab', function(e) {

        e.preventDefault();

        var currentList = $('.mission-list__tab--active').attr('data-list');
        var targetList = $(this).attr('data-list');

        $('.mission-list__tab--active').removeClass('mission-list__tab--active');
        $('.mission-list--active').removeClass('mission-list--active');

        $(this).addClass('mission-list__tab--active');
        $('#' + targetList).addClass('mission-list--active');

        if(!$('#' + targetList + ' input[name="my-player-id"]').length)
            self.init(targetList);
        else
            return;

        // Set the search input to match previous tab
        var currentSearchTerm = $('.' + currentList + '-mission-list__search').val();
        $('.' + targetList + '-mission-list__search').val(currentSearchTerm);
        self.lists[targetList].search(currentSearchTerm);
    });

    $('body').on('click', '.new-user__save', function(e) {
        e.preventDefault();

        $.ajax({
            url: webPath + '/save-player-id',
            type: 'POST',
            dataType: 'json',
            data: { id: $('input[name="my-player-id"]').val() },
            success: function(response) {

                if(!response.error) {

                    $('#missions-mine').html(response.myReplaysHtml);
                    self.init('missions-mine');
                } else {
                    alert(response.error);
                }
            },
            error: function(error) {
                console.log('Error saving player ID', error);
            }
        });
    });
};
