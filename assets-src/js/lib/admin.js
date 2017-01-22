function Admin() {


};

Admin.prototype.setupInteractionHandlers = function() {

    $('body').on('click', '.js-admin-login', function(e) {
        e.preventDefault();

        var password = $('input[name="admin-password"]').val();

        $.ajax({
            url: webPath + '/admin/login',
            type: 'POST',
            dataType: 'json',
            data: { "password": password },
            success: function(response) {

                if(response.error)
                    return admin.loginError();

                window.location = webPath + '/admin/'
            },
            error: function(xhr, errorType, message) {

                console.error('Error logging in - Status: ' + errorType + ' - Message: ' + message);
                admin.loginError();
            }
        });
    });
};

Admin.prototype.loginError = function() {

    $('.feedback').remove();
    $('input[name="admin-password"]').after('<div class="feedback feedback--error">Wrong password</div>');
};
