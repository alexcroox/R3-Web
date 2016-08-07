<?php

define('UNIT_NAME', 'Example Unit Name');

/*
    Define the minimum mission time for an event
    to appear in the missions list. This prevents
    test missions from cluttering the list
*/
define('MIN_MISSION_TIME', 100);

/*
    Minutes after last event received before playback can be viewed.
    This is designed to stop players watching playback mid game to see
    the enemy unit positions
*/
define('MINUTES_MISSION_END_BLOCK', 1);
