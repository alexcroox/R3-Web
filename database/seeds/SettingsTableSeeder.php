<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class SettingsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('settings')->insert([
            'key' => 'unitName',
            'value' => 'Unit Name'
        ]);

        DB::table('settings')->insert([
            'key' => 'minutesMissionEndBlock',
            'value' => 2
        ]);

        DB::table('settings')->insert([
            'key' => 'minutesMinimumMission',
            'value' => 5
        ]);

        DB::table('settings')->insert([
            'key' => 'minimumMissionPlayers',
            'value' => 1
        ]);
    }
}
