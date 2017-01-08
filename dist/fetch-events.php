<?php
ini_set('max_execution_time', 300);
ini_set('memory_limit','1600M');

require_once('inc/bootstrap.php');
$replays = Replays::Instance();

if(!isset($_POST['id']))
    die(http_response_code(400));

$successful = $replays->fetchEvents($_POST['id']);

die(json_encode(array('id' => $_POST['id'], 'success' => $successful)));

