var replayList = new ReplayList(),
    stats = new Stats(),
    playBack = new PlayBack(),
    events = new Events(),
    players = new Players(),
    markers = new Markers(),
    poi = new Poi(),
    objectiveMarkers = new ObjectiveMarkers(),
    map = new Map(),
    timeline = new Timeline(),
    notifications = new Notifications(),
    modal = new Modal(),
    admin = new Admin();

$('document').ready(function() {

    modal.setupInteractionHandlers();

    if($('.mission-list__tab').length) {
        replayList.init('missions-all');
        replayList.setupInteractionHandlers();
    }

    if(typeof replayDetails !== "undefined") {
        playBack.init(replayDetails, sharedPresets, cacheAvailable);
        notifications.init();
    }

    if($('#stats-terrains').length) {
        stats.init();
        stats.setupInteractionHandlers();
    };

    $('body').on('click', '.js-help', function(e) {
        e.preventDefault();

        modal.show('modal__help');
    });
});
