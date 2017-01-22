function ObjectiveMarkers() {

    this.supportedList = (typeof objectiveMarkersConfig !== "undefined") ? objectiveMarkersConfig : {};
    this.ready = false;
    this.layer = null;
    this.validMarkerCount = 0;
};

ObjectiveMarkers.prototype.init = function(terrainName) {

    this.setupInteractionHandlers();
}

ObjectiveMarkers.prototype.setupInteractionHandlers = function() {

    var self = this;

    $('body').on('click', '.hide-markers__ignore', function(e) {
        e.preventDefault();

        $('.hide-markers').fadeOut();
        $('.hide-markers__ignore').fadeOut();
    });

    $('body').on('click', '.hide-markers', function(e) {
        e.preventDefault();

        if($(this).hasClass('hide-markers--active')) {

            $(this).removeClass('hide-markers--active').find('span').html('Hide editor markers');
            self.layer.addTo(map.handler);

        } else {

            $(this).addClass('hide-markers--active').find('span').html('Show editor markers');
            map.handler.removeLayer(self.layer);
        }
    });
};

ObjectiveMarkers.prototype.add = function(markerData) {

    var self = this;
    var newLayer = false;

    if(!this.layer) {
        this.layer = new L.featureGroup([]);
        this.layer.addTo(map.handler);
    }

    async.forEachOf(markerData, function(singleMarker, key, callback) {

        var markerType = singleMarker.type.toLowerCase();

        if (self.supportedList.indexOf(markerType) === -1) {
            console.warn('Unsupported marker', singleMarker);
            return callback();
        }

        if(self.validMarkerCount == 0)
            newLayer = true;

        var offset = [0, 0];
        var iconSize = [30, 30];
        var iconAnchor = [15, 15];

        var poiIcon = L.icon({
            iconUrl: 'https://r3icons.titanmods.xyz/' + markerType + '.png',
            iconSize: iconSize,
            iconAnchor: iconAnchor,
            className: 'obj-marker-image obj-marker-image--' + markerType
        });

        var pos = map.gamePointToMapPoint(singleMarker.pos[0], singleMarker.pos[1]);

        var objMarker = L.marker(map.rc.unproject([pos[0], pos[1]]), {
            icon: poiIcon,
            clickable: false
        }).bindLabel(singleMarker.text, {
            noHide: true,
            className: 'obj-marker obj-marker-' + markerType,
            offset: offset
        });

        self.layer.addLayer(objMarker);

        callback();
    }, function(err) {

        if(newLayer)
            $('.hide-markers, .hide-markers__ignore').show();

    });
};
