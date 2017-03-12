<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class EventConnection extends Model
{
    protected $table = 'events_connections';

    public $timestamps = false;

    protected $fillable = [];
}
