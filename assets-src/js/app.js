var replayList = new ReplayList(),
    playBack = new PlayBack(),
    events = new Events(),
    players = new Players(),
    markers = new Markers(),
    poi = new Poi(),
    objectiveMarkers = new ObjectiveMarkers(),
    map = new Map(),
    timeline = new Timeline(),
    notifications = new Notifications(),
    modal = new Modal();

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
});
