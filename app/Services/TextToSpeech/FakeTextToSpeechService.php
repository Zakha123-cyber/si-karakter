<?php

namespace App\Services\TextToSpeech;

use App\DTOs\TtsResult;
use App\Services\TextToSpeech\Exceptions\TextToSpeechException;

class FakeTextToSpeechService implements TextToSpeechService
{
    private bool $shouldFail = false;

    private string $failureMessage = 'Fake text-to-speech failure';

    private string $audio = 'fake-wav-audio-bytes';

    public int $synthesizeCount = 0;

    public function failNext(string $message = 'Fake text-to-speech failure'): static
    {
        $this->shouldFail = true;
        $this->failureMessage = $message;

        return $this;
    }

    public function returning(string $audio): static
    {
        $this->audio = $audio;

        return $this;
    }

    public function synthesize(string $text): TtsResult
    {
        $this->synthesizeCount++;

        if ($this->shouldFail) {
            throw new TextToSpeechException($this->failureMessage);
        }

        return new TtsResult(
            audio: $this->audio,
            provider: 'fake',
            model: 'fake-model',
            samplingRate: 16000,
        );
    }
}
