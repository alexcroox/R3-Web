<?php

require_once('inc/bootstrap.php');
$replays = Replays::Instance();
$view = View::Instance();

$title = 'Mission replay list';

$replayList = $replays->fetchAll();

$view->render('missions-list', array(
    'title' => $title,
    'replayList' => $replayList
));
