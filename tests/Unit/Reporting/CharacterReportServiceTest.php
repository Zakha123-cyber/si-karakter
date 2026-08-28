<?php

use App\Domain\Reporting\CharacterReportService;
use App\Domain\Reporting\ReportSummaryBuilder;
use App\Models\AcademicYear;
use App\Models\CharacterIndicator;
use App\Models\CharacterReport;
use App\Models\Group;
use App\Models\MoralCase;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\User;
use App\Services\AI\Exceptions\AiAssessmentException;
use App\Services\AI\FakeReportNarrativeService;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function reportAttempt(Student $student, ?CarbonInterface $submittedAt = null): TestAttempt
{
    return TestAttempt::factory()->create([
        'student_id' => $student->id,
        'test_package_id' => TestPackage::factory(),
        'status' => 'submitted',
        'submitted_at' => $submittedAt ?? now(),
        'completed_at' => $submittedAt ?? now(),
    ]);
}

function reportAnswerValidated(TestAttempt $attempt, string $level, User $teacher): void
{
    $answer = TestAnswer::factory()->create([
        'test_attempt_id' => $attempt->id,
        'moral_case_id' => MoralCase::factory(),
    ]);

    TeacherValidation::query()->create([
        'test_answer_id' => $answer->id,
        'teacher_id' => $teacher->id,
        'decision' => 'approved',
        'final_moral_level' => $level,
        'final_indicators_json' => [],
        'validated_at' => now(),
    ]);
}

function reportObservationEntry(Student $student, User $teacher, CarbonInterface $observedAt, array $sentiments): void
{
    $entry = ObservationEntry::query()->create([
        'student_id' => $student->id,
        'teacher_id' => $teacher->id,
        'observed_at' => $observedAt->toDateString(),
    ]);

    foreach ($sentiments as $sentiment) {
        ObservationItem::query()->create([
            'observation_entry_id' => $entry->id,
            'character_indicator_id' => CharacterIndicator::factory()->create()->id,
            'sentiment' => $sentiment,
            'assessment_score' => null,
            'reward_points' => 0,
        ]);
    }
}

function reportingSetup(): array
{
    $teacher = User::factory()->teacher()->create();
    $year = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'teacher_id' => $teacher->id,
        'academic_year_id' => $year->id,
    ]);
    $student = Student::factory()->create(['current_group_id' => $group->id]);

    return [$student, $teacher];
}

test('generate draft fills test and observation summaries', function () {
    [$student, $teacher] = reportingSetup();

    $attempt = reportAttempt($student);
    reportAnswerValidated($attempt, 'post_conventional', $teacher);
    reportObservationEntry($student, $teacher, now(), ['positive', 'positive']);

    $service = app(CharacterReportService::class);
    $report = $service->generateDraft($student, now()->startOfMonth(), now()->endOfMonth(), $teacher->id);

    expect($report->status)->toBe('draft')
        ->and($report->test_summary_json['score'])->toEqual(100.0)
        ->and($report->observation_summary_json['score'])->toEqual(100.0)
        ->and($report->teacher_id)->toBe($teacher->id);
});

test('generate draft with existing report in same period updates it', function () {
    [$student, $teacher] = reportingSetup();

    $attempt = reportAttempt($student);
    reportAnswerValidated($attempt, 'post_conventional', $teacher);
    reportObservationEntry($student, $teacher, now(), ['positive', 'positive']);

    $service = app(CharacterReportService::class);
    $first = $service->generateDraft($student, now()->startOfMonth(), now()->endOfMonth(), $teacher->id);
    $second = $service->generateDraft($student, now()->startOfMonth(), now()->endOfMonth(), $teacher->id);

    expect($second->id)->toBe($first->id)
        ->and(CharacterReport::query()->count())->toBe(1);
});

test('narrative draft is stored as ai draft, not final narrative', function () {
    [$student, $teacher] = reportingSetup();

    $attempt = reportAttempt($student);
    reportAnswerValidated($attempt, 'post_conventional', $teacher);
    reportObservationEntry($student, $teacher, now(), ['positive', 'positive']);

    app()->bind(\App\Services\AI\ReportNarrativeService::class, fn () => new FakeReportNarrativeService);

    $service = app(CharacterReportService::class);
    $report = $service->generateDraft($student, now()->startOfMonth(), now()->endOfMonth(), $teacher->id);

    $updated = $service->generateNarrativeDraft($report);

    expect($updated->ai_generated_narrative)->not->toBeNull()
        ->and($updated->final_narrative)->toBe('')
        ->and($updated->recommendation)->not->toBe('');
});

test('narrative draft propagates ai failure', function () {
    [$student, $teacher] = reportingSetup();

    $attempt = reportAttempt($student);
    reportAnswerValidated($attempt, 'post_conventional', $teacher);
    reportObservationEntry($student, $teacher, now(), ['positive', 'positive']);

    app()->bind(\App\Services\AI\ReportNarrativeService::class, fn () => (new FakeReportNarrativeService)->failNext());

    $service = app(CharacterReportService::class);
    $report = $service->generateDraft($student, now()->startOfMonth(), now()->endOfMonth(), $teacher->id);

    expect(fn () => $service->generateNarrativeDraft($report))
        ->toThrow(AiAssessmentException::class);
});

test('review stores final narrative and switches status to reviewed', function () {
    [$student, $teacher] = reportingSetup();

    $report = CharacterReport::factory()->create([
        'student_id' => $student->id,
        'teacher_id' => $teacher->id,
    ]);

    $service = app(CharacterReportService::class);
    $updated = $service->review($report, 'Narasi final.', 'Rekomendasi.', $teacher->id);

    expect($updated->status)->toBe('reviewed')
        ->and($updated->final_narrative)->toBe('Narasi final.')
        ->and($updated->recommendation)->toBe('Rekomendasi.');
});

test('publish requires reviewed status', function () {
    [$student, $teacher] = reportingSetup();

    $report = CharacterReport::factory()->create([
        'student_id' => $student->id,
        'teacher_id' => $teacher->id,
    ]);

    $service = app(CharacterReportService::class);

    expect(fn () => $service->publish($report))
        ->toThrow(\LogicException::class);
});

test('summary builder returns complete summary when both parts exist', function () {
    [$student, $teacher] = reportingSetup();

    $attempt = reportAttempt($student);
    reportAnswerValidated($attempt, 'post_conventional', $teacher);
    reportObservationEntry($student, $teacher, now(), ['positive', 'positive']);

    $summary = app(ReportSummaryBuilder::class)
        ->buildForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($summary->complete())->toBeTrue()
        ->and($summary->testComplete())->toBeTrue()
        ->and($summary->observationComplete())->toBeTrue()
        ->and($summary->testValidatedAnswers)->toBe(1)
        ->and($summary->observationCountedItems)->toBe(2);
});
