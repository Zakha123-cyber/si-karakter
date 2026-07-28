<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Teacher\CharacterIndicatorController;
use App\Http\Controllers\Teacher\MoralCaseController;
use App\Http\Controllers\Teacher\TestPackageController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth', 'active', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
    Route::post('users', [UserManagementController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::patch('users/{user}/status', [UserManagementController::class, 'updateStatus'])->name('users.status');
    Route::post('users/{user}/reset-credential', [UserManagementController::class, 'resetCredential'])->name('users.reset-credential');
});

Route::middleware(['auth', 'active', 'role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::resource('character-indicators', CharacterIndicatorController::class)->except(['create', 'edit', 'show']);
    Route::patch('character-indicators/{character_indicator}/status', [CharacterIndicatorController::class, 'updateStatus'])->name('character-indicators.status');

    Route::get('moral-cases', [MoralCaseController::class, 'index'])->name('moral-cases.index');
    Route::post('moral-cases', [MoralCaseController::class, 'store'])->name('moral-cases.store');
    Route::put('moral-cases/{moralCase}', [MoralCaseController::class, 'update'])->name('moral-cases.update');
    Route::delete('moral-cases/{moralCase}', [MoralCaseController::class, 'destroy'])->name('moral-cases.destroy');
    Route::post('moral-cases/{moralCase}/options', [MoralCaseController::class, 'storeOption'])->name('moral-cases.options.store');
    Route::put('moral-cases/{moralCase}/options/{option}', [MoralCaseController::class, 'updateOption'])->name('moral-cases.options.update');
    Route::delete('moral-cases/{moralCase}/options/{option}', [MoralCaseController::class, 'destroyOption'])->name('moral-cases.options.destroy');
    Route::post('moral-cases/{moralCase}/indicators', [MoralCaseController::class, 'assignIndicators'])->name('moral-cases.indicators');
    Route::post('moral-cases/{moralCase}/media', [MoralCaseController::class, 'uploadMedia'])->name('moral-cases.media');

    Route::get('test-packages', [TestPackageController::class, 'index'])->name('test-packages.index');
    Route::post('test-packages', [TestPackageController::class, 'store'])->name('test-packages.store');
    Route::put('test-packages/{testPackage}', [TestPackageController::class, 'update'])->name('test-packages.update');
    Route::delete('test-packages/{testPackage}', [TestPackageController::class, 'destroy'])->name('test-packages.destroy');
    Route::post('test-packages/{testPackage}/groups', [TestPackageController::class, 'assignGroups'])->name('test-packages.groups');
    Route::post('test-packages/{testPackage}/cases', [TestPackageController::class, 'assignCases'])->name('test-packages.cases');
    Route::post('test-packages/{testPackage}/publish', [TestPackageController::class, 'publish'])->name('test-packages.publish');
    Route::post('test-packages/{testPackage}/close', [TestPackageController::class, 'close'])->name('test-packages.close');
});

require __DIR__.'/settings.php';
