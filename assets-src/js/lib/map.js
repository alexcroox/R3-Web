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
