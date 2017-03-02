<?php

use Carbon\Carbon;

if (!function_exists('humanTimeDifference')) {

    /**
     * Returns a human relative time difference from now
     *
     * @param \Carbon $sourceTime
     * @return string
     */
    function humanTimeDifference($time1, $time2, $precision = 2)
    {
        // If not numeric then convert timestamps
        if(!is_int($time1)) {
            $time1 = strtotime($time1);
        }

        if(!is_int($time2)) {
            $time2 = strtotime($time2);
        }

        // If time1 > time2 then swap the 2 values
        if($time1 > $time2) {
            list($time1, $time2) = array($time2, $time1);
        }

        // Set up intervals and diffs arrays
        $intervals = array('year', 'month', 'day', 'hour', 'minute');
        $diffs = array();

        foreach($intervals as $interval) {
            // Create temp time from time1 and interval
            $ttime = strtotime('+1 ' . $interval, $time1);
            // Set initial values
            $add = 1;
            $looped = 0;
            // Loop until temp time is smaller than time2
            while ($time2 >= $ttime) {
                // Create new temp time from time1 and interval
                $add++;
                $ttime = strtotime("+" . $add . " " . $interval, $time1);
                $looped++;
            }
            $time1 = strtotime("+" . $looped . " " . $interval, $time1);
            $diffs[ $interval ] = $looped;
        }

        $count = 0;
        $times = array();

        foreach($diffs as $interval => $value) {

            // Break if we have needed precission
            if($count >= $precision) {
                break;
            }

            // Add value and interval if value is bigger than 0
            if($value > 0) {
                if($value != 1){
                    $interval .= "s";
                }

                // Add value and interval to times array
                $times[] = $value . " " . $interval;
                $count++;
            }
        }

        // Return string with times
        return implode(", ", $times);
    }
}
