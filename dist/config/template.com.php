<?php

define('UNIT_NAME', 'Unit Name');

// Database details
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'user');
define('DB_PASSWORD', 'password');
define('DB_NAME', 'aar');

// Domain settings

// http://yourunit.com/aar
// Note the lack of trailing slash
define('WEB_PATH', 'http://r3.local');

define('FAVICON', 'http://ark-group.org/images/favicon.ico');

/*
    Add a password that users must enter to view the
    mission list and playbacks

    Leave blank to make all replays open to the public
 */
define('ACCESS_PASSWORD', '');

// Admin password
define('ADMIN_PASSWORD', 'changeme');

/*
    To increase the speed in which your terrain tiles load
    on the end user's browser it's highly recommended you create
    3 x subdomains pointing to your main website.
    a.yourunitname.com b.yourunitname.com c.yourunitname.com
    If you have set this up change the below to TRUE

    If you have HTTP/2 enabled this isn't nessasary
 */
define('TILE_SUBDOMAINS', FALSE);

// Default event playback speed (5x 10x 30x)
define('DEFAULT_PLAYBACK_SPEED', 10);

/*
    Define the minimum mission time for an event
    to appear in the missions list. This prevents
    test missions from cluttering the list
 */
define('MIN_MISSION_TIME', 15);

/*
    Minutes after last event received before playback can be viewed.
    This is designed to stop players watching playback mid game to see
    the enemy unit positions
 */
define('MINUTES_MISSION_END_BLOCK', 2);

// Locale settings
date_default_timezone_set('Europe/London');
define('US_DATE_FORMAT', FALSE);


// Set this to FALSE if you are deploying
// to production server
define('DEBUG', TRUE);
