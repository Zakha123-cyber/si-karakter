<?php

use App\Http\Controllers\Student\DashboardController;
use App\Http\Controllers\Student\EducationalContentController;
use App\Http\Controllers\Student\GoodnessTreeController;
use App\Http\Controllers\Student\TestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'active', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('goodness-tree', GoodnessTreeController::class)->name('goodness-tree');
    Route::get('contents', [EducationalContentController::class, 'index'])->name('contents.index');
    Route::get('contents/{educationalContent:slug}', [EducationalContentController::class, 'show'])->name('contents.show');
    Route::post('contents/{educationalContent:slug}/interactions', [EducationalContentController::class, 'interact'])->name('contents.interactions');
    Route::get('tests', [TestController::class, 'index'])->name('tests.index');
    Route::post('tests/{testPackage}/attempts', [TestController::class, 'startAttempt'])->name('tests.attempts.start');
    Route::get('tests/{testPackage}/attempts/{testAttempt}', [TestController::class, 'showAttempt'])->name('tests.attempts.show');
    Route::post('tests/{testPackage}/attempts/{testAttempt}/answers', [TestController::class, 'storeAnswer'])->name('tests.answers.store');
    Route::post('tests/{testPackage}/attempts/{testAttempt}/submit', [TestController::class, 'submitAttempt'])->name('tests.attempts.submit');
});
