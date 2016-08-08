<div class="playback-container">
    <div class="playback-container__map" id="map">

    </div>
</div><!--/playback-container-->

<script>
    var replayData = '<?php echo json_encode($viewData['replayData']); ?>';
    var sharedPresets = '<?php echo strip_tags(json_encode($viewData['urlVars'])); ?>';
</script>
