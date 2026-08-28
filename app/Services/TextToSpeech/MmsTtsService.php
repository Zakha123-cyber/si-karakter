<?php

namespace App\Services\TextToSpeech;

use App\DTOs\TtsResult;
use App\Services\TextToSpeech\Exceptions\TextToSpeechException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class MmsTtsService implements TextToSpeechService
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $model,
        private readonly int $timeout,
    ) {}

    public function synthesize(string $text): TtsResult
    {
        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->baseUrl}/synthesize", [
                    'text' => $text,
                ]);

            $response->throw();
        } catch (ConnectionException $exception) {
            throw new TextToSpeechException('Text-to-speech provider connection failed: '.$exception->getMessage(), previous: $exception);
        } catch (RequestException $exception) {
            throw new TextToSpeechException('Text-to-speech provider returned an error: '.$exception->getMessage(), previous: $exception);
        }

        $audio = $response->body();

        if ($audio === '') {
            throw new TextToSpeechException('Text-to-speech provider returned an empty audio response.');
        }

        $samplingRate = (int) ($response->header('X-Sampling-Rate') ?: 16000);

        return new TtsResult(
            audio: $audio,
            provider: 'mms',
            model: $this->model,
            samplingRate: $samplingRate,
        );
    }
}
