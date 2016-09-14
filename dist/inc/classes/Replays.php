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
                hidden = 0
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

    public function isCachedVersionAvailable($replayId) {

        // Don't bother with a filesystem lookup if the functionality is disabled
        return (CACHE_EVENTS)? file_exists(APP_PATH . '/cache/events/' . $replayId . '.json') : FALSE;
    }

    public function fetchEvents($replayId) {

        $query = $this->_db->prepare("
            SELECT
                playerId, type, value, missionTime
            FROM
                events
            WHERE
                replayId = :replayId
            ORDER BY missionTime ASC");

        $query->execute(array('replayId' => $replayId));

        $data = $query->fetchAll();

        // Cache our events for the next person
        if(CACHE_EVENTS)
            $this->saveEventCache($replayId, $data);

        return $data;
    }

    public function fetchReplayPlayers($replayId) {

        $query = $this->_db->prepare("
            SELECT
                DISTINCT p.id, p.name
            FROM
                players p
            LEFT JOIN
                events e
            ON
                e.value LIKE CONCAT('%', p.id, '%')
            WHERE
                e.replayId = :replayId");

        $query->execute(array('replayId' => $replayId));

        return $query->fetchAll();
    }

    // Hardcode available mod icon packs for testing...
    public function compileVehicleIcons() {

        return array_merge($this->scanModDirectory('rhs'), $this->scanModDirectory('cup'));
    }

    private function scanModDirectory($modName) {

        $icons = array();

        $dh  = opendir(APP_PATH . '/assets/images/map/markers/vehicles/mod-specific/' . $modName);

        while (false !== ($fileName = readdir($dh))) {

            $fileName = str_replace("-east", "", $fileName);
            $fileName = str_replace("-west", "", $fileName);
            $fileName = str_replace("-independant", "", $fileName);
            $fileName = str_replace("-civilian", "", $fileName);

            if($fileName != "." && $fileName != "..")
                $icons[basename($fileName, ".png")] = '/' . $modName . '/' . $fileName;
        }

        return $icons;
    }

    // Cache the result to a flat file and delete the original data to keep the table size down
    // With 5R we saw a big reduction in CPU usage when switching to flat file caches.
    // If your site experiences heavy traffic consider setting up nginx as a reverse proxy to apache
    // so it can serve up these static files avoiding PHP altogether
    private function saveEventCache($replayId, $eventData) {

        $playbackCacheFile = APP_PATH . '/cache/events/' . $replayId . '.json';

        $fp = fopen($playbackCacheFile, 'w');
        fwrite($fp, json_encode($eventData));
        fclose($fp);

        /*
        $query = $this->_db->prepare("
            DELETE FROM events WHERE replayId = :replayId");
        $query->execute(array('replayId' => $replayId));
        */
    }
}
