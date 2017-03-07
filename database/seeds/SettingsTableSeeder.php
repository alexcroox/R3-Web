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
    }
}
