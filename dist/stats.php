<?php

require_once('inc/bootstrap.php');
$replays = Replays::Instance();
$stats = Stats::Instance();
$view = View::Instance();
$util = Util::Instance();

$title = 'Mission stats';
$metaDescription = 'View stats for missions played by ' . UNIT_NAME;
$headerTitle = UNIT_NAME . ' Stats';
$page = 'stats';

$terrainStats = $stats->getTerrainStats();

require_once(APP_PATH . '/views/templates/header.php');
require_once(APP_PATH . '/views/' . $page . '.php');
require_once(APP_PATH . '/views/templates/footer.php');
