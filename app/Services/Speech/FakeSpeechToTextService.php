<?php

namespace App\Services\Speech;

use App\DTOs\TranscriptionResult;
use App\Services\Speech\Exceptions\SpeechToTextException;

class FakeSpeechToTextService implements SpeechToTextService
{
    private bool $shouldFail = false;

    private string $failureMessage = 'Fake speech-to-text failure';

    private string $text = 'Ini adalah transkripsi contoh dari rekaman santri.';

    public function failNext(string $message = 'Fake speech-to-text failure'): static
    {
        $this->shouldFail = true;
        $this->failureMessage = $message;

        return $this;
    }

    public function returning(string $text): static
    {
        $this->text = $text;

        return $this;
    }

    public function transcribe(string $audioPath): TranscriptionResult
    {
        if ($this->shouldFail) {
            throw new SpeechToTextException($this->failureMessage);
        }

        return new TranscriptionResult(
            text: $this->text,
            language: 'id',
            confidence: 0.95,
            segments: [],
            provider: 'fake',
            model: 'fake-model',
            rawResponse: ['text' => $this->text],
        );
    }
}
