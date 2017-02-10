<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVehiclesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vehicles', function (Blueprint $table) {

            $table->integer('mission');
            $table->smallInteger('entity_id');
            $table->string('class', 100);
            $table->string('icon', 60);
            $table->string('icon_path', 100);
            $table->integer('mission_time');
            $table->timestamp('created_at')->nullable();

            $table->index('mission');
            $table->index('entity_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('vehicles');
    }
}
