<?php

namespace App\Http\Controllers;

use App\Infantry;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

use Setting;
use Carbon\Carbon;

class InfantryController extends Controller
{

    /**
     * @SWG\Get(
     *     tags={"Infantry"},
     *     path="/infantry",
     *     summary="Finds all infantry entities for a mission",
     *     description="Returns all infantry entities",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all infantry entities for a single mission"
     *     )
     * )
     */
    public function fetchAll($missionId)
    {
        return Cache::remember('infantry:{$missionId}', '1440', function () use ($missionId) {

            return Infantry::where('mission', $missionId)->get();
        });
    }
}
