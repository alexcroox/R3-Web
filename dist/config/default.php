<?php

define('UNIT_NAME', 'Unit Name');

/*
    Add a password that users must enter to view the
    mission list and playbacks

    Leave blank to make all replays open to the public
 */
define('ACCESS_PASSWORD', '');

// Admin password
define('ADMIN_PASSWORD', 'changeme');

// Default event playback speed (10x 30x 60x)
define('DEFAULT_PLAYBACK_SPEED', 30);

/*
    Define the minimum mission time for an event
    to appear in the missions list. This prevents
    test missions from cluttering the list
 */
define('MIN_MISSION_TIME', 10);

/*
    Minutes after last event received before playback can be viewed.
    This is designed to stop players watching playback mid game to see
    the enemy unit positions
 */
define('MINUTES_MISSION_END_BLOCK', 0);

// Locale settings
date_default_timezone_set('Europe/London');
define('US_DATE_FORMAT', FALSE);
