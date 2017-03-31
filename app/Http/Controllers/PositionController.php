<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

use Setting;
use Carbon\Carbon;

class PositionController extends Controller
{

    /**
     * @SWG\Get(
     *     tags={"positions"},
     *     path="/positions/[type]",
     *     summary="Finds all positions for a particular type for a single mission",
     *     description="Returns all mission positions",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all type positions for a single mission"
     *     )
     * )
     */
    public function fetchAll($type, $missionId)
    {
        if($type != "infantry" && $type != "vehicle")
            return response()->json(['error' => 'Position type not found'], 404);

        return Cache::remember("positions:{$type}:{$missionId}", '1440', function () use ($type, $missionId) {

            switch($type) {

                case "infantry":
                    $keys = array('entity_id', 'x', 'y', 'direction', 'key_frame', 'mission_time');
                    break;

                case "vehicle":
                    $keys = array('entity_id', 'x', 'y', 'z', 'direction', 'key_frame', 'driver', 'crew', 'cargo', 'mission_time');
                    break;
            }

            $positions = DB::table("{$type}_positions")
                ->select($keys)
                ->where('mission', $missionId)
                ->get();

            $groupedPositions = $positions->groupBy('mission_time');

            return $groupedPositions;
        });
    }
}
