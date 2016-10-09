<?php

require_once('inc/bootstrap.php');
$shares = Shares::Instance();
$util = Util::Instance();

if(!isset($_GET['shareId']))
    $util->redirect301(WEB_PATH);

$redirect = $shares->getRedirect($_GET['shareId']);

$finalDestination = ($redirect)? $redirect : WEB_PATH;

$util->redirect301($finalDestination);
