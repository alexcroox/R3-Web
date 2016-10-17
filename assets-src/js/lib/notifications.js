function Notifications() {

    this.enabled = true;
    this.minWidth = 800;
};

Notifications.prototype.init = function() {

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "target": '.playback-container'
    };

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

    if(!this.enabled)
        return;

    toastr.info(message);
};

Notifications.prototype.warning = function(message) {

    if(!this.enabled)
        return;

    toastr.warning(message);
};

Notifications.prototype.error = function(message) {

    if(!this.enabled)
        return;

    toastr.error(message);
};
