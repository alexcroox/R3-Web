<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsGetInOutTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events_get_in_out', function (Blueprint $table) {

            $table->integer('mission');
            $table->integer('mission_time');
            $table->string('type', 20);
            $table->smallInteger('entity_unit');
            $table->smallInteger('entity_vehicle');

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
        Schema::dropIfExists('events_get_in_out');
    }
}
