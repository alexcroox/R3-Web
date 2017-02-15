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
     *     tags={"Missions"},
     *     path="/missions",
     *     summary="Finds all visible missions",
     *     description="Returns all missions that aren't hidden",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all visible missions"
     *     )
     * )
     */
    public function fetchAllVisible()
    {
        // SELECT m.*, COUNT(distinct i.player_id) as player_count FROM missions m LEFT JOIN infantry i ON i.mission = m.id WHERE hidden = 0 GROUP BY m.id
        return Mission::where('hidden', 0)
                        ->orderBy('id', 'desc')
                        ->get();
    }

    /**
     * @SWG\Get(
     *     tags={"Missions"},
     *     path="/missions/all",
     *     summary="Finds all missions hidden or otherwise",
     *     description="Returns all missions, needs web token admin auth",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all missions"
     *     )
     * )
     */
    public function fetchAll()
    {

        return Mission::orderBy('id', 'desc')->get();
    }

    /**
     * @SWG\Get(
     *     tags={"Missions"},
     *     path="/missions/{missionId}",
     *     summary="Find mission by Id",
     *     description="Find mission by Id that isn't hidden",
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
     *         description="A single mission"
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
