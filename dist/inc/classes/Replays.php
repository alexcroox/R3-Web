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
                r.*
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
                *,
                TIMESTAMPDIFF(MINUTE, lastEventMissionTime, NOW()) as minutesSinceLastEvent
            FROM
                replays
            WHERE
                hidden = 0 AND
                id = :replayId
            LIMIT 1
        ");

        $query->execute(array('replayId' => $replayId));

        return $query->fetch();
    }

    public function updateMeta() {

        $util = Util::Instance();

        // Get all our replays that need meta saving/updating
        $query = $this->_db->prepare("
            SELECT
                r.*,
                (SELECT added FROM events WHERE replayId = r.id ORDER BY added DESC LIMIT 1) as lastEventTime
            FROM
                replays r
            WHERE
                hidden = 0 AND
                (
                    r.lastEventMissionTime IS NULL OR
                    r.slug IS NULL
                )
        ");

        $query->execute();

        $result = $query->fetchAll();

        // Work out our slug and save back mission time and slug
        // Hide missions without any events
        foreach($result as $data) {

            $updateQuery = $this->_db->prepare("
                UPDATE
                    replays
                SET
                    slug = :slug,
                    lastEventMissionTime = :lastEventMissionTime,
                    hidden = :hidden
                WHERE
                    id = :replayId
                LIMIT 1
            ");

            $updateQuery->execute(array(
                'replayId' => $data->id,
                'slug' => $util->slugify($data->missionName),
                'lastEventMissionTime' => (strtotime($data->lastEventTime) > strtotime("-4 minutes"))? null : $data->lastEventTime,
                'hidden' => (!$data->lastEventTime && (strtotime($data->dateStarted) < strtotime("-3 minutes")))? 1 : 0
            ));
        }
    }

    public function isCachedVersionAvailable($replayId) {

        return file_exists(APP_PATH . '/cache/events/' . $replayId . '.json');
    }

    private function isPlayerListCachedVersionAvailable($replayId) {

        return file_exists(APP_PATH . '/cache/events/' . $replayId . '-players.json');
    }

    private function savePlayerListCache($replayId, $data) {

        $fp = fopen(APP_PATH . '/cache/events/' . $replayId . '-players.json', 'w');

        fwrite($fp, json_encode($data));
        fclose($fp);
    }

    public function fetchEvents($replayId) {

        //$query = $this->_db->prepare("SELECT count(*) totalEvents FROM events WHERE replayId = :replayId");
        //$query->execute(array('replayId' => $replayId));

        //$result = $query->fetchOne();

        //if($result->totalEvents > 15000)

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

        $chunkedData = array();
        $flushCount = 0;

        // Cache our events for the next person
        $this->saveEventCache($replayId, '[', -1, TRUE);

        // Lets loop through our data and save in chunks to the flat file to avoid
        // out of memory issues on json_encode
        foreach($data as $row) {

            $chunkedData[] = $row;

            if(count($chunkedData) > 5000) {
                $this->saveEventCache($replayId, $chunkedData, $flushCount, FALSE);
                $chunkedData = array();
                $flushCount++;
            }
        }

        // Any more data left?
        if(count($chunkedData))
            $this->saveEventCache($replayId, $chunkedData, $flushCount, FALSE);

        $this->saveEventCache($replayId, ']', -1, TRUE);

        return TRUE;
    }

    public function fetchReplayPlayers($replayId) {

        $data = array();

        if($this->isPlayerListCachedVersionAvailable($replayId)) {

            $json = file_get_contents(APP_PATH . '/cache/events/' . $replayId . '-players.json');

            if($json) {
                $data = json_decode($json);
            }

        } else {

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

            $data = $query->fetchAll();

            $this->savePlayerListCache($replayId, $data);
        }

        return $data;
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
    private function saveEventCache($replayId, $eventData, $flushCount = 0, $skipEncode = FALSE) {

        $playbackCacheFile = APP_PATH . '/cache/events/' . $replayId . '.json';

        if(!$skipEncode) {

            $json = json_encode($eventData);
            $data = trim($json, '[');
            $data = trim($data, ']');

            if($flushCount > 0)
                $data = ',' . $data;

        } else {
            $data = $eventData;
        }

        $fp = fopen($playbackCacheFile, 'a');
        fwrite($fp, $data);
        fclose($fp);

        /*
        $query = $this->_db->prepare("
            DELETE FROM events WHERE replayId = :replayId");
        $query->execute(array('replayId' => $replayId));
        */
    }
}
