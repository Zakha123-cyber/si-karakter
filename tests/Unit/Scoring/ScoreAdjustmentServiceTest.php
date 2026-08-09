<?php

use App\Domain\Scoring\ScoreAdjustmentService;
use App\Models\CharacterScoreSnapshot;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function makeSnapshot(array $overrides = []): CharacterScoreSnapshot
{
    return CharacterScoreSnapshot::query()->create(array_merge([
        'student_id' => Student::factory()->create()->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end' => now()->endOfMonth()->toDateString(),
        'test_score' => 80,
        'observation_score' => 60,
        'calculated_score' => 72,
        'manual_adjustment' => null,
        'final_score' => 72,
        'final_level' => null,
        'calculation_detail_json' => [],
    ], $overrides));
}

test('adjustment applies positive delta to calculated score', function () {
    $teacher = User::factory()->teacher()->create();
    $snapshot = makeSnapshot(['calculated_score' => 72]);

    $updated = app(ScoreAdjustmentService::class)->adjust($snapshot, 8, 'Menghargai perbaikan sikap.', $teacher);

    expect($updated->final_score)->toBe('80.00')
        ->and($updated->manual_adjustment)->toBe('8.00')
        ->and($updated->adjustment_reason)->toBe('Menghargai perbaikan sikap.')
        ->and($updated->adjusted_by)->toBe($teacher->id);
});

test('adjustment applies negative delta to calculated score', function () {
    $teacher = User::factory()->teacher()->create();
    $snapshot = makeSnapshot(['calculated_score' => 72]);

    $updated = app(ScoreAdjustmentService::class)->adjust($snapshot, -12, 'Catatan perilaku minggu lalu.', $teacher);

    expect($updated->final_score)->toBe('60.00')
        ->and($updated->manual_adjustment)->toBe('-12.00');
});

test('adjustment requires a non empty reason', function () {
    $teacher = User::factory()->teacher()->create();
    $snapshot = makeSnapshot();

    expect(fn () => app(ScoreAdjustmentService::class)->adjust($snapshot, 5, '', $teacher))
        ->toThrow(InvalidArgumentException::class);
});

test('adjustment requires a non whitespace reason', function () {
    $teacher = User::factory()->teacher()->create();
    $snapshot = makeSnapshot();

    expect(fn () => app(ScoreAdjustmentService::class)->adjust($snapshot, 5, '   ', $teacher))
        ->toThrow(InvalidArgumentException::class);
});

test('adjustment derives final level from final score', function () {
    $teacher = User::factory()->teacher()->create();
    $snapshot = makeSnapshot(['calculated_score' => 60]);

    $updated = app(ScoreAdjustmentService::class)->adjust($snapshot, 30, 'Konsisten di kelas.', $teacher);

    expect($updated->final_score)->toBe('90.00')
        ->and($updated->final_level)->toBe('post_conventional');
});

test('adjustment respects override level', function () {
    $teacher = User::factory()->teacher()->create();
    $snapshot = makeSnapshot(['calculated_score' => 60]);

    $updated = app(ScoreAdjustmentService::class)->adjust($snapshot, 30, 'Konsisten di kelas.', $teacher, 'conventional');

    expect($updated->final_score)->toBe('90.00')
        ->and($updated->final_level)->toBe('conventional');
});

test('adjustment clamps final score to 100', function () {
    $teacher = User::factory()->teacher()->create();
    $snapshot = makeSnapshot(['calculated_score' => 95]);

    $updated = app(ScoreAdjustmentService::class)->adjust($snapshot, 20, 'Prestasi luar biasa.', $teacher);

    expect($updated->final_score)->toBe('100.00');
});

test('adjustment clamps final score to 0', function () {
    $teacher = User::factory()->teacher()->create();
    $snapshot = makeSnapshot(['calculated_score' => 10]);

    $updated = app(ScoreAdjustmentService::class)->adjust($snapshot, -50, 'Kasus khusus.', $teacher);

    expect($updated->final_score)->toBe('0.00');
});

test('adjustment rounds final score to two decimals', function () {
    $teacher = User::factory()->teacher()->create();
    $snapshot = makeSnapshot(['calculated_score' => 66.67]);

    $updated = app(ScoreAdjustmentService::class)->adjust($snapshot, 0.33, 'Pembulatan manual.', $teacher);

    expect($updated->final_score)->toBe('67.00');
});
