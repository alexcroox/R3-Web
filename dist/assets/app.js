function Map(terrainName, tileSubDomains) {

    this.terrain = terrainName;
    this.tileSubDomains = tileSubDomains;

    this.init();
};

Map.prototype.init = function() {

    var self = this;

    $.getJSON(webPath + '/maps/' + this.terrain + '/config.json', function(configJson) {
        self.config = configJson;
        self.render();
    })
    .fail(function() {
        console.log("Error loading terrain config");
    });
};

Map.prototype.render = function() {

    console.log(this.config);

    // Create the base map using our terrain settings
    this.handler = new L.Map('map', {
        "minZoom": this.config.minZoom,
        "maxZoom": this.config.maxZoom,
        "zoom": this.config.initZoom,
        "attributionControl": false,
        "measureControl": true
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
    var tileUrl = (replayData.tileSubDomains)? webPath.replace("//", "//{s}.") : webPath;

    // Add our terrain generated tiles
    this.layer = L.tileLayer(tileUrl + '/maps/' + this.terrain + '/tiles/{z}/{x}/{y}.png', {
        noWrap: true,
        errorTileUrl: webPath + '/assets/images/map/error-tile.png'
    }).addTo(this.handler);

    this.setupClickHandlers();

    new Poi(this, this.terrain);
};

Map.prototype.setupClickHandlers = function() {

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

    if(this.config.doubleSize == "1") {

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

    if(this.config.doubleSize == "1") {

        var convertedX = x / 2;
        var convertedY = Math.abs((y - this.config.height) / 2);
    } else {

        var convertedX = x;
        var convertedY = Math.abs(parseFloat(y) + parseFloat(this.config.height));
    }

    if(!grid)
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

function PlayBack() {
    this.map = {};
    this.replayData = {};
};

PlayBack.prototype.init = function(data) {

    this.replayData = JSON.parse(data);
    this.map = new Map(this.replayData.map, this.replayData.tileSubDomains);
};

function PlayBackList() {

};

PlayBackList.prototype.init = function() {

};
function Poi(map, terrainName) {

    this.terrain = terrainName;
    this.map = map;

    this.ready = false;
    this.poiLayers = {};

    this.setupClickHandlers();
    this.add();
};

Map.prototype.setupClickHandlers = function() {

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

            //console.log('All points added', err);

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

    console.log('filtering zoom layers');

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

var playBackList = new PlayBackList(),
    playBack = new PlayBack();

$('document').ready(function() {

    if($('.playback-list').length)
        playBackList.init();

    if(typeof replayData !== "undefined")
        playBack.init(replayData);
});
