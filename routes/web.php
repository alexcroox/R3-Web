<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('share/{id}', 'ShareController@load');

Route::get('{all}', function () {

    $mappingAliases = file_get_contents('https://r3tiles-a.titanmods.xyz/config.json');
    $locales = file_get_contents('https://titanmods.xyz/r3/locale/config.json');

    // Get the webpack assets and ensure vendor.js loads first
    $assetsJson = file_get_contents(public_path() . '/assets.json');
    $assets = json_decode($assetsJson);

    return view('home', [
        'settings' => Setting::all(),
        'mappingAliases' => $mappingAliases,
        'locales' => $locales,
        'assets' => $assets
    ]);
})->where('all', '.*');
