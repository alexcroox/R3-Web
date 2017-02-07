<?php

namespace App\Http\Controllers;

use App\Mission;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    /**
     * Fetch all missions
     *
     * @param  none
     * @return Response
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
     * Retrieve the mission for the given ID.
     *
     * @param  int  $id
     * @return Response
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
