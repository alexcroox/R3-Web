<?php

namespace App\Http\Controllers;

use App\EventConnection;
use App\EventDowned;
use App\EventGetInOut;
use App\EventMissile;
use App\EventProjectile;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class EventController extends Controller
{

    /**
     * @SWG\Get(
     *     tags={"Events"},
     *     path="/events",
     *     summary="Finds all events for a mission",
     *     description="Returns all missions events",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all events for a single mission"
     *     )
     * )
     */
    public function fetchAllMissionEvents($missionId)
    {
        $events = collect();

        $connectionEvents = EventConnection::where('mission', $missionId)
           ->orderBy('mission_time', 'asc')
           ->get();

        $events->push($connectionEvents);

        $downedEvents = EventDowned::where('mission', $missionId)
           ->orderBy('mission_time', 'asc')
           ->get();

        $events->push($downedEvents);

        $getInOutEvents = EventGetInOut::where('mission', $missionId)
           ->orderBy('mission_time', 'asc')
           ->get();

        $events->push($getInOutEvents);

        $missileEvents = EventMissile::where('mission', $missionId)
           ->orderBy('mission_time', 'asc')
           ->get();

        $events->push($missileEvents);

        $projectileEvents = EventProjectile::where('mission', $missionId)
           ->orderBy('mission_time', 'asc')
           ->get();

        $events->push($projectileEvents);

        $flattenedEvents = $events->flatten();
        $sortedEvents = $flattenedEvents->sortBy('mission_time');

        return $sortedEvents->all();
    }
}
