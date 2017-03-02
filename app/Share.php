<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class Share extends Model
{

    protected $fillable = ['url', 'description', 'mission', 'ip_address'];

    protected $hidden = ['ip_address'];
}
