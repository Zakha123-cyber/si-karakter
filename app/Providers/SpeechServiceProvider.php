<?php

namespace App\Providers;

use App\Services\Speech\GroqWhisperService;
use App\Services\Speech\SpeechToTextService;
use Illuminate\Support\ServiceProvider;

class SpeechServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SpeechToTextService::class, function () {
            $provider = config('speech.provider', 'groq');

            return match ($provider) {
                'groq' => new GroqWhisperService(
                    apiKey: config('speech.groq.api_key', ''),
                    model: config('speech.groq.model', 'whisper-large-v3-turbo'),
                    baseUrl: config('speech.groq.base_url', 'https://api.groq.com/openai/v1'),
                    language: config('speech.groq.language', 'id'),
                    timeout: (int) config('speech.timeout', 120),
                ),
                default => throw new \InvalidArgumentException("Unsupported STT provider: [{$provider}]"),
            };
        });
    }
}
