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

    public function isCachedVersionAvailable($replayId) {

        // Don't bother with a filesystem lookup if the functionality is disabled
        return (CACHE_EVENTS)? file_exists(APP_PATH . '/cache/events/' . $replayId . '.json') : FALSE;
    }

    public function fetchEvents($replayId) {

        $query = $this->_db->prepare("
            SELECT
                playerId, type, value
            FROM
                events
            WHERE
                replayId = :replayId
            ORDER BY missionTime ASC");
        $query->execute(array('replayId' => $replayId));

        $eventData = $query->fetchAll();

        // Cache our events for the next person
        if(CACHE_EVENTS)
            $this->saveEventCache($replayId, $eventData);

        return $eventData;
    }

    // Cache the result to a flat file and delete the original data to keep the table size down
    // With 5R we saw a big reduction in CPU usage when switching to flat file caches.
    // If your site experiences heavy traffic consider setting up nginx as a reverse proxy to apache
    // so it can serve up these static files avoiding PHP altogether
    private function saveEventCache($replayId, $eventData) {

        $playbackCachefile = APP_PATH . '/cache/events/' . $replayId . '.json';

        $fp = fopen($playbackCacheFile, 'w');
        fwrite($fp, json_encode($playbackEvents));
        fclose($fp);

        $query = $this->_db->prepare("
            DELETE FROM events WHERE replayId = :replayId");
        $query->execute(array('replayId' => $replayId));
    }
}
