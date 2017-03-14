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
        return Cache::remember("positions:{$type}:{$missionId}", '1440', function () use ($type, $missionId) {

            return DB::table("{$type}_positions")->select('entity_id', 'x', 'y', 'direction', 'key_frame', 'mission_time')->where('mission', $missionId)->get();
        });
    }
}
