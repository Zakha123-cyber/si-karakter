<?php

use App\Http\Controllers\Admin\CharacterIndicatorController;
use App\Http\Controllers\Admin\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
    Route::post('users', [UserManagementController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::patch('users/{user}/status', [UserManagementController::class, 'updateStatus'])->name('users.status');
    Route::post('users/{user}/reset-credential', [UserManagementController::class, 'resetCredential'])->name('users.reset-credential');

    Route::resource('character-indicators', CharacterIndicatorController::class)->except(['create', 'edit', 'show']);
    Route::patch('character-indicators/{character_indicator}/status', [CharacterIndicatorController::class, 'updateStatus'])->name('character-indicators.status');
});

require __DIR__.'/settings.php';
