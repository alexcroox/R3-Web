<?php

namespace App\Http\Controllers;

use App\Vehicle;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

use Setting;
use Carbon\Carbon;

class VehicleController extends Controller
{

    /**
     * @SWG\Get(
     *     tags={"Vehicles"},
     *     path="/vehicles",
     *     summary="Finds all vehicle entities for a mission",
     *     description="Returns all vehicle entities",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all vehicle entities for a single mission"
     *     )
     * )
     */
    public function fetchAll($missionId)
    {
        return Cache::remember("vehicle:{$missionId}", '1440', function () use ($missionId) {

            return Vehicle::where('mission', $missionId)->get();
        });
    }
}
