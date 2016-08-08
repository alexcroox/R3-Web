$('document').ready(function() {

    var playBackList = new PlayBackList();

    if($('.playback-list').length)
        playBackList.init();

    if(typeof replayDetails !== "undefined")
        new PlayBack(replayDetails, sharedPresets, cacheAvailable);
});
