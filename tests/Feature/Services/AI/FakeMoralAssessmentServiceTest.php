<?php

use App\DTOs\MoralAssessmentInput;
use App\Services\AI\Exceptions\AiAssessmentException;
use App\Services\AI\FakeMoralAssessmentService;

test('fake service returns a default assessment result', function () {
    $service = new FakeMoralAssessmentService;

    $input = new MoralAssessmentInput(
        case: ['title' => 'Test', 'story' => 'Story', 'selected_option' => 'Option A'],
        studentAnswer: ['typed_reason' => null, 'transcript' => 'Alasan santri.'],
        rubric: ['levels' => ['pre_conventional', 'conventional', 'post_conventional']],
        allowedIndicators: ['honesty'],
    );

    $result = $service->assess($input);

    expect($result->moralLevel)->toBe('conventional')
        ->and($result->provider)->toBe('fake')
        ->and($result->confidence)->toBe(0.85);
});

test('fake service can be configured to return a different moral level', function () {
    $service = (new FakeMoralAssessmentService)->returning('post_conventional');

    $input = new MoralAssessmentInput(
        case: ['title' => 'Test', 'story' => 'Story', 'selected_option' => 'Option A'],
        studentAnswer: ['typed_reason' => null, 'transcript' => 'Alasan santri.'],
        rubric: ['levels' => ['pre_conventional', 'conventional', 'post_conventional']],
        allowedIndicators: ['honesty'],
    );

    $result = $service->assess($input);

    expect($result->moralLevel)->toBe('post_conventional');
});

test('fake service can be configured to fail', function () {
    $service = (new FakeMoralAssessmentService)->failNext('API rate limit exceeded');

    $input = new MoralAssessmentInput(
        case: ['title' => 'Test', 'story' => 'Story', 'selected_option' => 'Option A'],
        studentAnswer: ['typed_reason' => null, 'transcript' => 'Alasan santri.'],
        rubric: ['levels' => ['pre_conventional', 'conventional', 'post_conventional']],
        allowedIndicators: ['honesty'],
    );

    expect(fn () => $service->assess($input))
        ->toThrow(AiAssessmentException::class, 'API rate limit exceeded');
});

test('fake service reads input data', function () {
    $service = new FakeMoralAssessmentService;

    $input = new MoralAssessmentInput(
        case: ['title' => 'Kasus Kejujuran', 'story' => 'Cerita lengkap', 'selected_option' => 'Mengembalikan'],
        studentAnswer: ['typed_reason' => 'Karena itu benar.', 'transcript' => null],
        rubric: ['levels' => ['pre_conventional', 'conventional', 'post_conventional']],
        allowedIndicators: ['honesty', 'responsibility'],
    );

    $result = $service->assess($input);

    expect($result->indicators)->toHaveCount(2)
        ->and($result->reasoningSummary)->not->toBeEmpty();
});
