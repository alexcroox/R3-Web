<?php

require_once('../inc/bootstrap.php');
$replays = Replays::Instance();
$view = View::Instance();
$util = Util::Instance();

$title = 'R3 Admin';
$metaDescription = '';
$headerTitle = '<i class="fa fa-lock" aria-hidden="true"></i>' . UNIT_NAME . ' R3 Admin';
$page = 'admin/admin-index';

if(ADMIN_PASSWORD == "changeme" || ADMIN_PASSWORD == "")
    exit('You must first change the admin password in config.php');

if(isset($_SESSION['admin'])) {

    $allReplays = $replays->fetchAll(TRUE);

} else {

    $page = 'admin/admin-login';
}

require_once(APP_PATH . '/views/templates/header.php');
require_once(APP_PATH . '/views/' . $page . '.php');
require_once(APP_PATH . '/views/templates/footer.php');
