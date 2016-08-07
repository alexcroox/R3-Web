var playBackList = new PlayBackList(),
    playBack = new PlayBack();

$('document').ready(function() {

    if($('.playback-list').length)
        playBackList.init();

    if(typeof playBackPresets !== "undefined")
        playBack.init();
});
