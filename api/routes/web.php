<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

$app->group(['prefix' => 'missions'], function () use ($app) {
    $app->get('/', 'MissionController@fetchAll');
    $app->get('/{id}', 'MissionController@fetchOne');
});

$app->group(['prefix' => 'missions'], function () use ($app) {
    $app->get('/', 'MissionController@fetchAll');
    $app->get('/{id}', 'MissionController@fetchOne');
});
