<?php

use App\Services\Speech\Exceptions\SpeechToTextException;
use App\Services\Speech\GroqWhisperService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

function makeGroqService(): GroqWhisperService
{
    return new GroqWhisperService(
        apiKey: 'test-key',
        model: 'whisper-large-v3-turbo',
        baseUrl: 'https://api.groq.com/openai/v1',
        language: 'id',
        timeout: 30,
    );
}

test('groq service transcribes audio successfully', function () {
    Storage::fake('local');
    Storage::disk('local')->put('student-answers/audio/example.mp3', 'fake-audio-bytes');

    Http::fake([
        'api.groq.com/*' => Http::response([
            'text' => 'Saya memilih mengembalikan uang itu.',
            'language' => 'id',
            'segments' => [],
        ], 200),
    ]);

    $result = makeGroqService()->transcribe('student-answers/audio/example.mp3');

    expect($result->text)->toBe('Saya memilih mengembalikan uang itu.')
        ->and($result->language)->toBe('id')
        ->and($result->provider)->toBe('groq')
        ->and($result->model)->toBe('whisper-large-v3-turbo');

    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), '/audio/transcriptions')
            && $request->hasHeader('Authorization', 'Bearer test-key');
    });
});

test('groq service throws when audio file is missing', function () {
    Storage::fake('local');

    expect(fn () => makeGroqService()->transcribe('student-answers/audio/missing.mp3'))
        ->toThrow(SpeechToTextException::class);
});

test('groq service throws on provider error response', function () {
    Storage::fake('local');
    Storage::disk('local')->put('student-answers/audio/example.mp3', 'fake-audio-bytes');

    Http::fake([
        'api.groq.com/*' => Http::response(['error' => 'rate limit exceeded'], 429),
    ]);

    expect(fn () => makeGroqService()->transcribe('student-answers/audio/example.mp3'))
        ->toThrow(SpeechToTextException::class);
});

test('groq service throws on unexpected response shape', function () {
    Storage::fake('local');
    Storage::disk('local')->put('student-answers/audio/example.mp3', 'fake-audio-bytes');

    Http::fake([
        'api.groq.com/*' => Http::response(['unexpected' => true], 200),
    ]);

    expect(fn () => makeGroqService()->transcribe('student-answers/audio/example.mp3'))
        ->toThrow(SpeechToTextException::class);
});
