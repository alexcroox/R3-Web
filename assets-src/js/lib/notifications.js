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
    this.showMessage(message, 'info');
};

Notifications.prototype.warning = function(message) {

    console.log(message);

    this.showMessage(message, 'warning');
};

Notifications.prototype.showMessage = function(message, type) {

    Materialize.toast('<span class="notification notification--' + type + '">' + message + '</span>', 4000);
};
