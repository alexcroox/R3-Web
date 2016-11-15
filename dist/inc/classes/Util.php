<?php
/**
 * Model for utility functions
 *
 * @author Titan
 **/

class Util {

    public static function Instance() {

        static $inst = null;

        if ($inst === null)
            $inst = new Util();

        return $inst;
    }

    public function redirect301($url) {

        header("Location: " . $url, TRUE, 301);
        exit();
    }

    function humanTimeDifference($time1, $time2, $precision = 2) {

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

    function humanRelativeTimeDifference($time) {

        $dateFormat = (US_DATE_FORMAT)? 'm/d/Y' : 'jS F Y';

        if ($time >= strtotime("today 00:00"))
            return date("g:i A", $time);
        elseif ($time >= strtotime("yesterday 00:00"))
            return "Yesterday at " . date("g:i A", $time);
        elseif ($time >= strtotime("-6 day 00:00"))
            return date("l \\a\\t g:i A", $time);
        else
            return date($dateFormat, $time);
    }

    function slugify($string, $replace = array(), $delimiter = '-') {
        // https://github.com/phalcon/incubator/blob/master/Library/Phalcon/Utils/Slug.php
        if (!extension_loaded('iconv')) {
            throw new Exception('iconv module not loaded');
        }

        // Save the old locale and set the new locale to UTF-8
        $oldLocale = setlocale(LC_ALL, '0');
        setlocale(LC_ALL, 'en_US.UTF-8');
        $clean = iconv('UTF-8', 'ASCII//TRANSLIT', $string);

        if (!empty($replace))
            $clean = str_replace((array) $replace, ' ', $clean);

        $clean = preg_replace("/[^a-zA-Z0-9\/_|+ -]/", '', $clean);
        $clean = strtolower($clean);
        $clean = preg_replace("/[\/_|+ -]+/", $delimiter, $clean);
        $clean = trim($clean, $delimiter);

        // Revert back to the old locale
        setlocale(LC_ALL, $oldLocale);
        return $clean;
    }
}
