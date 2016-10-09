<?php

require_once('inc/bootstrap.php');
$shares = Shares::Instance();

if(!isset($_POST['url']))
    die(http_response_code(400));

die(json_encode($shares->fetchShortUrl($_POST['url'])));

