<?php

use App\Http\Controllers\Admin\CharacterIndicatorController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('character-indicators', CharacterIndicatorController::class)->except(['create', 'edit', 'show']);
    Route::patch('character-indicators/{character_indicator}/status', [CharacterIndicatorController::class, 'updateStatus'])->name('character-indicators.status');
});

require __DIR__.'/settings.php';
