<?php

use App\Domain\Scoring\ObservationScoreCalculator;
use App\Models\CharacterIndicator;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function makeEntry(Student $student, User $teacher, CarbonInterface $observedAt): ObservationEntry
{
    return ObservationEntry::query()->create([
        'student_id' => $student->id,
        'teacher_id' => $teacher->id,
        'observed_at' => $observedAt->toDateString(),
    ]);
}

function addItem(ObservationEntry $entry, array $overrides = []): ObservationItem
{
    return ObservationItem::query()->create(array_merge([
        'observation_entry_id' => $entry->id,
        'character_indicator_id' => CharacterIndicator::factory()->create()->id,
        'sentiment' => 'neutral',
        'assessment_score' => null,
        'reward_points' => 0,
    ], $overrides));
}

test('observation period without items returns null score', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    makeEntry($student, $teacher, now());

    $result = app(ObservationScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBeNull()
        ->and($result->countedItems)->toBe(0)
        ->and($result->totalItems)->toBe(0);
});

test('observation score uses assessment score when filled', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntry($student, $teacher, now());

    addItem($entry, ['sentiment' => 'negative', 'assessment_score' => 80]);
    addItem($entry, ['sentiment' => 'positive', 'assessment_score' => 60]);

    $result = app(ObservationScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBe(70.0)
        ->and($result->countedItems)->toBe(2);
});

test('observation score falls back to sentiment when assessment score empty', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntry($student, $teacher, now());

    addItem($entry, ['sentiment' => 'positive']);
    addItem($entry, ['sentiment' => 'neutral']);
    addItem($entry, ['sentiment' => 'negative']);

    $result = app(ObservationScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBe(50.0)
        ->and($result->countedItems)->toBe(3)
        ->and($result->totalItems)->toBe(3);
});

test('observation score mixes assessment score and sentiment', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntry($student, $teacher, now());

    addItem($entry, ['sentiment' => 'negative', 'assessment_score' => 100]);
    addItem($entry, ['sentiment' => 'negative']);
    addItem($entry, ['sentiment' => 'neutral', 'assessment_score' => 40]);

    $result = app(ObservationScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBe(46.67)
        ->and($result->countedItems)->toBe(3);
});

test('observation score ignores unknown sentiment without assessment score', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntry($student, $teacher, now());

    addItem($entry, ['sentiment' => 'unknown_sentiment']);
    addItem($entry, ['sentiment' => 'positive']);

    $result = app(ObservationScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBe(100.0)
        ->and($result->countedItems)->toBe(1)
        ->and($result->totalItems)->toBe(2);
});

test('observation score only counts entries inside the period', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $inside = makeEntry($student, $teacher, now());
    $outside = makeEntry($student, $teacher, now()->subMonths(2));

    addItem($inside, ['sentiment' => 'positive']);
    addItem($outside, ['sentiment' => 'negative']);

    $result = app(ObservationScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->score)->toBe(100.0)
        ->and($result->countedItems)->toBe(1)
        ->and($result->totalItems)->toBe(1);
});

test('observation details include source of score', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntry($student, $teacher, now());

    addItem($entry, ['sentiment' => 'positive', 'assessment_score' => 90]);
    addItem($entry, ['sentiment' => 'negative']);

    $result = app(ObservationScoreCalculator::class)
        ->calculateForPeriod($student, now()->startOfMonth(), now()->endOfMonth());

    expect($result->details)->toHaveCount(2)
        ->and($result->details[0]['source'])->toBe('assessment_score')
        ->and($result->details[1]['source'])->toBe('sentiment')
        ->and($result->details[1]['score'])->toBe(0.0);
});
