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

    var self = this;

    this.scrubber.noUiSlider.on('slide', function(value) {

        console.log('Sliding', Math.round(value[0]));

        self.skipTime(value[0]);
    });

    $('body').on('click', '.timeline__toggle-playback', function(e) {
        e.preventDefault();

        if (!self.playing) {

            $('.timeline__toggle-playback .fa').removeClass('fa-play').addClass('fa-pause');
            self.startTimer();

        } else {

            $('.timeline__toggle-playback .fa').removeClass('fa-pause').addClass('fa-play');
            self.stopTimer();
        }
    });

    $('body').on('click', '.timeline__speed', function(e) {

        e.preventDefault();

        self.changeSpeed($(this).data('speed'));
    });

    $('body').on('click', '.timeline__share', function(e) {
        e.preventDefault();

        self.stopTimer();

        var shareUrl = ...

        var center = self.playBack.map.handler.getCenter();
        shareUrl += '&centerLat=' + center.lat;
        shareUrl += '&centerLng=' + center.lng;

        shareUrl += '&zoom=' + self.playBack.map.handler.getZoom();
        shareUrl += '&time=' + self.timePointer;
        shareUrl += '&speed=' + self.speed;

        if (self.playBack.trackTarget)
            shareUrl += '&track=' + self.playBack.trackTarget

        $('.timeline__share__details input').val(shareUrl);

        // Show modal here
    });

    $('body').on('click', '.timeline__fullscreen', function(e) {

        e.preventDefault();

        if (screenfull.enabled) {
            screenfull.toggle();
        }
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
