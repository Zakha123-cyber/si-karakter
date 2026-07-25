<?php

use App\Http\Controllers\Api\V1\CharacterIndicatorController as ApiCharacterIndicatorController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::middleware(['auth'])->group(function () {
        Route::apiResource('character-indicators', ApiCharacterIndicatorController::class);
    });
});
