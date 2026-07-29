<?php

use App\Services\Speech\Exceptions\SpeechToTextException;
use App\Services\Speech\FakeSpeechToTextService;

test('fake service returns a transcription result by default', function () {
    $service = new FakeSpeechToTextService;

    $result = $service->transcribe('student-answers/audio/example.mp3');

    expect($result->text)->not->toBeEmpty()
        ->and($result->provider)->toBe('fake')
        ->and($result->language)->toBe('id');
});

test('fake service can be configured to return custom text', function () {
    $service = (new FakeSpeechToTextService)->returning('Saya memilih jujur karena itu benar.');

    $result = $service->transcribe('student-answers/audio/example.mp3');

    expect($result->text)->toBe('Saya memilih jujur karena itu benar.');
});

test('fake service can be configured to fail', function () {
    $service = (new FakeSpeechToTextService)->failNext('Provider timeout');

    expect(fn () => $service->transcribe('student-answers/audio/example.mp3'))
        ->toThrow(SpeechToTextException::class, 'Provider timeout');
});
