<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsProjectileTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events_projectile', function (Blueprint $table) {

            $table->integer('mission');
            $table->integer('mission_time');
            $table->string('type', 30);
            $table->smallInteger('entity_attacker');
            $table->float('x', 6, 1);
            $table->float('y', 6, 1);
            $table->string('projectile_name', 50);

            $table->index('mission');
            $table->index('mission_time');
            $table->index('entity_attacker');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events_projectile');
    }
}
