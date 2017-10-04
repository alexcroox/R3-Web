<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include('config.php');

foreach (glob("event-types/*.php") as $filename) {
    include $filename;
}

$entityId = 0;
$missionId = 0;

echo '<pre>';

function createConnection($dbDetails) {

    $connection = new PDO(
        "mysql:host={$dbDetails['host']};dbname={$dbDetails['db']}",
        $dbDetails['user'],
        $dbDetails['password'],
        array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"));
    $connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    return $connection;
}

$oldConnection = createConnection($config['old']);
$newConnection = createConnection($config['new']);

// First get our list of missions
$missions = $oldConnection->query("SELECT * FROM replays WHERE hidden = 0 ORDER BY id DESC LIMIT 1");

// Get our list of player Ids
$players = array();
$rawPlayers = $oldConnection->query("SELECT * FROM players");
while ($player = $rawPlayers->fetch()) {
    $players[$player['id']] = $player['name'];
}

while ($mission = $missions->fetch()) {

    $entityId = 0;
    $infantry = array();
    $missionId = $mission['id'];

    echo $mission['missionName'];

    // Save our mission into the new db
    $query = $newConnection->prepare("
        INSERT INTO missions
        (`id`, `name`, `terrain`, `day_time`, `addon_version`, `created_at`, `last_event_time`)
        VALUES
        (:id, :name, :terrain, :day_time, :addon_version, :created_at, :last_event_time)
        ON DUPLICATE KEY UPDATE id = :id");

    $query->execute(array(
        'id' => $mission['id'],
        'name' => $mission['missionName'],
        'terrain' => $mission['map'],
        'day_time' => $mission['dayTime'],
        'addon_version' => $mission['addonVersion'],
        'created_at' => $mission['dateStarted'],
        'last_event_time' => $mission['lastEventMissionTime']
    ));

    $events = $oldConnection->prepare("SELECT * FROM events WHERE replayId = :id ORDER BY missionTime ASC");
    $events->execute(array('id' => $mission['id']));

    while ($event = $events->fetch()) {

        if($event['type'] == "positions_infantry")
            infantryEvent($event);
    }
}
