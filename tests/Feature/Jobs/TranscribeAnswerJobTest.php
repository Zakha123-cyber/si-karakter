<?php

use App\Enums\TranscriptionStatus;
use App\Jobs\TranscribeAnswerJob;
use App\Models\AnswerAudioFile;
use App\Models\TestAnswer;
use App\Models\Transcription;
use App\Services\Speech\Exceptions\SpeechToTextException;
use App\Services\Speech\FakeSpeechToTextService;
use App\Services\Speech\SpeechToTextService;

test('job stores completed transcription on success', function () {
    $answer = TestAnswer::factory()->create();
    $audioFile = AnswerAudioFile::factory()->for($answer, 'testAnswer')->create();

    $fake = (new FakeSpeechToTextService)->returning('Karena itu perbuatan jujur.');
    $this->app->instance(SpeechToTextService::class, $fake);

    (new TranscribeAnswerJob($audioFile->id))->handle($fake);

    $transcription = Transcription::query()->where('test_answer_id', $answer->id)->first();

    expect($transcription)->not->toBeNull()
        ->and($transcription->status)->toBe(TranscriptionStatus::Completed->value)
        ->and($transcription->original_text)->toBe('Karena itu perbuatan jujur.')
        ->and($transcription->provider)->toBe('fake')
        ->and($transcription->processed_at)->not->toBeNull();
});

test('job marks transcription as failed and rethrows on provider error', function () {
    $answer = TestAnswer::factory()->create();
    $audioFile = AnswerAudioFile::factory()->for($answer, 'testAnswer')->create();

    $fake = (new FakeSpeechToTextService)->failNext('Rate limit exceeded');

    $job = new TranscribeAnswerJob($audioFile->id);

    expect(fn () => $job->handle($fake))->toThrow(SpeechToTextException::class, 'Rate limit exceeded');

    $transcription = Transcription::query()->where('test_answer_id', $answer->id)->first();

    expect($transcription->status)->toBe(TranscriptionStatus::Failed->value)
        ->and($transcription->error_message)->toBe('Rate limit exceeded');
});

test('job does nothing when audio file no longer exists', function () {
    $job = new TranscribeAnswerJob(999999);
    $fake = new FakeSpeechToTextService;

    $job->handle($fake);

    expect(Transcription::query()->count())->toBe(0);
});

test('failed hook marks transcription as failed after retries are exhausted', function () {
    $answer = TestAnswer::factory()->create();
    $audioFile = AnswerAudioFile::factory()->for($answer, 'testAnswer')->create();
    Transcription::factory()->for($answer, 'testAnswer')->create([
        'status' => TranscriptionStatus::Processing->value,
    ]);

    $job = new TranscribeAnswerJob($audioFile->id);
    $job->failed(new SpeechToTextException('All retries exhausted'));

    $transcription = Transcription::query()->where('test_answer_id', $answer->id)->first();

    expect($transcription->status)->toBe(TranscriptionStatus::Failed->value)
        ->and($transcription->error_message)->toBe('All retries exhausted');
});
