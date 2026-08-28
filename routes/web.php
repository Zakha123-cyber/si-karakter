<?php

use App\Http\Controllers\Admin\AcademicYearController;
use App\Http\Controllers\Admin\EducationalContentController;
use App\Http\Controllers\Admin\GroupController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\TestResultController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EducationalContentMediaController;
use App\Http\Controllers\Teacher\CharacterIndicatorController;
use App\Http\Controllers\Teacher\MoralCaseController;
use App\Http\Controllers\Teacher\ObservationController;
use App\Http\Controllers\Teacher\ReportController;
use App\Http\Controllers\Teacher\ReviewController;
use App\Http\Controllers\Teacher\ScoringConfigurationController;
use App\Http\Controllers\Teacher\SimulationScenarioController;
use App\Http\Controllers\Teacher\TestPackageController;
use App\Http\Controllers\Teacher\WarningController;
use Illuminate\Support\Facades\Route;

require __DIR__.'/student.php';

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

Route::middleware(['auth', 'active'])->group(function () {
    Route::get('educational-contents/{educationalContent}/media/{type}', EducationalContentMediaController::class)
        ->name('educational-contents.media');
});

Route::middleware(['auth', 'active', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
    Route::post('users', [UserManagementController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::patch('users/{user}/status', [UserManagementController::class, 'updateStatus'])->name('users.status');
    Route::post('users/{user}/reset-credential', [UserManagementController::class, 'resetCredential'])->name('users.reset-credential');

    // Academic Years
    Route::get('academic-years', [AcademicYearController::class, 'index'])->name('academic-years.index');
    Route::post('academic-years', [AcademicYearController::class, 'store'])->name('academic-years.store');
    Route::put('academic-years/{academicYear}', [AcademicYearController::class, 'update'])->name('academic-years.update');
    Route::delete('academic-years/{academicYear}', [AcademicYearController::class, 'destroy'])->name('academic-years.destroy');
    Route::patch('academic-years/{academicYear}/activate', [AcademicYearController::class, 'activate'])->name('academic-years.activate');

    // Groups
    Route::get('groups', [GroupController::class, 'index'])->name('groups.index');
    Route::post('groups', [GroupController::class, 'store'])->name('groups.store');
    Route::put('groups/{group}', [GroupController::class, 'update'])->name('groups.update');
    Route::delete('groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
    Route::post('groups/{group}/students', [GroupController::class, 'assignStudents'])->name('groups.students.assign');
    Route::delete('groups/{group}/students/{student}', [GroupController::class, 'removeStudent'])->name('groups.students.remove');

    // Students
    Route::get('students', [StudentController::class, 'index'])->name('students.index');
    Route::post('students', [StudentController::class, 'store'])->name('students.store');
    Route::put('students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::patch('students/{student}/status', [StudentController::class, 'updateStatus'])->name('students.status');
    Route::delete('students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

    // Test Results
    Route::get('test-results', [TestResultController::class, 'index'])->name('test-results.index');
    Route::get('test-results/answers/{answer}/audio', [TestResultController::class, 'audio'])->name('test-results.answers.audio');
    Route::get('test-results/{testAttempt}', [TestResultController::class, 'show'])->name('test-results.show');
});

Route::middleware(['auth', 'active', 'role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::resource('character-indicators', CharacterIndicatorController::class)->except(['create', 'edit', 'show']);
    Route::patch('character-indicators/{character_indicator}/status', [CharacterIndicatorController::class, 'updateStatus'])->name('character-indicators.status');

    Route::resource('scoring-configurations', ScoringConfigurationController::class)->except(['create', 'edit', 'show']);

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

    // Educational Content
    Route::get('educational-contents', [EducationalContentController::class, 'index'])->name('educational-contents.index');
    Route::post('educational-contents', [EducationalContentController::class, 'store'])->name('educational-contents.store');
    Route::put('educational-contents/{educationalContent}', [EducationalContentController::class, 'update'])->name('educational-contents.update');
    Route::delete('educational-contents/{educationalContent}', [EducationalContentController::class, 'destroy'])->name('educational-contents.destroy');
    Route::post('educational-contents/{educationalContent}/indicators', [EducationalContentController::class, 'assignIndicators'])->name('educational-contents.indicators');
    Route::post('educational-contents/{educationalContent}/media', [EducationalContentController::class, 'uploadMedia'])->name('educational-contents.media');

    // Assertiveness Simulation
    Route::get('simulation-scenarios', [SimulationScenarioController::class, 'index'])->name('simulation-scenarios.index');
    Route::post('simulation-scenarios', [SimulationScenarioController::class, 'store'])->name('simulation-scenarios.store');
    Route::put('simulation-scenarios/{simulationScenario}', [SimulationScenarioController::class, 'update'])->name('simulation-scenarios.update');
    Route::delete('simulation-scenarios/{simulationScenario}', [SimulationScenarioController::class, 'destroy'])->name('simulation-scenarios.destroy');
    Route::post('simulation-scenarios/{simulationScenario}/options', [SimulationScenarioController::class, 'storeOption'])->name('simulation-scenarios.options.store');
    Route::put('simulation-scenarios/{simulationScenario}/options/{option}', [SimulationScenarioController::class, 'updateOption'])->name('simulation-scenarios.options.update');
    Route::delete('simulation-scenarios/{simulationScenario}/options/{option}', [SimulationScenarioController::class, 'destroyOption'])->name('simulation-scenarios.options.destroy');
});

Route::middleware(['auth', 'active', 'role:teacher,admin'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::get('reviews/{answer}', [ReviewController::class, 'show'])->name('reviews.show');
    Route::get('reviews/{answer}/audio', [ReviewController::class, 'audio'])->name('reviews.audio');
    Route::put('reviews/{answer}/transcript', [ReviewController::class, 'updateTranscript'])->name('reviews.transcript.update');
    Route::post('reviews/{answer}/approve', [ReviewController::class, 'approve'])->name('reviews.approve');
    Route::post('reviews/{answer}/override', [ReviewController::class, 'override'])->name('reviews.override');
    Route::post('reviews/{answer}/retry-transcription', [ReviewController::class, 'retryTranscription'])->name('reviews.retry-transcription');

    // Daily Observation
    Route::get('observations', [ObservationController::class, 'index'])->name('observations.index');
    Route::post('observations', [ObservationController::class, 'store'])->name('observations.store');
    Route::put('observations/{observationEntry}', [ObservationController::class, 'update'])->name('observations.update');
    Route::delete('observations/{observationEntry}', [ObservationController::class, 'destroy'])->name('observations.destroy');

    // Early Warning / Pendampingan
    Route::get('warnings', [WarningController::class, 'index'])->name('warnings.index');
    Route::post('warnings/generate', [WarningController::class, 'generate'])->name('warnings.generate');
    Route::post('warnings/{warning}/review', [WarningController::class, 'review'])->name('warnings.review');
    Route::post('warnings/{warning}/resolve', [WarningController::class, 'resolve'])->name('warnings.resolve');

    // Character Reports
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('reports/generate', [ReportController::class, 'generate'])->name('reports.generate');
    Route::get('reports/{report}', [ReportController::class, 'show'])->name('reports.show');
    Route::put('reports/{report}', [ReportController::class, 'update'])->name('reports.update');
    Route::post('reports/{report}/generate-narrative', [ReportController::class, 'generateNarrative'])->name('reports.generate-narrative');
    Route::post('reports/{report}/review', [ReportController::class, 'review'])->name('reports.review');
    Route::post('reports/{report}/publish', [ReportController::class, 'publish'])->name('reports.publish');
    Route::get('reports/{report}/pdf', [ReportController::class, 'pdf'])->name('reports.pdf');
});

require __DIR__.'/settings.php';
