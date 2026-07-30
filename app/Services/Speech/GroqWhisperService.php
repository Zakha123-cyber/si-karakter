<?php

namespace App\Services\Speech;

use App\DTOs\TranscriptionResult;
use App\Services\Speech\Exceptions\SpeechToTextException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class GroqWhisperService implements SpeechToTextService
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
        private readonly string $baseUrl,
        private readonly ?string $language,
        private readonly int $timeout,
    ) {}

    public function transcribe(string $audioPath): TranscriptionResult
    {
        if (! Storage::disk('local')->exists($audioPath)) {
            throw new SpeechToTextException("Audio file not found at path: {$audioPath}");
        }

        $fileContents = Storage::disk('local')->get($audioPath);
        $filename = basename($audioPath);

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout($this->timeout)
                ->attach('file', $fileContents, $filename)
                ->asMultipart()
                ->post("{$this->baseUrl}/audio/transcriptions", array_filter([
                    'model' => $this->model,
                    'language' => $this->language,
                    'response_format' => 'verbose_json',
                ]));

            $response->throw();
        } catch (ConnectionException $exception) {
            throw new SpeechToTextException('Speech-to-text provider connection failed: '.$exception->getMessage(), previous: $exception);
        } catch (RequestException $exception) {
            throw new SpeechToTextException('Speech-to-text provider returned an error: '.$exception->getMessage(), previous: $exception);
        }

        $payload = $response->json();

        if (! is_array($payload) || ! isset($payload['text'])) {
            throw new SpeechToTextException('Speech-to-text provider returned an unexpected response shape.');
        }

        return new TranscriptionResult(
            text: (string) $payload['text'],
            language: $payload['language'] ?? $this->language,
            confidence: null,
            segments: $payload['segments'] ?? [],
            provider: 'groq',
            model: $this->model,
            rawResponse: $payload,
        );
    }
}
