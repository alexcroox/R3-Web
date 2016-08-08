<div class="playback-container">
    <div class="playback-container__map" id="map">

    </div>
</div><!--/playback-container-->

<script>
    var replayDetails = '<?php echo json_encode($viewData['replayDetails']); ?>';
    var sharedPresets = '<?php echo strip_tags(json_encode($viewData['sharedPresets'])); ?>';
    var cacheAvailable = <?php echo json_encode($viewData['cacheAvailable']); ?>;
</script>
