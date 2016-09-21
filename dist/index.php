<?php

require_once('inc/bootstrap.php');
$replays = Replays::Instance();
$view = View::Instance();
$util = Util::Instance();

$title = 'Mission replay list';
$page = 'missions-list';

$replays->updateMeta();
$replayList = $replays->fetchAll();

require_once(APP_PATH . '/views/templates/header.php');
require_once(APP_PATH . '/views/' . $page . '.php');
require_once(APP_PATH . '/views/templates/footer.php');
