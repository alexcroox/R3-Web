<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsConnectionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events_connections', function (Blueprint $table) {

            $table->integer('mission');
            $table->integer('mission_time');
            $table->string('type', 20);
            $table->string('player_id', 60);
            $table->string('player_name', 60);

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
        Schema::dropIfExists('events_connections');
    }
}
