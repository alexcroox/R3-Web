<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class EventDowned extends Model
{
    protected $table = 'events_downed';

    public $timestamps = false;

    protected $fillable = [];
}
