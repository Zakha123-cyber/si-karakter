<?php

use App\Domain\Scoring\ObservationScoreCalculator;
use App\Models\CharacterIndicator;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function makeEntryForScoreTest(Student $student, User $teacher): ObservationEntry
{
    return ObservationEntry::query()->create([
        'student_id' => $student->id,
        'teacher_id' => $teacher->id,
        'observed_at' => now()->toDateString(),
    ]);
}

function addItemForScoreTest(ObservationEntry $entry, array $overrides = []): ObservationItem
{
    return ObservationItem::query()->create(array_merge([
        'observation_entry_id' => $entry->id,
        'character_indicator_id' => CharacterIndicator::factory()->create()->id,
        'sentiment' => 'neutral',
        'assessment_score' => null,
        'reward_points' => 0,
    ], $overrides));
}

test('entry without items returns null score', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntryForScoreTest($student, $teacher);

    $result = app(ObservationScoreCalculator::class)->calculateForEntry($entry);

    expect($result->score)->toBeNull()
        ->and($result->countedItems)->toBe(0)
        ->and($result->totalItems)->toBe(0);
});

test('entry score is the average of assessment scores', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntryForScoreTest($student, $teacher);

    addItemForScoreTest($entry, ['assessment_score' => 80]);
    addItemForScoreTest($entry, ['assessment_score' => 60]);

    $result = app(ObservationScoreCalculator::class)->calculateForEntry($entry);

    expect($result->score)->toBe(70.0)
        ->and($result->countedItems)->toBe(2)
        ->and($result->totalItems)->toBe(2);
});

test('entry score falls back to sentiment when assessment score is null', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntryForScoreTest($student, $teacher);

    addItemForScoreTest($entry, ['sentiment' => 'positive', 'assessment_score' => null]);
    addItemForScoreTest($entry, ['sentiment' => 'neutral', 'assessment_score' => null]);

    $result = app(ObservationScoreCalculator::class)->calculateForEntry($entry);

    expect($result->score)->toBe(75.0);
});

test('entry score ignores items with unknown sentiment and no score', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntryForScoreTest($student, $teacher);

    addItemForScoreTest($entry, ['sentiment' => 'unknown_sentiment', 'assessment_score' => null]);

    $result = app(ObservationScoreCalculator::class)->calculateForEntry($entry);

    expect($result->score)->toBeNull()
        ->and($result->countedItems)->toBe(0)
        ->and($result->totalItems)->toBe(1);
});

test('soft deleted items are excluded from entry score', function () {
    $student = Student::factory()->create();
    $teacher = User::factory()->teacher()->create();
    $entry = makeEntryForScoreTest($student, $teacher);

    addItemForScoreTest($entry, ['assessment_score' => 90]);
    $trashed = addItemForScoreTest($entry, ['assessment_score' => 10]);
    $trashed->delete();

    $result = app(ObservationScoreCalculator::class)->calculateForEntry($entry);

    expect($result->score)->toBe(90.0)
        ->and($result->totalItems)->toBe(1);
});
