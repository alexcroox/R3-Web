<?php

require_once('inc/bootstrap.php');
$replays = Replays::Instance();
$view = View::Instance();
$util = Util::Instance();

if(!isset($_GET['replayId']))
    $util->redirect301(WEB_PATH);

// Get info about our mission
$replayDetails = $replays->fetchOne($_GET['replayId']);

if(!$replayDetails)
    $util->redirect301(WEB_PATH . '?not-found');

// We do want people seeing where units are in a mission while it's still in play
if($replayDetails->minutesSinceLastEvent < MINUTES_MISSION_END_BLOCK)
    $util->redirect301(WEB_PATH . '?not-finished');

$title = $replayDetails->missionName;

$replayDetails->{'tileSubDomains'} = TILE_SUBDOMAINS;

// Do we have a cached version of this playback?
$cacheAvailable = $replays->isCachedVersionAvailable($replayDetails->id);

$view->render('playback', array(
    'title' => $title,
    'replayDetails' => $replayDetails,
    'sharedPresets' => $_GET,
    'cacheAvailable' => $cacheAvailable
));
