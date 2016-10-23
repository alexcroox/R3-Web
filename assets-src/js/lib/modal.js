function Modal() {

}

Modal.prototype.setupInteractionHandlers = function() {

    var self = this;

    $('body').on('click', '.modal__close', function(e) {
        e.preventDefault();

        self.hide();
    });
}

Modal.prototype.hide = function(modalId) {

    $('.modal').removeClass('modal--show');
};

Modal.prototype.show = function(modalId, loadedCallback) {

    $('#' + modalId).addClass('modal--show');
};
