<?php

use App\Http\Controllers\Api\V1\AcademicYearController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CharacterIndicatorController as ApiCharacterIndicatorController;
use App\Http\Controllers\Api\V1\GroupController;
use App\Http\Controllers\Api\V1\StudentController;
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

            Route::apiResource('character-indicators', ApiCharacterIndicatorController::class);

            Route::apiResource('academic-years', AcademicYearController::class);
            Route::patch('academic-years/{academicYear}/activate', [AcademicYearController::class, 'activate'])->name('academic-years.activate');

            Route::apiResource('groups', GroupController::class);
            Route::post('groups/{group}/students', [GroupController::class, 'assignStudent'])->name('groups.students.assign');
            Route::delete('groups/{group}/students/{student}', [GroupController::class, 'removeStudent'])->name('groups.students.remove');

            Route::apiResource('students', StudentController::class);
            Route::patch('students/{student}/status', [StudentController::class, 'updateStatus'])->name('students.status');
            Route::get('students/{student}/timeline', [StudentController::class, 'timeline'])->name('students.timeline');
        });
    });
});
