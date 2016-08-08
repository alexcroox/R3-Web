var playBackList = new PlayBackList(),
    playBack = new PlayBack();

$('document').ready(function() {

    if($('.playback-list').length)
        playBackList.init();

    if(typeof replayData !== "undefined")
        playBack.init(replayData);
});
