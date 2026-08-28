<?php

namespace App\Providers;

use App\Services\TextToSpeech\MmsTtsService;
use App\Services\TextToSpeech\TextToSpeechService;
use Illuminate\Support\ServiceProvider;

class TtsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(TextToSpeechService::class, function () {
            $provider = config('tts.provider', 'mms');

            return match ($provider) {
                'mms' => new MmsTtsService(
                    baseUrl: rtrim((string) config('tts.mms.base_url', 'http://127.0.0.1:8001'), '/'),
                    model: (string) config('tts.mms.model', 'facebook/mms-tts-ind'),
                    timeout: (int) config('tts.mms.timeout', 60),
                ),
                default => throw new \InvalidArgumentException("Unsupported TTS provider: [{$provider}]."),
            };
        });
    }
}
