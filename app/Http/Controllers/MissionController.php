<?php

namespace App\Http\Controllers;

use App\Mission;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MissionController extends Controller
{
    private $selectPlayerCount = 'COUNT(distinct infantry.player_id) as player_count';
    private $selectLastEventTimestamp = '(SELECT p.added_on FROM infantry_positions p WHERE p.mission = missions.id ORDER BY p.mission_time DESC LIMIT 1) as last_event_timestamp';

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
        $missions = DB::table('missions')
                    ->select(
                        'missions.*',
                        DB::raw($this->selectPlayerCount),
                        DB::raw($this->selectLastEventTimestamp)
                    )
                    ->leftJoin('infantry', 'infantry.mission', '=', 'missions.id')
                    ->where('missions.hidden', 0)
                    ->groupBy('missions.id')
                    ->get();

        Carbon::setLocale(config('app.locale'));
        $currentTime = Carbon::now(config('app.timezone'));

        foreach($missions as $mission) {

            // Generate extra data for consumption
            $lastEventTime = Carbon::parse($mission->last_event_timestamp);
            $lastEventTime->setTimezone(config('app.timezone'));

            $missionStart = Carbon::parse($mission->created_at);
            $missionStart->setTimezone(config('app.timezone'));

            $mission->length_in_minutes = $missionStart->diffInMinutes($lastEventTime);
            $mission->minutes_since_last_event = $lastEventTime->diffInMinutes($currentTime);
            $mission->length_human = humanTimeDifference($lastEventTime, $missionStart);
            $mission->played_human = humanEventOccuredFromNow($missionStart);

            $mission->in_progress_block = ($mission->minutes_since_last_event < config('r3.minutes_mission_end_block'))? true : false;

            // Generate and save a slug if required
            $mission->slug = $this->generateSlug($mission);
        }

        return $missions;
    }

    private function generateSlug($mission = null) {

        if(!$mission || !$mission->display_name || $mission->slug)
            return $mission->slug;

        $slug = str_slug($mission->display_name);

        Mission::whereId($mission->id)->update(['slug' => $slug]);

        return $slug;
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
        $mission = DB::table('missions')
                    ->select(
                        'missions.*',
                        DB::raw($this->selectPlayerCount),
                        DB::raw($this->selectLastEventTimestamp)
                    )
                    ->leftJoin('infantry', 'infantry.mission', '=', 'missions.id')
                    ->where('missions.hidden', 0)
                    ->where('missions.id', $id)
                    ->groupBy('missions.id')
                    ->limit(1)
                    ->get();

        if($mission && count($mission)) {
            // Do some additional validation to check if the mission is in progress or not
            $currentTime = Carbon::now(config('app.timezone'));
            $lastEventTime = Carbon::parse($mission[0]->last_event_timestamp);
            $lastEventTime->setTimezone(config('app.timezone'));

            $differenceInMinutes = $currentTime->diffInMinutes($lastEventTime);

            if($differenceInMinutes >= config('r3.minutes_mission_end_block'))
                return response()->json($mission);
            else
                return response()->json(['error' => 'Mission not finished'], 406);
        } else {
            return response()->json(['error' => 'Not Found'], 404);
        }
    }
}
