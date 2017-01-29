<?php
/**
 * Model for handling mission stats
 *
 * @author Titan
 **/

class Stats {

    private $_db;
    private $_replays;

    public static function Instance() {

        static $inst = null;

        if ($inst === null) {
            $inst = new Stats();
        }
        return $inst;
    }

    function __construct() {

        $this->_db = Database::Instance()->conn;
        $this->_replays = Replays::Instance();
    }

    public function getTerrainStats() {

        $query = $this->_db->prepare("
            SELECT
                r.map,
                COUNT(r.map) as playCount,
                (
                    SELECT d.dateStarted FROM replays d WHERE d.map = r.map ORDER BY d.dateStarted DESC LIMIT 1
                ) as lastPlayed
            FROM
                replays r
            WHERE
                hidden = 0
            GROUP BY
                r.map
            ORDER BY
                playCount DESC
        ");

        $query->execute();

        return $query->fetchAll();
    }
}
