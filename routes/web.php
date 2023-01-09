<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SpaController;
use App\Http\Controllers\LinksController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\HealthController;

Route::get('/', SpaController::class);

Route::group(['prefix' => 'internal', 'as' => 'internal'], function()
{
    Route::post('stats', StatsController::class)->name('.stats');
    Route::any('health', HealthController::class)->name('.health');
});

Route::group(['prefix' => 'api', 'controller' => LinksController::class, 'as' => 'api'], function()
{
    Route::put('create', 'create')->name('.links.create');
});

Route::get('{shortcode}', [LinksController::class, 'tryProcess'])->name('links.visit');
