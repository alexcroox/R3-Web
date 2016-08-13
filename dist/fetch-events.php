<?php

require_once('inc/bootstrap.php');
$replays = Replays::Instance();

if(!isset($_POST['id']))
    die(http_response_code(400));

die(json_encode($replays->fetchEvents($_POST['id'])));

