<?php

use App\Domain\Scoring\CombinedScoreCalculator;
use App\Models\ScoringConfiguration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('combined score uses default 60/40 when no configuration exists', function () {
    $result = app(CombinedScoreCalculator::class)->calculate(80, 60);

    expect($result->score)->toBe(72.0)
        ->and($result->testWeight)->toBe(60.0)
        ->and($result->observationWeight)->toBe(40.0)
        ->and($result->complete)->toBeTrue();
});

test('combined score uses active configuration weights', function () {
    ScoringConfiguration::factory()->active()->create([
        'test_weight' => 70,
        'observation_weight' => 30,
    ]);

    $result = app(CombinedScoreCalculator::class)->calculate(80, 60);

    expect($result->score)->toBe(74.0)
        ->and($result->testWeight)->toBe(70.0)
        ->and($result->observationWeight)->toBe(30.0);
});

test('combined score prefers explicitly passed configuration', function () {
    ScoringConfiguration::factory()->active()->create([
        'test_weight' => 70,
        'observation_weight' => 30,
    ]);
    $explicit = ScoringConfiguration::factory()->create([
        'test_weight' => 50,
        'observation_weight' => 50,
    ]);

    $result = app(CombinedScoreCalculator::class)->calculate(80, 60, $explicit);

    expect($result->score)->toBe(70.0);
});

test('combined score returns null when test score is null', function () {
    $result = app(CombinedScoreCalculator::class)->calculate(null, 60);

    expect($result->score)->toBeNull()
        ->and($result->complete)->toBeFalse();
});

test('combined score returns null when observation score is null', function () {
    $result = app(CombinedScoreCalculator::class)->calculate(80, null);

    expect($result->score)->toBeNull()
        ->and($result->complete)->toBeFalse();
});

test('combined score returns null when both scores are null', function () {
    $result = app(CombinedScoreCalculator::class)->calculate(null, null);

    expect($result->score)->toBeNull()
        ->and($result->complete)->toBeFalse();
});

test('combined score normalizes weights that do not sum to 100', function () {
    $result = app(CombinedScoreCalculator::class)->calculate(100, 0, ScoringConfiguration::factory()->create([
        'test_weight' => 50,
        'observation_weight' => 50,
    ]));

    expect($result->score)->toBe(50.0);
});

test('combined score rounds to two decimals', function () {
    $result = app(CombinedScoreCalculator::class)->calculate(66.67, 33.33);

    expect($result->score)->toBe(53.33);
});
