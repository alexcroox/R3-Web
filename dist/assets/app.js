function Map(terrainName, tileSubDomains, cb) {

    this.terrain = terrainName;
    this.tileSubDomains = tileSubDomains;

    this.init(cb);
};

Map.prototype.init = function(cb) {

    var self = this;

    $.getJSON(webPath + '/maps/' + this.terrain + '/config.json', function(configJson) {
            self.config = configJson;
            self.render(cb);
        })
        .fail(function() {
            console.log("Error loading terrain config");
            cb(true);
        });
};

Map.prototype.render = function(cb) {

    // Create the base map using our terrain settings
    this.handler = new L.Map('map', {
        "minZoom": this.config.minZoom,
        "maxZoom": this.config.maxZoom,
        "zoom": this.config.initZoom,
        "attributionControl": false,
        //"measureControl": true
    });

    this.currentZoomLevel = this.config.initZoom;

    $('#map').css('background-color', this.config.bgColor);

    // Assign map and image dimensions
    this.rc = new L.RasterCoords(this.handler, [this.config.width, this.config.height]);

    // Set the bounds on the map, give us plenty of padding to avoid a map bouncing loop
    var southWest = this.rc.unproject([0, this.config.height]);
    var northEast = this.rc.unproject([this.config.width, 0]);

    this.mapBounds = new L.LatLngBounds(southWest, northEast);
    var panningBounds = this.mapBounds.pad(1);

    this.handler.setMaxBounds(panningBounds);

    // We need to set an initial view for the tiles to render
    this.setView([this.config.height / 2, this.config.width / 2], this.config.initZoom);

    // Inject sub domain support for faster tile loading (if supported)
    var tileUrl = (this.tileSubDomains) ? webPath.replace("//", "//{s}.") : webPath;

    // Add our terrain generated tiles
    this.layer = L.tileLayer(tileUrl + '/maps/' + this.terrain + '/tiles/{z}/{x}/{y}.png', {
        noWrap: true,
        errorTileUrl: webPath + '/assets/images/map/error-tile.png'
    }).addTo(this.handler);

    this.setupInteractionHandlers();

    var poi = new Poi(this);
    poi.setup(this.terrain);

    cb(false);
};

Map.prototype.setupInteractionHandlers = function() {

    var self = this;

    // We need to store our current zoom level for toggling visibility on terrain points of interest (height markers, town names)
    this.handler.on('zoomend', function(e) {

        self.currentZoomLevel = e.target._zoom;

        console.log('Zoom changed', self.currentZoomLevel);
    });

    // We need to store our current map center for sharing playback positions
    this.handler.on('dragend', function(e) {

        var currentCenter = self.rc.project(self.handler.getCenter());
        var currentZoom = self.handler.getZoom();

        console.log(currentCenter, currentZoom);
    });
};

Map.prototype.setView = function(pos, zoom) {

    this.handler.setView(this.rc.unproject(pos), zoom);
};

Map.prototype.gamePointToMapPoint = function(x, y) {

    if (this.config.doubleSize == "1") {

        var convertedX = x * 2;
        var convertedY = Math.abs((y - (this.config.height / 2)) * 2);

    } else {

        var convertedX = x;
        var convertedY = Math.abs(parseFloat(y) - parseFloat(this.config.height));
    }

    return [convertedX, convertedY];
}

Map.prototype.mapPointToGamePoint = function(x, y, grid) {

    grid = grid || false;

    if (typeof x === "object") {
        y = x.y;
        x = x.x;
    }

    if (this.config.doubleSize == "1") {

        var convertedX = x / 2;
        var convertedY = Math.abs((y - this.config.height) / 2);
    } else {

        var convertedX = x;
        var convertedY = Math.abs(parseFloat(y) + parseFloat(this.config.height));
    }

    if (!grid)
        return [convertedX, convertedY];
    else
        return map.gameToGrid(convertedX, convertedY);
}

Map.prototype.gameToGrid = function(x, y) {

    var gridX = Math.round((x * 100) / 100) / 100;
    var gridY = Math.round((y * 100) / 100) / 100;

    //gridY = (gridY * 100) / 100;

    return [gridX, gridY];
};

function PlayBack(replayDetails, sharedPresets, cacheAvailable) {

    this.eventGroups = {
        'positions_vehicles': {},
        'positions_infantry': {}
    };
    this.currentIds = {
        "positions_vehicles": [],
        "positions_infantry": []
    };
    this.map = {};
    this.events = {};
    this.timeline = {};
    this.playerList = {};
    this.playerGroups = {};
    this.players = {};
    this.markers = {};
    this.matchedIcons = {};
    this.trackTarget = false;
    this.zoomedToFirstPlayer = false;
    // Used to debug missing icons
    this.unknownClasses = [];

    var self = this;

    this.replayDetails = JSON.parse(replayDetails);
    this.sharedPresets = JSON.parse(sharedPresets);

    // Setup map with our chosen terrain
    this.map = new Map(this.replayDetails.map, this.replayDetails.tileSubDomains, function(error) {

        if (error)
            return;

        // Fetch our event data from the server
        self.fetch(cacheAvailable);
    });
};

