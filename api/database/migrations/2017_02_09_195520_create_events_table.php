<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {

            $table->integer('mission');
            $table->string('unit_a', 60);
            $table->string('unit_b', 60);
            $table->string('extra_data', 2000);
            $table->string('type', 50);
            $table->integer('mission_time');
            $table->timestamp('created_at');

            $table->index('mission');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events');
    }
}
