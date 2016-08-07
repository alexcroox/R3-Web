<?php
/**
 * Model for utility functions
 *
 * @author Titan
 **/

class Util {

    public static function Instance() {

        static $inst = null;

        if ($inst === null) {
            $inst = new Util();
        }
        return $inst;
    }

    public function redirect301($url) {

        header("Location: " . $url, TRUE, 301);
        exit();
    }
}
