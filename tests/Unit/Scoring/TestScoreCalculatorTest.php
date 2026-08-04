<?php

use App\Domain\Scoring\TestScoreCalculator;
use App\Models\MoralCase;
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

function makeSubmittedAttempt(Student $student, ?CarbonInterface $submittedAt = null): TestAttempt
{
    $attempt = TestAttempt::factory()->create([
        'student_id' => $student->id,
        'test_package_id' => TestPackage::factory(),
        'status' => 'submitted',
        'submitted_at' => $submittedAt ?? now(),
        'completed_at' => $submittedAt ?? now(),
    ]);

    return $attempt;
}

function validateAnswer(TestAnswer $answer, string $level, User $teacher, ?CarbonInterface $at = null): TeacherValidation
{
    return TeacherValidation::query()->create([
        'test_answer_id' => $answer->id,
        'teacher_id' => $teacher->id,
        'decision' => 'approved',
        'final_moral_level' => $level,
        'final_indicators_json' => [],
        'validated_at' => $at ?? now(),
    ]);
}

function addAnswer(TestAttempt $attempt): TestAnswer
{
    return TestAnswer::factory()->create([
        'test_attempt_id' => $attempt->id,
        'moral_case_id' => MoralCase::factory(),
    ]);
}

test('attempt without validated answers returns null score', function () {
    $student = Student::factory()->create();
    $attempt = makeSubmittedAttempt($student);
    addAnswer($attempt);

    $result = app(TestScoreCalculator::class)->calculateAttempt($attempt);

    expect($result->score)->toBeNull()
        ->and($result->validatedAnswers)->toBe(0)
        ->and($result->totalAnswers)->toBe(1);
});

test('attempt score is average of validated answer levels', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $attempt = makeSubmittedAttempt($student);

    validateAnswer(addAnswer($attempt), 'pre_conventional', $teacher);
    validateAnswer(addAnswer($attempt), 'conventional', $teacher);
    validateAnswer(addAnswer($attempt), 'post_conventional', $teacher);

    $result = app(TestScoreCalculator::class)->calculateAttempt($attempt);

    expect($result->score)->toBe(50.0)
        ->and($result->validatedAnswers)->toBe(3)
        ->and($result->totalAnswers)->toBe(3);
});

test('attempt score ignores unvalidated answers', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $attempt = makeSubmittedAttempt($student);

    addAnswer($attempt);
    addAnswer($attempt);
    validateAnswer(addAnswer($attempt), 'post_conventional', $teacher);

    $result = app(TestScoreCalculator::class)->calculateAttempt($attempt);

    expect($result->score)->toBe(100.0)
        ->and($result->validatedAnswers)->toBe(1)
        ->and($result->totalAnswers)->toBe(3);
});

test('attempt score ignores unknown moral levels', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $attempt = makeSubmittedAttempt($student);

    validateAnswer(addAnswer($attempt), 'unknown_level', $teacher);
    validateAnswer(addAnswer($attempt), 'conventional', $teacher);

    $result = app(TestScoreCalculator::class)->calculateAttempt($attempt);

    expect($result->score)->toBe(50.0)
        ->and($result->validatedAnswers)->toBe(1);
});

test('score uses the latest teacher validation', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $attempt = makeSubmittedAttempt($student);
    $answer = addAnswer($attempt);

    validateAnswer($answer, 'pre_conventional', $teacher, now()->subDay());
    validateAnswer($answer, 'post_conventional', $teacher, now());

    $result = app(TestScoreCalculator::class)->calculateAttempt($attempt);

    expect($result->score)->toBe(100.0);
});

test('period calculation aggregates all submitted attempts in range', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $attemptA = makeSubmittedAttempt($student, now()->subDay());
    $attemptB = makeSubmittedAttempt($student, now());

    validateAnswer(addAnswer($attemptA), 'pre_conventional', $teacher);
    validateAnswer(addAnswer($attemptB), 'post_conventional', $teacher);

    $result = app(TestScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBe(50.0)
        ->and($result->validatedAnswers)->toBe(2)
        ->and($result->totalAnswers)->toBe(2);
});

test('period calculation excludes attempts outside the period', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $outside = makeSubmittedAttempt($student, now()->subMonths(2));
    $inside = makeSubmittedAttempt($student, now());

    validateAnswer(addAnswer($outside), 'pre_conventional', $teacher);
    validateAnswer(addAnswer($inside), 'post_conventional', $teacher);

    $result = app(TestScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBe(100.0)
        ->and($result->validatedAnswers)->toBe(1);
});

test('period calculation ignores non submitted attempts', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $draft = TestAttempt::factory()->create([
        'student_id' => $student->id,
        'status' => 'in_progress',
        'started_at' => now(),
    ]);

    validateAnswer(addAnswer($draft), 'post_conventional', $teacher);

    $result = app(TestScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBeNull()
        ->and($result->validatedAnswers)->toBe(0);
});

test('period calculation returns null when no validated answers', function () {
    $student = Student::factory()->create();
    makeSubmittedAttempt($student);

    $result = app(TestScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBeNull()
        ->and($result->validatedAnswers)->toBe(0);
});

test('score rounds to two decimals', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $attempt = makeSubmittedAttempt($student);

    validateAnswer(addAnswer($attempt), 'conventional', $teacher);
    validateAnswer(addAnswer($attempt), 'conventional', $teacher);
    validateAnswer(addAnswer($attempt), 'post_conventional', $teacher);

    $result = app(TestScoreCalculator::class)->calculateAttempt($attempt);

    expect($result->score)->toBe(66.67);
});
