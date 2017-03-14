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
use Illuminate\Support\Facades\Cache;

use Setting;
use Carbon\Carbon;

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
        return Cache::remember("events:{$missionId}", '1440', function () use ($missionId) {

            $events = collect();

            $connectionEvents = EventConnection::where('mission', $missionId)->get();
            $events->push($connectionEvents);

            $downedEvents = EventDowned::where('mission', $missionId)->get();
            $events->push($downedEvents);

            $getInOutEvents = EventGetInOut::where('mission', $missionId)->get();
            $events->push($getInOutEvents);

            $missileEvents = EventMissile::where('mission', $missionId)->get();
            $events->push($missileEvents);

            $projectileEvents = EventProjectile::where('mission', $missionId)->get();
            $events->push($projectileEvents);

            $flattenedEvents = $events->flatten();
            $sortedEvents = $flattenedEvents->sortBy(function($event) {
                return (int) $event->mission_time;
            });
            $sortedEvents = $sortedEvents->flatten();

            return $sortedEvents->all();
        });
    }
}
