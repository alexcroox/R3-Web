<?php

require_once('inc/bootstrap.php');
$replays = Replays::Instance();
$view = View::Instance();
$util = Util::Instance();

$title = 'Mission replay list';
$metaDescription = 'View after action replays of ' . UNIT_NAME . ' missions';
$page = 'missions-list';

$replays->updateMeta();
$allReplays = $replays->fetchAll();
$myReplaysHtml = $replays->getPlayerMissions($allReplays);

require_once(APP_PATH . '/views/templates/header.php');
require_once(APP_PATH . '/views/' . $page . '.php');
require_once(APP_PATH . '/views/templates/footer.php');
