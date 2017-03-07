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

Route::get('{all}', function () {

    $mappingAliases = file_get_contents('https://r3tiles-a.titanmods.xyz/config.json');
    $locales = file_get_contents('https://titanmods.xyz/r3/locale/config.json');

    return view('home', [
        'settings' => Setting::all(),
        'mappingAliases' => $mappingAliases,
        'locales' => $locales
    ]);
})->where('all', '.*');
