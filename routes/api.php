<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('web')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login'])->name('api.auth.login');

    Route::middleware(['auth', 'active'])->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
        Route::get('auth/me', [AuthController::class, 'me'])->name('api.auth.me');
        Route::post('auth/change-password', [AuthController::class, 'changePassword'])->name('api.auth.change-password');

        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class)->except(['destroy']);
            Route::patch('users/{user}/status', [UserController::class, 'updateStatus'])->name('users.status');
            Route::post('users/{user}/reset-credential', [UserController::class, 'resetCredential'])->name('users.reset-credential');
        });
    });
});
