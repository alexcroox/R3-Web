<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class Vehicle extends Model
{
    public $timestamps = false;
    protected $table = 'vehicles';

    protected $fillable = [];
}
