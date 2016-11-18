<?php

require_once('inc/bootstrap.php');
$replays = Replays::Instance();

$response = array('error' => FALSE);

if(!isset($_POST['id']) || trim($_POST['id']) == "") {
    $response['error'] = 'Missing Player ID';
} else {

    $replays->savePlayerId(trim($_POST['id']));

    $response['myReplaysHtml'] = $replays->getHtmlReplaysForPlayer($_POST['id']);
}

die(json_encode($response));

