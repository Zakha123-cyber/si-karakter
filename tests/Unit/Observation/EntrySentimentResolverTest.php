<?php

use App\Domain\Observation\EntrySentimentResolver;

test('resolver returns neutral when no items and no score', function () {
    expect(app(EntrySentimentResolver::class)->resolve([]))->toBe('neutral');
});

test('resolver uses score threshold when no items', function () {
    $resolver = app(EntrySentimentResolver::class);

    expect($resolver->resolve([], 90))->toBe('positive')
        ->and($resolver->resolve([], 70))->toBe('neutral')
        ->and($resolver->resolve([], 50))->toBe('negative');
});

test('resolver picks the most common sentiment', function () {
    $resolver = app(EntrySentimentResolver::class);

    expect($resolver->resolve(['positive', 'positive', 'neutral']))->toBe('positive')
        ->and($resolver->resolve(['negative', 'negative', 'neutral']))->toBe('negative');
});

test('resolver breaks tie using score threshold', function () {
    $resolver = app(EntrySentimentResolver::class);

    expect($resolver->resolve(['positive', 'negative'], 90))->toBe('positive')
        ->and($resolver->resolve(['positive', 'negative'], 70))->toBe('neutral')
        ->and($resolver->resolve(['positive', 'negative'], 40))->toBe('negative');
});

test('fromScore maps thresholds to sentiment', function () {
    $resolver = app(EntrySentimentResolver::class);

    expect($resolver->fromScore(100))->toBe('positive')
        ->and($resolver->fromScore(85))->toBe('positive')
        ->and($resolver->fromScore(84.99))->toBe('neutral')
        ->and($resolver->fromScore(60))->toBe('neutral')
        ->and($resolver->fromScore(59.99))->toBe('negative')
        ->and($resolver->fromScore(null))->toBe('neutral');
});
