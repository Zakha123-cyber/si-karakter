<?php

use App\Models\ScoringConfiguration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('scoring configuration factory creates record with default weights', function () {
    $config = ScoringConfiguration::factory()->create();

    expect($config->test_weight)->toBe('60.00')
        ->and($config->observation_weight)->toBe('40.00')
        ->and($config->is_active)->toBeFalse()
        ->and($config->effective_from)->not->toBeNull();
});

test('scoring configuration factory active state', function () {
    $config = ScoringConfiguration::factory()->active()->create();

    expect($config->is_active)->toBeTrue();
});

test('scoring configuration casts weights as decimal', function () {
    $config = ScoringConfiguration::factory()->create([
        'test_weight' => 65.5,
        'observation_weight' => 35.5,
    ]);

    expect($config->test_weight)->toBe('65.50')
        ->and($config->observation_weight)->toBe('35.50');
});
