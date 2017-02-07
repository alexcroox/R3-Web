<?php

namespace App\Http\Controllers;

use App\Mission;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class MissionController extends Controller
{

    /**
     * @SWG\Get(
     *     path="/missions",
     *     summary="Finds all missions",
     *     description="Returns all missions that aren't hidden",
     *     produces={"application/json"},
     *     @SWG\Response(
     *         response=200,
     *         description="A list of missions"
     *     )
     * )
     */
    public function fetchAll()
    {
        $missions = DB::table('missions')->orderBy('id')->get();

        $missions = Mission::where('hidden', 0)
                        ->orderBy('id', 'desc')
                        ->get();

        return response()->json($missions);
    }

    /**
     * @SWG\Get(
     *     path="/missions/{missionId}",
     *     summary="Find mission by Id",
     *     description="Find mission by Id that isn't hidden",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *         description="Id of mission to return",
     *         in="path",
     *         name="missionId",
     *         required=true,
     *         default=1,
     *         type="integer",
     *         format="int64"
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="A list of missions"
     *     ),
     *     @SWG\Response(
     *         response="404",
     *         description="Mission not found"
     *     )
     * )
     */
    public function fetchOne($id)
    {
        $mission = Mission::where('hidden', 0)->find($id);

        if($mission)
            return response()->json($mission);
        else
            return response()->json(['error' => 'Not Found'], 404);
    }
}
