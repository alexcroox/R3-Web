<?php
ini_set('max_execution_time', 900);

// Delete events from missions that have been "hidden". Missions are hidden because
// not enough players are present or they finish too soon (usually applies to mission testing)
if (!isset($_SERVER['cron']))
   die('No browser access.');

require_once('../inc/bootstrap.php');
$replays = Replays::Instance();
$db = Database::Instance()->conn;

// Sometimes missions can be incorrectly hidden. Let's not delete anything too recent.
$daysOlderThan = MIN_DAYS_DELETE_HIDDEN_MISSION_EVENTS;
$deletedReplays = [];

$hiddenMissionIds = $replays->fetchHidden($daysOlderThan);

foreach ($hiddenMissionIds as $mission) {
    if ($mission->id) {
        $query = $db->prepare("DELETE FROM events WHERE replayId = :id");

        $query->execute(array('id' => $mission->id));

        $deletedReplays[] = $mission->id;
    }
}

echo '<pre>';
print_r($deletedReplays);
