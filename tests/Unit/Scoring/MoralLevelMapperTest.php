<?php

use App\Domain\Scoring\MoralLevelMapper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('score 0 maps to pre conventional', function () {
    expect(app(MoralLevelMapper::class)->levelForScore(0))->toBe('pre_conventional');
});

test('score 33 maps to pre conventional', function () {
    expect(app(MoralLevelMapper::class)->levelForScore(33))->toBe('pre_conventional');
});

test('score 34 maps to conventional', function () {
    expect(app(MoralLevelMapper::class)->levelForScore(34))->toBe('conventional');
});

test('score 66 maps to conventional', function () {
    expect(app(MoralLevelMapper::class)->levelForScore(66))->toBe('conventional');
});

test('score 67 maps to post conventional', function () {
    expect(app(MoralLevelMapper::class)->levelForScore(67))->toBe('post_conventional');
});

test('score 100 maps to post conventional', function () {
    expect(app(MoralLevelMapper::class)->levelForScore(100))->toBe('post_conventional');
});
