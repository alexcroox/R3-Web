<?php

session_start();

// Get our local path
$dir = dirname(__FILE__);
$path = substr($dir, 0, strrpos($dir, "/"));
define('APP_PATH', $path);

// Try loading the config
if(!file_exists(APP_PATH . '/config.php'))
    die('Failed to load config.php, have you edited and renamed /config.template.php to /config.php?');

require_once(APP_PATH . '/config.php');

// Auto load our classes
spl_autoload_register(function ($className) {
    include 'classes/' . $className . '.php';
});

define('APP_VERSION', '0.10.1');
