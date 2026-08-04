<?php

use App\Domain\Scoring\CharacterScoreSnapshotService;
use App\Models\CharacterIndicator;
use App\Models\CharacterScoreSnapshot;
use App\Models\MoralCase;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function snapAttempt(Student $student, ?CarbonInterface $submittedAt = null): TestAttempt
{
    return TestAttempt::factory()->create([
        'student_id' => $student->id,
        'test_package_id' => TestPackage::factory(),
        'status' => 'submitted',
        'submitted_at' => $submittedAt ?? now(),
        'completed_at' => $submittedAt ?? now(),
    ]);
}

function snapAnswer(TestAttempt $attempt, string $level, User $teacher): void
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

function snapEntry(Student $student, User $teacher, CarbonInterface $observedAt, array $sentiments): void
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

test('snapshot is created with complete data and derived level', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $attempt = snapAttempt($student);
    snapAnswer($attempt, 'post_conventional', $teacher);
    snapEntry($student, $teacher, now(), ['positive', 'positive']);

    $snapshot = app(CharacterScoreSnapshotService::class)
        ->generateForStudent($student, now()->startOfMonth(), now()->endOfMonth());

    expect($snapshot)->not->toBeNull()
        ->and($snapshot->test_score)->toBe('100.00')
        ->and($snapshot->observation_score)->toBe('100.00')
        ->and($snapshot->calculated_score)->toBe('100.00')
        ->and($snapshot->final_score)->toBe('100.00')
        ->and($snapshot->final_level)->toBe('post_conventional')
        ->and($snapshot->manual_adjustment)->toBeNull();
});

test('snapshot is not created when test score is missing', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    snapEntry($student, $teacher, now(), ['positive']);

    $snapshot = app(CharacterScoreSnapshotService::class)
        ->generateForStudent($student, now()->startOfMonth(), now()->endOfMonth());

    expect($snapshot)->toBeNull();
});

test('snapshot is not created when observation score is missing', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $attempt = snapAttempt($student);
    snapAnswer($attempt, 'conventional', $teacher);

    $snapshot = app(CharacterScoreSnapshotService::class)
        ->generateForStudent($student, now()->startOfMonth(), now()->endOfMonth());

    expect($snapshot)->toBeNull();
});

test('existing snapshot without adjustment is updated', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $existing = CharacterScoreSnapshot::query()->create([
        'student_id' => $student->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end' => now()->endOfMonth()->toDateString(),
        'test_score' => 0,
        'observation_score' => 0,
        'calculated_score' => 0,
        'final_score' => 0,
        'final_level' => null,
        'calculation_detail_json' => [],
    ]);

    $attempt = snapAttempt($student);
    snapAnswer($attempt, 'conventional', $teacher);
    snapEntry($student, $teacher, now(), ['positive']);

    $snapshot = app(CharacterScoreSnapshotService::class)
        ->generateForStudent($student, now()->startOfMonth(), now()->endOfMonth());

    expect($snapshot->id)->toBe($existing->id)
        ->and($snapshot->calculated_score)->toBe('70.00')
        ->and(CharacterScoreSnapshot::count())->toBe(1);
});

test('existing snapshot that was adjusted is not overwritten', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $existing = CharacterScoreSnapshot::query()->create([
        'student_id' => $student->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end' => now()->endOfMonth()->toDateString(),
        'test_score' => 100,
        'observation_score' => 100,
        'calculated_score' => 100,
        'final_score' => 85,
        'final_level' => 'conventional',
        'manual_adjustment' => -15,
        'adjusted_by' => $teacher->id,
        'adjustment_reason' => 'Penyesuaian manual.',
        'calculation_detail_json' => [],
    ]);

    $attempt = snapAttempt($student);
    snapAnswer($attempt, 'post_conventional', $teacher);
    snapEntry($student, $teacher, now(), ['positive']);

    $snapshot = app(CharacterScoreSnapshotService::class)
        ->generateForStudent($student, now()->startOfMonth(), now()->endOfMonth());

    expect($snapshot->id)->toBe($existing->id)
        ->and($snapshot->final_score)->toBe('85.00')
        ->and($snapshot->manual_adjustment)->toBe('-15.00')
        ->and($snapshot->calculated_score)->toBe('100.00');
});

test('snapshot stores calculation details', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $attempt = snapAttempt($student);
    snapAnswer($attempt, 'conventional', $teacher);
    snapEntry($student, $teacher, now(), ['positive']);

    $snapshot = app(CharacterScoreSnapshotService::class)
        ->generateForStudent($student, now()->startOfMonth(), now()->endOfMonth());

    expect($snapshot->calculation_detail_json['weights']['test'])->toBe(60)
        ->and($snapshot->calculation_detail_json['weights']['observation'])->toBe(40)
        ->and($snapshot->calculation_detail_json['test'])->toHaveCount(1)
        ->and($snapshot->calculation_detail_json['observation'])->toHaveCount(1);
});
