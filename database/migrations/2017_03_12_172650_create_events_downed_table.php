<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsDownedTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events_downed', function (Blueprint $table) {

            $table->integer('mission');
            $table->integer('mission_time');
            $table->string('type', 30);
            $table->smallInteger('entity_attacker');
            $table->smallInteger('entity_victim');
            $table->tinyInteger('same_faction')->default(0);
            $table->smallInteger('distance');
            $table->string('weapon', 40);

            $table->index('mission');
            $table->index('mission_time');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events_downed');
    }
}
