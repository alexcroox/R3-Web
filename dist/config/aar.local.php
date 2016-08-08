<?php

// Set this to FALSE if you are deploying
// to production server
define('DEBUG', TRUE);

// Database details

define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASSWORD', 'root');
define('DB_NAME', 'aar');

// Domain settings

// http://yourunit.com/aar
// Note the lack of trailing slash
define('WEB_PATH', 'http://aar.local');

/*
    To increase the speed in which your terrain tiles load
    on the end user's browser it's highly recommended you create
    3 x subdomains pointing to your main website.
    a.yourunitname.com b.yourunitname.com c.yourunitname.com
    If you have set this up change the below to TRUE
 */
define('TILE_SUBDOMAINS', FALSE);
