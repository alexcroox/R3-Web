    <script type="text/javascript">
        var webPath = '<?php echo WEB_PATH; ?>';
        var configDefaults = { speed: <?php echo DEFAULT_PLAYBACK_SPEED; ?> };
    </script>
    <script src="<?php echo WEB_PATH; ?>/assets/app-third-party.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/js/materialize.min.js"></script>
    <script src="<?php echo WEB_PATH; ?>/assets/<?php echo (DEBUG)? 'app.js' : 'app.min.js'; ?>"></script>
</body>
</html>
