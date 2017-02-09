<?php

namespace App\Http\Controllers;

use App\Event;
use App\Mission;
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

        return Event::where('mission', $missionId)
                        ->orderBy('mission_time', 'asc')
                        ->get();
    }
}
