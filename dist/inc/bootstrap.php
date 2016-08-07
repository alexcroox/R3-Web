<?php

session_start();

// Get our local path
$dir = dirname(__FILE__);
$path = substr($dir, 0, strrpos($dir, "/"));
define('APP_PATH', $path);

// Find our host specific config
// If you uploaded this to http://yourunit.com/aar/ you would create "yourunit.com.php" in /config/
$matchingConfigs = array_map(function($id) {
    return APP_PATH . '/config/' . $id . '.php';
}, [ gethostname(), $_SERVER['HTTP_HOST'] ]);

$matchingConfig;

foreach($matchingConfigs as $config) {
    if(realpath($config)) {
        $matchingConfig = $config;
        break;
    }
}

// Can our host specific config be found?
if($matchingConfig) {
    require_once($matchingConfig);
} else {
    throw new Exception('Could not load environment config');
}

require_once(APP_PATH . '/config/default.php');

if(!defined("DB_HOST"))
    throw new Exception('Missing connection details, check your environment config. Use config/aar.local.php as an example');

// Auto load our classes
spl_autoload_register(function ($className) {
    include 'classes/' . $className . '.php';
});
