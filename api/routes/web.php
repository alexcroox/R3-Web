<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

$app->group(['prefix' => 'settings'], function () use ($app) {
    $app->get('/', 'SettingController@fetchAll');
});

$app->group(['prefix' => 'missions'], function () use ($app) {
    $app->get('/', 'MissionController@fetchAllVisible');
    $app->get('/{id}', 'MissionController@fetchOne');
});

$app->group(['prefix' => 'shares'], function () use ($app) {
    $app->get('/', 'ShareController@fetchAll');
    $app->post('/', 'ShareController@store');
    $app->get('/{id}', 'ShareController@fetchOne');
});
