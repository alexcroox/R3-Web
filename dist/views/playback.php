<div class="playback-container">
    <div class="playback-container__map" id="map"></div>

    <div class="player-list">
        <a href="<?php echo WEB_PATH; ?>" class="playback-container__back">
            <i class="fa fa-arrow-left"></i>
            Mission list
        </a>

        <a href="#" class="player-list__toggle-sticky" title="Toggle player list auto hide">
            <i class="fa fa-thumb-tack" aria-hidden="true"></i>
        </a>

        <div class="player-list__content"></div>
    </div>

    <a href="#" class="hide-markers">
        <i class="fa fa-map-signs" aria-hidden="true"></i>
        <span>Hide editor markers</span>
    </a>

    <a href="#" class="hide-markers__ignore"><i class="fa fa-times" aria-hidden="true"></i></a>

    <div class="timeline timeline--loading">

        <a href="#" class="timeline__toggle-playback">
            <i class="fa fa-pause"></i>
        </a>

        <a href="#" data-speed="5" class="timeline__speed">5x</a>
        <a href="#" data-speed="10" class="timeline__speed x10">10x</a>
        <a href="#" data-speed="30" class="timeline__speed x30">30x</a>

        <div id="timeline__silder" class="timeline__slider">
            <div class="progress">
                <div class="indeterminate"></div>
            </div>
        </div>

        <a href="#" class="timeline__share" title="Share the current time and speed">
            <i class="fa fa-share-alt"></i>
        </a>

        <a href="#" class="timeline__fullscreen" title="Go Fullscreen">
            <i class="fa fa-arrows-alt"></i>
        </a>
    </div><!--/timeline-->
</div><!--/playback-container-->

<?php require_once(APP_PATH . '/views/templates/modals/share.php'); ?>

<script>
    var objectiveMarkersConfig = <?php echo $objectiveMarkersConfig ?>;
    var icons = <?php echo $icons ?>;
    var replayDetails = <?php echo json_encode($replayDetails); ?>;
    var sharedPresets = <?php echo strip_tags(json_encode($sharedPresets)); ?>;
    var playerList = <?php echo strip_tags(json_encode($playerList)); ?>;
    var cacheAvailable = <?php echo json_encode($cacheAvailable); ?>;
    var mappingConfig = <?php echo $mappingConfig; ?>;
</script>
