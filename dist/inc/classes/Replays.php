<?php
/**
 * Model for handling mission replays
 *
 * @author Titan
 **/

class Replays {

    private $_db;

    public static function Instance() {

        static $inst = null;

        if ($inst === null) {
            $inst = new Replays();
        }
        return $inst;
    }

    function __construct() {

        $this->_db = Database::Instance()->conn;
    }

    public function fetchAll($minMissionTime = MIN_MISSION_TIME) {

        $query = $this->_db->prepare("
            SELECT
                r.*,
                (SELECT added FROM events WHERE replayId = r.id ORDER BY added DESC LIMIT 1) as lastEventTime
            FROM
                replays r
            WHERE
                hidden = 0 AND
                (SELECT missionTime FROM events WHERE replayId = r.id ORDER BY missionTime DESC LIMIT 1) > :minTime
            ORDER BY
                dateStarted DESC
        ");

        $query->execute(array('minTime' => $minMissionTime));

        return $query->fetchAll();
    }

    public function fetchOne($replayId) {

        $query = $this->_db->prepare("
            SELECT
                r.id,
                r.missionName,
                r.map,
                r.dateStarted,
                (SELECT TIMESTAMPDIFF(MINUTE, added, NOW()) FROM events WHERE replayId = r.id ORDER BY added DESC LIMIT 1) as minutesSinceLastEvent
            FROM
                replays r
            WHERE
                hidden = 0 AND
                id = :replayId
            LIMIT 1
        ");

        $query->execute(array('replayId' => $replayId));

        return $query->fetch();
    }
}
