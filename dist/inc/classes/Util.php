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

    public function humanTimeDifference($to, $from) {

        $time = $to - $from; // to get the time since that moment
        $time = ($time < 1)? 1 : $time;

        $tokens = array (
            31536000 => 'year',
            2592000 => 'month',
            604800 => 'week',
            86400 => 'day',
            3600 => 'hour',
            60 => 'minute',
            1 => 'second'
        );

        foreach ($tokens as $unit => $text) {

            if ($time < $unit) continue;
            $numberOfUnits = floor($time / $unit);
            return $numberOfUnits . ' ' . $text . (($numberOfUnits>1)? 's' : '');
        }
    }
}