PlayBack.prototype.fetch = function(cacheAvailable) {

    var eventSourceUrl = (!cacheAvailable) ? webPath + '/fetch-data' : webPath + '/cache/events/' + this.replayDetails.id + '.json';
    var fetchType = (!cacheAvailable) ? 'POST' : 'GET';

    var self = this;

    $.ajax({
        url: eventSourceUrl,
        type: fetchType,
        dataType: 'json',
        data: { "id": this.replayDetails.id },
        success: this.prepData.bind(self),
        error: function(jq, status, message) {
            console.log('Error fetching playback data - Status: ' + status + ' - Message: ' + message);
        }
    });
};

PlayBack.prototype.prepData = function(eventList) {

    var self = this;

    // Setup seperate layers for vehicles and infantry
    this.eventGroups.positions_vehicles = new L.LayerGroup([], {
        makeBoundsAware: false
    });

    this.eventGroups.positions_infantry = new L.LayerGroup([], {
        makeBoundsAware: false
    });

    this.eventGroups.positions_vehicles.addTo(this.map.handler);
    this.eventGroups.positions_infantry.addTo(this.map.handler);

    // Calculate our time range and combine events with the same mission time
    _.each(eventList, function(e) {

        if (typeof self.eventList[e.time] === "undefined")
            self.eventList[e.time] = [];

        self.eventList[e.time].push(e);
    });

    this.timeline = new Timeline(this);
    this.timeline.setupScrubber(this.eventList);
    this.timeline.changeSpeed(this.timeline.speed);

    // Are we loading a shared playback? If so load their POV at time of sharing
    if (this.sharedPresets.centerLat) {

        this.map.handler.setView([this.sharedPresets.centerLat, this.sharedPresets.centerLng], this.sharedPresets.zoom);

        this.timeline.timePointer = this.sharedPresets.time;

        this.timeline.skipTime(this.sharedPresets.time);
    } else {
        this.timeline.startTimer();
    }
};

function PlayBackList() {

};

PlayBackList.prototype.init = function() {

};
function Poi(map) {

    this.map = map;

    this.ready = false;
    this.poiLayers = {};
};

Poi.prototype.setup = function(terrainName) {

    this.terrain = terrainName;
    this.setupInteractionHandlers();
    this.add();
}

Poi.prototype.setupInteractionHandlers = function() {

    var self = this;

    // When we zoom we need to filter our POIs from view to avoid clutter
    this.map.handler.on('zoomend', function(e) {

        self.filterZoomLayers();
    });
};

Poi.prototype.add = function() {

    var self = this;

    $.getJSON(webPath + '/maps/' + this.terrain + '/poi.json', function(poiJson) {

        async.forEachOf(poiJson, function(poi, key, callback) {

            var lg;

            // Setup layer group for POI so we can toggle it based on zoom levels
            if (typeof self.poiLayers[poi.type] === "undefined") {

                if (poi.type != "mount") {

                    lg = new L.featureGroup();

                    lg.addTo(self.map.handler);
                } else {

                    lg = new L.LayerGroup([], {
                        makeBoundsAware: true
                    });
                }

                self.poiLayers[poi.type] = lg;
            } else {
                lg = self.poiLayers[poi.type];
            }

            var poiIconName = 'blank';
            var poiOffset = [0, 0];
            var iconSize = [30, 30];
            var iconAnchor = [15, 15];

            switch (poi.type) {

                case "hill":
                    poiIconName = 'hill_ca';
                    poiOffset = [10, 0];
                    iconSize = [15, 15];
                    iconAnchor = [7, 7];
                    break;

                case "rockarea":
                    poiIconName = 'rockarea_ca';
                    poiOffset = [10, 0];
                    iconSize = [15, 15];
                    iconAnchor = [7, 7];
                    break;
            }

            var poiIcon = L.icon({
                iconUrl: webPath + '/assets/images/map/markers/poi/' + poiIconName + '.png',
                iconSize: iconSize,
                iconAnchor: iconAnchor,
                className: 'poi-image--' + poi.type
            });

            var pos = self.map.gamePointToMapPoint(poi.x, poi.y);

            var poiLabel = L.marker(self.map.rc.unproject([pos[0], pos[1]]), {
                icon: poiIcon,
                clickable: false
            }).bindLabel(poi.label, {
                noHide: true,
                className: 'poi poi-' + poi.type,
                offset: poiOffset
            });

            lg.addLayer(poiLabel);

            callback();
        }, function(err) {

            self.ready = true;
            self.filterZoomLayers();
        });
    })
    .fail(function(err) {
        console.log("Error loading terrain POI, does the JSON file exist and is it valid JSON?", err);
    });
};

