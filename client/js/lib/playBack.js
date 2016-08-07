function PlayBack() {
    this.map = {};
    this.replayData = {};
};

PlayBack.prototype.init = function(data) {

    this.replayData = JSON.parse(data);
    this.map = new Map(this.replayData.map);
};
