<?php
// Keep track of unique infantry units
$infantry = array();

function infantryEvent($rawEvents) {

    global $newConnection;
    global $infantry;
    global $entityId;
    global $players;
    global $missionId;
    global $keyFrame;

    $events = json_decode($rawEvents['value'], TRUE);

    $missionTime = $rawEvents['missionTime'];

    foreach($events as $e) {

        // First time we've seen this unit?
        if(!isset($infantry[$e['unit']])) {

            $entityId++;

            $name = (isset($players[$e['id']]))? $players[$e['id']] : 'ai';

            $infantry[$e['unit']] = array(
                'entity_id' => $entityId,
                'unit' => $e['unit'],
                'faction' => $e['fac']
            );

            // Save our infantry into the new db
            $query = $newConnection->prepare("
                INSERT INTO infantry
                (`mission`, `player_id`, `entity_id`, `name`, `faction`, `class`, `group`, `leader`, `icon`, `mission_time`)
                VALUES
                (:mission, :player_id, :entity_id, :name, :faction, :class, :group, :leader, :icon, :mission_time)");

            $query->execute(array(
                'mission' => $missionId,
                'player_id' => $e['id'],
                'entity_id' => $entityId,
                'name' => $name,
                'faction' => $e['fac'],
                'class' => '',
                'group' => $e['grp'],
                'leader' => ($e['ldr'] === "true")? 1 : 0,
                'icon' => $e['ico'],
                'mission_time' => $missionTime
            ));

            var_dump("Inserted infantry {$entityId}");
        }
    }
}
