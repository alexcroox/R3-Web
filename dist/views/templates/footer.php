    <?php require_once(APP_PATH . '/views/templates/modals/help.php'); ?>

    <script type="text/javascript">
        var webPath = '<?php echo WEB_PATH; ?>';
        var configDefaults = { speed: <?php echo DEFAULT_PLAYBACK_SPEED; ?> };
    </script>

    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-83874759-1', 'auto');
      ga('send', 'pageview');

    </script>

    <script src="<?php echo WEB_PATH; ?>/assets/app-third-party.min.js"></script>
    <script src="<?php echo WEB_PATH; ?>/assets/<?php echo (DEBUG)? 'app.js' : 'app.min.js'; ?>"></script>
</body>
</html>
