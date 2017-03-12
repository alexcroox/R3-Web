<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsMissilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events_missiles', function (Blueprint $table) {

            $table->integer('mission');
            $table->integer('mission_time');
            $table->string('type', 20);
            $table->smallInteger('entity_attacker');
            $table->smallInteger('entity_victim');
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
        Schema::dropIfExists('events_missiles');
    }
}
