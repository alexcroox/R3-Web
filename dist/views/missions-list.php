<div class="mission-list__tabs">
    <a href="#" class="mission-list__tab mission-list__tab--active" data-list="missions-all">All missions</a>
    <a href="#" class="mission-list__tab" data-list="missions-mine">My missions</a>
</div>

<div class="container">

    <?php if(isset($_GET['not-found'])): ?>
        <div class="feedback feedback--error margin__top--medium">
            <i class="fa fa-exclamation fa-pad-right" aria-hidden="true"></i>
            That mission cannot be found
        </div>
    <?php endif; ?>

    <?php if(isset($_GET['not-finished'])): ?>
        <div class="feedback feedback--error margin__top--medium">
            <i class="fa fa-exclamation fa-pad-right" aria-hidden="true"></i>
            You cannot view missions that are in progress!
        </div>
    <?php endif; ?>

    <?php if(isset($_GET['missing-terrain'])): ?>
        <div class="feedback feedback--error margin__top--medium">
            <i class="fa fa-exclamation fa-pad-right" aria-hidden="true"></i>
            The <?php echo $_GET['terrain']; ?> terrain is missing!
            <a href="https://github.com/alexcroox/R3-Web/wiki/Adding-new-terrains" target="_blank" class="text-link text-link--with-underline">Why don't you add it?</a>
        </div>
    <?php endif; ?>

    <?php if(isset($_GET['events-error'])): ?>
        <div class="feedback feedback--error margin__top--medium">
            <i class="fa fa-exclamation fa-pad-right" aria-hidden="true"></i>
            Error generating event cache, error code <?php echo $_GET['code']; ?>, check your server error logs for more info
        </div>
    <?php endif; ?>

    <div class="mission-list mission-list--active" id="missions-all">
        <?php

        $tablePrefix = 'missions-all';
        $replayList = $allReplays;

        include(APP_PATH . '/views/templates/missions-table.php'); ?>
    </div><!--mission-list-->

    <div class="mission-list" id="missions-mine">
        <?php

        if($myReplaysHtml !== FALSE) {

            echo $myReplaysHtml;
        } else { ?>

            <div class="form__surround">
                <i class="fa fa-user-circle-o new-user__icon" aria-hidden="true"></i>
                <h3>
                    Enter your
                    <a href="<?php echo WEB_PATH . '/assets/images/player-id.gif' ?>" class="text-link text-link--with-underline" target="_blank">
                        Arma Player ID
                    </a>
                    to filter your missions</h3>
                <p class="new-user__intro">
                    Events that effect you in the playback will also be highlighted.
                </p>

                <input type="text" placeholder="Arma Player ID" class="new-user__input input--large input--grey-bg" name="my-player-id">

                <a href="#" class="button new-user__save">Save</a>
            </div>
        <?php } ?>
    </div>
</div><!--/container-->
