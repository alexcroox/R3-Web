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

Route::group(['prefix' => 'settings'], function () {
    Route::get('/', 'SettingController@fetchAll');
});

Route::group(['prefix' => 'missions'], function () {
    Route::get('/', 'MissionController@fetchAllVisible');
    Route::get('/{id}', 'MissionController@fetchOne')->middleware('checkMissionEnded');
});

Route::group(['prefix' => 'events', 'middleware' => 'checkMissionEnded'], function () {
    Route::get('/{id}', 'EventController@fetchAllMissionEvents');
});

Route::group(['prefix' => 'infantry'], function () {
    Route::get('/{id}', 'InfantryController@fetchAll');
});

Route::group(['prefix' => 'vehicles'], function () {
    Route::get('/{id}', 'VehicleController@fetchAll');
});

Route::group(['prefix' => 'positions', 'middleware' => 'checkMissionEnded'], function () {
    Route::get('/{type}/{id}', 'PositionController@fetchAll');
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
    Route::get('/player/{id}', 'StatsController@fetchPlayer');
    Route::get('/mission/{id}', 'StatsController@fetchMission');
});
