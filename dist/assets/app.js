function Map(mapName) {

    this.name = mapName;

    this.init();
};

Map.prototype.init = function() {

};

function PlayBack() {
    this.map = {};
    this.replayData = {};
};

PlayBack.prototype.init = function(data) {

    this.replayData = JSON.parse(data);
    this.map = new Map(this.replayData.map);
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

    if(typeof replayData !== "undefined")
        playBack.init(replayData);
});
