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
                    r.slug IS NULL OR
                    r.playerCount IS NULL OR
                    r.playerList IS NULL
                )
        ");

        $query->execute();

        $result = $query->fetchAll();

        // Work out our slug and save back mission time and slug
        // Hide missions without any events
        foreach($result as $data) {

            // If we haven't had any events in x minutes then we can safely say the mission has finished
            $missionFinished = (strtotime($data->lastEventTime) < strtotime("-" . MINUTES_MISSION_END_BLOCK * 60 . " seconds"));

            // Data won't start coming in until the mission gets past the briefing screen. Some units might take a while for this to happen
            $noData = (!$data->lastEventTime && strtotime($data->dateStarted) < strtotime("-30 minutes"));

            if($missionFinished) {

                $players = $this->fetchReplayPlayers($data->id, $data->playerList);
                $playerCount = count($players);

                $missionLength = strtotime($data->lastEventTime) - strtotime($data->dateStarted);
                $missionTooShort = ($missionLength < (MIN_MISSION_TIME * 60));
            } else {

                $playerCount = null;
                $missionTooShort = false;
            }

            $updateQuery = $this->_db->prepare("
                UPDATE
                    replays
                SET
                    slug = :slug,
                    lastEventMissionTime = :lastEventMissionTime,
                    hidden = :hidden,
                    playerCount = :playerCount
                WHERE
                    id = :replayId
                LIMIT 1
            ");

            $updateQuery->execute(array(
                'replayId' => $data->id,
                'slug' => $util->slugify($data->missionName),
                'playerCount' => $playerCount,
                'lastEventMissionTime' => (!$missionFinished)? null : $data->lastEventTime,
                'hidden' => ($noData || $missionTooShort || ($missionFinished && $playerCount < MIN_PLAYER_COUNT)) ? 1 : 0
            ));
        }
    }

    public function isCachedVersionAvailable($replayId) {

        return file_exists(APP_PATH . '/cache/events/' . $replayId . '.json');
    }

    private function isPlayerListCachedVersionAvailable($replayId) {

        return file_exists(APP_PATH . '/cache/events/' . $replayId . '-players.json');
    }

    private function savePlayerListCache($replayId, $playerList) {

        $jsonPlayerList = json_encode($playerList);

        $updateQuery = $this->_db->prepare("
            UPDATE
                replays
            SET
                playerList = :playerList
            WHERE
                id = :replayId
            LIMIT 1
        ");

        $updateQuery->execute(array(
            'replayId' => $replayId,
            'playerList' => $jsonPlayerList
        ));

        return $jsonPlayerList;
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

    public function fetchReplayPlayers($replayId, $playerList) {

        $data = array();

        if($playerList) {

            try {

                $data = json_decode($playerList);

            } catch (Exception $e) {
                // Bad json
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

    public function savePlayerId($playerId) {

        // Set cookie for 5 years
        setcookie('playerId', $playerId, time() + (3600 * 1000 * 24 * 365 * 5), '/');
    }

    public function getPlayerMissions($replayData) {

        if(!isset($_COOKIE['playerId']) || $_COOKIE['playerId'] == "")
            return FALSE;

        // Pass existing replay data so we don't make another expensive db call
        return $this->getHtmlReplaysForPlayer($_COOKIE['playerId'], $replayData);
    }

    public function getHtmlReplaysForPlayer($playerId, $replayData = FALSE) {

        if(!$replayData)
            $replayData = $this->fetchAll();

        $myReplays = array();

        foreach($replayData as $replay) {

            if($replay->playerList == "")
                continue;

            $playerList = json_decode($replay->playerList);

            foreach($playerList as $player) {

                if($player->id == $playerId)
                    $myReplays[] = $replay;
            }
        }

        ob_start();

        $tablePrefix = 'missions-mine';
        $replayList = $myReplays;
        $util = Util::Instance();

        include(APP_PATH . '/views/templates/missions-table.php');

        $html = ob_get_contents();
        ob_end_clean();

        return $html;
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
                $icons[basename(strtolower($fileName), ".png")] = '/' . $modName . '/' . $fileName;
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
