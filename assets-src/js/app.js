$('document').ready(function() {

    var replayList = new ReplayList();
    var playBack = new playBack();

    if($('.playback-list').length)
        replayList.init();

    if(typeof replayDetails !== "undefined")
        playBack.init(replayDetails, sharedPresets, cacheAvailable);
});
