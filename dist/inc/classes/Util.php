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
