<?php

namespace App\Http\Controllers;

use App\Setting;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class SettingController extends Controller
{

    /**
     * @SWG\Get(
     *     tags={"Settings"},
     *     path="/settings",
     *     summary="Returns all app settings for the front end",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all public settings"
     *     )
     * )
     */
    public function fetchAll()
    {
        return Setting::where('public', 1)->get()->mapWithKeys(function ($item) {
            return [$item['key'] => $item['value']];
        });
    }
}
