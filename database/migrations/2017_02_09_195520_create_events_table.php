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
            $table->string('type', 50);
            $table->smallInteger('entity_a');
            $table->smallInteger('entity_b')->default(0);
            $table->string('key_data', 100)->nullable();
            $table->string('extra_data', 2000)->nullable();
            $table->integer('mission_time');

            $table->index('mission');
            $table->index('entity_a');
            $table->index('entity_b');
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
