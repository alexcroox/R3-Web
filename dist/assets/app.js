function Map() {

};

Map.prototype.init = function() {

};

function PlayBack() {
    this.map = {};
};

PlayBack.prototype.init = function() {



    this.map = new Map();
};

function PlayBackList() {

};

PlayBackList.prototype.init = function() {

};
var playBackList = new PlayBackList(),
    playBack = new PlayBack();

$('document').ready(function() {

    if($('.playback-list').length)
        playBackList.init();

    if(typeof playBackPresets !== "undefined")
        playBack.init();
});
