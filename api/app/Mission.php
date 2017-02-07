<?php namespace App;

use Illuminate\Database\Eloquent\Model;


class Mission extends Model
{

    protected $fillable = ['name', 'display_name', 'slug', 'hidden'];

    protected $hidden = ['addon_version'];

}
