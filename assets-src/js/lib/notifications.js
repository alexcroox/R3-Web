function Notifications() {

    this.enabled = true;
    this.minWidth = 800;
};

Notifications.prototype.setup = function() {


    this.setupInteractionHandlers();
};

Notifications.prototype.setupInteractionHandlers = function() {

    var self = this;

    $(window).resize(this.checkWindowWidth);
};

Notifications.prototype.checkWindowWidth = function() {

    this.enabled = ($(window).width() >= this.minWidth)? true : false;
};

Notifications.prototype.info = function(message) {

    console.log(message);
};

Notifications.prototype.warning = function(message) {

    console.log(message);
};
