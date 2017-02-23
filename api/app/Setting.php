<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class Setting extends Model
{

    protected $fillable = ['key', 'value', 'public'];

    protected $hidden = ['public', 'created_at', 'updated_at'];
}
