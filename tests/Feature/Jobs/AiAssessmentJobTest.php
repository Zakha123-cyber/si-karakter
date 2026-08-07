<?php

use App\Enums\AssessmentStatus;
use App\Jobs\AiAssessmentJob;
use App\Models\AiAssessment;
use App\Models\TestAnswer;
use App\Models\Transcription;
use App\Services\AI\Exceptions\AiAssessmentException;
use App\Services\AI\FakeMoralAssessmentService;
use App\Services\AI\MoralAssessmentService;

test('job stores completed assessment on success', function () {
    $answer = TestAnswer::factory()->create([
        'typed_reason' => 'Karena itu perbuatan jujur.',
    ]);

    $fake = new FakeMoralAssessmentService;
    $this->app->instance(MoralAssessmentService::class, $fake);

    (new AiAssessmentJob($answer->id))->handle($fake);

    $assessment = AiAssessment::query()->where('test_answer_id', $answer->id)->first();

    expect($assessment)->not->toBeNull()
        ->and($assessment->status)->toBe(AssessmentStatus::Completed)
        ->and($assessment->moral_level)->toBe('conventional')
        ->and($assessment->provider)->toBe('fake')
        ->and($assessment->processed_at)->not->toBeNull();
});

test('job marks assessment as failed and rethrows on provider error', function () {
    $answer = TestAnswer::factory()->create();

    $fake = (new FakeMoralAssessmentService)->failNext('API rate limit exceeded');
    $this->app->instance(MoralAssessmentService::class, $fake);

    $job = new AiAssessmentJob($answer->id);

    expect(fn () => $job->handle($fake))->toThrow(AiAssessmentException::class, 'API rate limit exceeded');

    $assessment = AiAssessment::query()->where('test_answer_id', $answer->id)->first();

    expect($assessment->status)->toBe(AssessmentStatus::Failed)
        ->and($assessment->error_message)->toBe('API rate limit exceeded');
});

test('job does nothing when test answer no longer exists', function () {
    $job = new AiAssessmentJob(999999);
    $fake = new FakeMoralAssessmentService;

    $job->handle($fake);

    expect(AiAssessment::query()->count())->toBe(0);
});

test('failed hook marks assessment as failed after retries exhausted', function () {
    $answer = TestAnswer::factory()->create();
    AiAssessment::factory()->for($answer, 'testAnswer')->create([
        'status' => AssessmentStatus::Processing->value,
    ]);

    $job = new AiAssessmentJob($answer->id);
    $job->failed(new AiAssessmentException('All retries exhausted'));

    $assessment = AiAssessment::query()->where('test_answer_id', $answer->id)->first();

    expect($assessment->status)->toBe(AssessmentStatus::Failed)
        ->and($assessment->error_message)->toBe('All retries exhausted');
});

test('job uses transcript when typed reason is null', function () {
    $answer = TestAnswer::factory()->create([
        'typed_reason' => null,
    ]);
    Transcription::factory()->for($answer, 'testAnswer')->create([
        'status' => 'completed',
        'original_text' => 'Karena itu milik orang lain.',
    ]);

    $fake = new FakeMoralAssessmentService;
    $this->app->instance(MoralAssessmentService::class, $fake);

    (new AiAssessmentJob($answer->id))->handle($fake);

    $assessment = AiAssessment::query()->where('test_answer_id', $answer->id)->first();

    expect($assessment)->not->toBeNull()
        ->and($assessment->status)->toBe(AssessmentStatus::Completed);
});

test('job stores prompt version from result', function () {
    $answer = TestAnswer::factory()->create([
        'typed_reason' => 'Alasan test.',
    ]);

    $fake = new FakeMoralAssessmentService;
    $this->app->instance(MoralAssessmentService::class, $fake);

    (new AiAssessmentJob($answer->id))->handle($fake);

    $assessment = AiAssessment::query()->where('test_answer_id', $answer->id)->first();

    expect($assessment->prompt_version)->toBe('moral-classifier-v1');
});
