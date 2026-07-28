<?php

use App\Http\Controllers\Student\TestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'active', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('tests', [TestController::class, 'index'])->name('tests.index');
    Route::post('tests/{testPackage}/attempts', [TestController::class, 'startAttempt'])->name('tests.attempts.start');
    Route::get('tests/{testPackage}/attempts/{testAttempt}', [TestController::class, 'showAttempt'])->name('tests.attempts.show');
    Route::post('tests/{testPackage}/attempts/{testAttempt}/answers', [TestController::class, 'storeAnswer'])->name('tests.answers.store');
    Route::post('tests/{testPackage}/attempts/{testAttempt}/submit', [TestController::class, 'submitAttempt'])->name('tests.attempts.submit');
});