// Filter out poi layers based on current zoom level.
// Keeps map clutter free at lower zoom levels
Poi.prototype.filterZoomLayers = function() {

    if(!this.ready)
        return;

    var self = this;
    var zoom = self.map.handler.getZoom();

    _.each(this.poiLayers, function(layer, type) {

        if(zoom < 4 && (type != 'namecitycapital' && type != 'namecity' && type != 'mount'))
            self.map.handler.removeLayer(self.poiLayers[type]);

        if(zoom > 3 && type != 'mount')
            self.poiLayers[type].addTo(self.map.handler);

        if(zoom > 5 && type == 'mount')
            self.poiLayers[type].addTo(self.map.handler);

        if(zoom < 6 && type == 'mount')
            self.map.handler.removeLayer(self.poiLayers[type]);
    });
};

// Let's show events as fast as the browser can render them to avoid choking
// Especially useful on mobile / weaker CPUs
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 100);
        };
})();

function Timeline(playBack) {

    this.scrubber = null;
    this.playBack = playBack;
    this.speed = 30;
    this.timeJump = 1;
    this.timePointer = 0;
    this.playing = false;
    this.now;
    this.then = Date.now();
    this.delta;
    this.timeBounds = {
        "min": 0,
        "max": 0
    };
};

Timeline.prototype.setupScrubber = function(eventList) {

    var self = this;

    self.timeBounds.min = parseInt(eventList[0].time);
    self.timeBounds.max = parseInt(eventList[eventList.length - 1].time);

    // Has the user shared a playback with a specific speed?
    if (typeof this.playBack.sharedPresets.speed !== "undefined")
        this.speed = this.playBack.sharedPresets.speed;

    this.scrubber = $('timeline__silder').get(0);

    $('.timeline__silder__value').html(0);
    $('.timeline__silder').removeClass('timeline__silder--loading');

    console.log('Range', playBack.timeBounds);

    playBack.eventPointer = playBack.timeBounds.min;

    noUiSlider.create(this.scrubber, {
        start: this.timeBounds.min,
        animate: false,
        connect: 'lower',
        step: 1,
        range: {
            'min': this.timeBounds.min,
            'max': this.timeBounds.max
        }
    });

    //playBack.scrubber.noUiSlider.set(0);
    this.setupInteractionHandlers();
};

Timeline.prototype.setupInteractionHandlers = function() {

    this.scrubber.noUiSlider.on('slide', function(value) {

        console.log('Sliding', Math.round(value[0]));

        this.skipTime(value[0]);
    });
}

Timeline.prototype.changeSpeed = function(speed) {

    $('.timeline__speed.active').removeClass('timeline__speed--active');

    $('.timeline__speed[data-speed="' + speed + '"]').addClass('timeline__speed--active');

    this.speed = speed;

    // If we increase the speed too much chances are the browser can't
    // keep up with the rendering so we need to start skipping events entirely
    if(this.speed == 60)
        this.timeJump = 5;
    else
        this.timeJump = 1;
}

Timeline.prototype.skipTime = function(value) {

    this.timePointer = Math.round(value);

    // Clear down the map of existing markers, ready to time warp...
    this.playBack.eventGroups.positions_vehicles.clearLayers();
    this.playBack.eventGroups.positions_infantry.clearLayers();
    this.playBack.markers = {};
    this.playBack.currentIds.positions_vehicles = [];
    this.playBack.currentIds.positions_infantry = [];

    if (!this.playing)
        this.startTimer();
};

Timeline.prototype.startTimer = function () {

    var self = this;

    this.stopTimer();

    this.playing = true;

    $('.timeline__toggle-playback .fa').removeClass('fa-play').addClass('fa-pause');

    if (this.playBack.sharedPresets.trackPlayer)
        playBack.trackTarget = this.playBack.sharedPresets.trackPlayer;

    (function animloop() {

        if (!self.playing)
            return;

        requestAnimFrame(animloop);

        self.now = Date.now();
        self.delta = self.now - self.then;

        var interval = 1000 / self.speed;

        if (self.delta > interval) {

            //console.log(self.timePointer, self.timeBounds.max);

            self.scrubber.noUiSlider.set(self.timePointer);

            var date = new Date(null);
            date.setSeconds(self.timePointer);

            $('.noUi-handle').html(date.toISOString().substr(11, 8));

            if (parseInt($('.noUi-origin').css('left')) > 70)
                $('.noUi-handle').addClass('left-time');
            else
                $('.noUi-handle').removeClass('left-time');

            if (self.timePointer >= self.timeBounds.max)
                self.stopTimer();
            else
                self.playBack.showNextEvent();

            self.then = self.now - (self.delta % interval);
        }
    })();
};

Timeline.prototype.stopTimer = function() {

    this.playing = false;

    console.warn('Timer stopped');

    $('.timeline__toggle-playback .fa').removeClass('fa-pause').addClass('fa-play');
};

$('document').ready(function() {

    var playBackList = new PlayBackList();

    if($('.playback-list').length)
        playBackList.init();

    if(typeof replayDetails !== "undefined")
        new PlayBack(replayDetails, sharedPresets, cacheAvailable);
});
