<?php

require_once('inc/bootstrap.php');
$replays = Replays::Instance();

die(json_encode($replays->compileVehicleIcons()));

