<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['prefix' => 'settings'], function () {
    Route::get('/', 'SettingController@fetchAll');
});

Route::group(['prefix' => 'missions'], function () {
    Route::get('/', 'MissionController@fetchAllVisible');
    Route::get('/{id}', 'MissionController@fetchOne');
});

Route::group(['prefix' => 'shares'], function () {
    Route::get('/', 'ShareController@fetchAll');
    Route::post('/', 'ShareController@store');
    Route::get('/{id}', 'ShareController@fetchOne');
});

Route::group(['prefix' => 'stats'], function () {
    Route::get('/', 'StatsController@fetchSummary');
    Route::get('/terrains', 'StatsController@fetchTerrains');
    Route::get('/attendance', 'StatsController@fetchAttendance');
});
