<?php

namespace App\Http\Controllers;

use App\Mission;
use App\Infantry;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;

Carbon::setLocale(config('app.locale'));

class StatsController extends Controller
{
    /**
     * @SWG\Get(
     *     tags={"Stats"},
     *     path="/stats/summary",
     *     summary="Returns summary stats",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all summary stats"
     *     )
     * )
     */
    public function fetchSummary()
    {

    }

    /**
     * @SWG\Get(
     *     tags={"Stats"},
     *     path="/stats/terrains",
     *     summary="Returns stats for terrains played on",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all terrain stats"
     *     )
     * )
     */
    public function fetchTerrains()
    {
        $missions = DB::table('missions')
                    ->select(
                        'missions.terrain',
                        DB::raw('COUNT(missions.terrain) as play_count'),
                        DB::raw('(
                            SELECT subtable.created_at FROM missions subtable
                            WHERE subtable.terrain = missions.terrain
                            ORDER BY subtable.created_at DESC LIMIT 1)
                            as last_played
                        '))
                    ->where('missions.hidden', 0)
                    ->groupBy('missions.terrain')
                    ->orderBy('play_count', 'desc')
                    ->get();

        foreach($missions as $mission) {

            // Generate extra data for consumption
            $missionStart = Carbon::parse($mission->last_played);
            $missionStart->setTimezone(config('app.timezone'));

            $mission->last_played_human = humanEventOccuredFromNow($missionStart);
        }

        return $missions;
    }

    /**
     * @SWG\Get(
     *     tags={"Stats"},
     *     path="/stats/attendance",
     *     summary="Returns stats for attendance",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all players, their mission played count and when they were last seen"
     *     )
     * )
     */
    public function fetchAttendance()
    {
        $stats = DB::table(DB::raw('(SELECT player_id, mission, name FROM infantry GROUP BY player_id, mission) as unique_infantry'))
                    ->distinct('player_id')
                    ->select(
                        'player_id',
                        'name',
                        DB::raw('COUNT(*) as mission_count'),
                        DB::raw('
                            (
                                SELECT mj.created_at
                                FROM infantry ij
                                LEFT JOIN missions mj
                                ON mj.id = ij.mission
                                WHERE ij.player_id = unique_infantry.player_id
                                ORDER BY ij.mission DESC
                                LIMIT 1
                            ) as last_seen')
                    )
                    ->groupBy('player_id')
                    ->orderBy('mission_count', 'desc')
                    ->get();

        foreach($stats as $stat) {

            // Generate extra data for consumption
            $lastSeen = Carbon::parse($stat->last_seen);
            $lastSeen->setTimezone(config('app.timezone'));

            $stat->last_seen_human = $lastSeen->diffForHumans();
        }

        return $stats;
    }

    /**
     * @SWG\Get(
     *     tags={"Stats"},
     *     path="/stats/player/{playerId}",
     *     summary="Find player stats by by Id",
     *     @SWG\Parameter(
     *         description="Id of player to return",
     *         in="path",
     *         name="playerId",
     *         required=true,
     *         default=1,
     *         type="integer",
     *         format="int64"
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Stats for a single player"
     *     ),
     *     @SWG\Response(
     *         response="404",
     *         description="Playeer not found"
     *     )
     * )
     */
    public function fetchPlayer($playerId = 0)
    {
        $stats = [];

        $stats['missionCount'] = Infantry::where('player_id', $playerId)->count();

        if($stats['missionCount'] == 0)
            return response()->json(['error' => 'Player Not Found'], 404);

        $stats['bio'] = Infantry::select('name')
                                    ->where('player_id', $playerId)
                                    ->orderBy('mission', 'desc')
                                    ->first();

        $stats['kills'] = DB::table('events_downed')
                                ->select(DB::raw('count(events_downed.mission) as total'))
                                ->join('infantry', 'events_downed.entity_attacker', '=', 'infantry.entity_id')
                                ->where('infantry.player_id', $playerId)
                                ->where('events_downed.type', 'killed')
                                ->orderBy('total', 'desc')
                                ->first();

        $stats['deaths'] = DB::table('events_downed')
                                ->select(DB::raw('count(events_downed.mission) as total'))
                                ->join('infantry', 'events_downed.entity_victim', '=', 'infantry.entity_id')
                                ->where('infantry.player_id', $playerId)
                                ->where('events_downed.type', 'killed')
                                ->orderBy('total', 'desc')
                                ->first();

        $stats['fireTeams'] = Infantry::select('infantry.group', DB::raw('count(infantry.group) as total'))
                                            ->where('player_id', $playerId)
                                            ->groupBy('infantry.group')
                                            ->orderBy('total', 'desc')
                                            ->get();

        $stats['classes'] = Infantry::select('class', DB::raw('count(class) as total, ANY_VALUE(icon) as icon'))
                                            ->where('player_id', $playerId)
                                            ->groupBy('class')
                                            ->orderBy('total', 'desc')
                                            ->get();

        foreach($stats['classes'] as $class) {
            $class->iconUrl = config('r3.iconDomain') . '/' . $class['icon'] . '-west-trim.png';
        }

        $stats['factionCount'] = Infantry::select('faction', DB::raw('count(faction) as total'))
                                            ->where('player_id', $playerId)
                                            ->groupBy('faction')
                                            ->orderBy('total', 'desc')
                                            ->get();

        foreach($stats['factionCount'] as $faction) {
            $faction->factionData = getFactionData($faction['faction']);
        }

        return $stats;
    }
}
