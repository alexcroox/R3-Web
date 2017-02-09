<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVehiclePositionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vehicle_positions', function (Blueprint $table) {

            $table->integer('mission');
            $table->string('unit', 60);
            $table->string('position', 60);
            $table->smallInteger('direction');
            $table->string('driver', 60);
            $table->string('crew', 500);
            $table->string('cargo', 2000);
            $table->integer('mission_time');

            $table->index('mission');
            $table->index('unit');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('vehicle_positions');
    }
}
