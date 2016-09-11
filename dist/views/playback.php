<div class="playback-container">
    <div class="playback-container__map" id="map"></div>

    <div class="timeline timeline--loading">
        <a href="#" class="timeline__toggle-playback">
            <i class="fa fa-pause"></i>
        </a>

        <a href="#" data-speed="10" class="timeline__speed">10x</a>
        <a href="#" data-speed="30" class="timeline__speed x30">30x</a>
        <a href="#" data-speed="60" class="timeline__speed x60">60x</a>

        <div id="timeline__silder" class="timeline__slider"></div>

        <a href="#" class="timeline__share" title="Share the current time and speed">
            <i class="fa fa-share-alt"></i>
        </a>

        <a href="#" class="timeline__fullscreen" title="Go Fullscreen">
            <i class="fa fa-arrows-alt"></i>
        </a>
    </div>
</div><!--/playback-container-->

<script>
    var replayDetails = '<?php echo json_encode($replayDetails); ?>';
    var sharedPresets = '<?php echo strip_tags(json_encode($sharedPresets)); ?>';
    var cacheAvailable = <?php echo json_encode($cacheAvailable); ?>;
    var mappingConfig = <?php echo $mappingConfig; ?>;
</script>
