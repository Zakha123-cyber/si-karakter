<?php

use App\Domain\EarlyWarning\StudentWarningGenerator;
use App\Domain\EarlyWarning\WarningRuleEngine;
use App\Models\CharacterIndicator;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\StudentWarning;
use App\Models\User;
use App\Models\WarningRule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function warningRuleForTest(array $conditions = []): WarningRule
{
    return WarningRule::factory()->create([
        'rule_type' => 'observation_negative_indicator',
        'conditions_json' => array_merge([
            'window_days' => 14,
            'minimum_negative_items' => 2,
            'require_warning_indicator' => true,
            'title_template' => ':student membutuhkan pendampingan karakter',
            'description_template' => ':student memiliki :count catatan observasi yang membutuhkan pendampingan dalam :days hari terakhir. Indikator yang perlu dikuatkan: :indicators.',
        ], $conditions),
        'severity' => 'medium',
        'is_active' => true,
    ]);
}

function warningObservation(Student $student, User $teacher, CharacterIndicator $indicator, string $date, string $sentiment = 'negative'): ObservationEntry
{
    $entry = ObservationEntry::query()->create([
        'student_id' => $student->id,
        'teacher_id' => $teacher->id,
        'observed_at' => $date,
        'general_note' => 'Catatan observasi pendampingan.',
    ]);

    ObservationItem::query()->create([
        'observation_entry_id' => $entry->id,
        'character_indicator_id' => $indicator->id,
        'sentiment' => $sentiment,
        'assessment_score' => null,
        'reward_points' => 0,
        'note' => 'Perlu penguatan indikator.',
    ]);

    return $entry;
}

test('warning rule engine detects repeated negative warning indicators', function () {
    $teacher = User::factory()->teacher()->create();
    $student = Student::factory()->create();
    $indicator = CharacterIndicator::factory()->warning()->create([
        'code' => 'dishonesty_warning',
        'name' => 'Kecenderungan Manipulatif',
    ]);
    $rule = warningRuleForTest(['indicator_codes' => ['dishonesty_warning']]);

    warningObservation($student, $teacher, $indicator, now()->subDay()->toDateString());
    $latestEntry = warningObservation($student, $teacher, $indicator, now()->toDateString());

    $detected = app(WarningRuleEngine::class)->evaluateForObservation($latestEntry);

    expect($detected)->toHaveCount(1)
        ->and($detected[0]->rule->id)->toBe($rule->id)
        ->and($detected[0]->student->id)->toBe($student->id)
        ->and($detected[0]->title)->toContain('membutuhkan pendampingan')
        ->and($detected[0]->description)->not->toContain('anak bermasalah');
});

test('warning rule engine ignores non warning indicators when required', function () {
    $teacher = User::factory()->teacher()->create();
    $student = Student::factory()->create();
    $indicator = CharacterIndicator::factory()->create(['is_warning_indicator' => false]);
    warningRuleForTest();

    warningObservation($student, $teacher, $indicator, now()->subDay()->toDateString());
    $latestEntry = warningObservation($student, $teacher, $indicator, now()->toDateString());

    $detected = app(WarningRuleEngine::class)->evaluateForObservation($latestEntry);

    expect($detected)->toBeEmpty();
});

test('warning generator creates one open warning and prevents duplicate open warnings', function () {
    $teacher = User::factory()->teacher()->create();
    $student = Student::factory()->create();
    $indicator = CharacterIndicator::factory()->warning()->create(['code' => 'dishonesty_warning']);
    warningRuleForTest(['indicator_codes' => ['dishonesty_warning']]);

    warningObservation($student, $teacher, $indicator, now()->subDay()->toDateString());
    $latestEntry = warningObservation($student, $teacher, $indicator, now()->toDateString());

    $generator = app(StudentWarningGenerator::class);

    expect($generator->generateForObservation($latestEntry))->toHaveCount(1)
        ->and($generator->generateForObservation($latestEntry))->toHaveCount(0)
        ->and(StudentWarning::query()->where('student_id', $student->id)->count())->toBe(1)
        ->and(StudentWarning::query()->first()?->title)->toContain('membutuhkan pendampingan');
});
