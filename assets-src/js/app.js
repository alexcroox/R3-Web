var replayList = new ReplayList(),
    playBack = new PlayBack(),
    events = new Events(),
    players = new Players(),
    markers = new Markers(),
    poi = new Poi(),
    map = new Map(),
    timeline = new Timeline(),
    notifications = new Notifications();

$('document').ready(function() {

    if($('.playback-list').length)
        replayList.init();

    if(typeof replayDetails !== "undefined")
        playBack.init(replayDetails, sharedPresets, cacheAvailable);
});
