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

    $request = Request::create('/api/settings', 'GET');
    $getSettings = Route::dispatch($request);

    return view('home', ['settings' => json_decode($getSettings->content())]);
})->where('all', '.*');
