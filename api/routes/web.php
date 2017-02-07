<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

// Missions API
$app->group(['prefix' => 'missions'], function () use ($app) {
    $app->get('/', 'MissionController@fetchAll');
    $app->get('/{id}', 'MissionController@fetchOne');
});
