<?php

namespace App\Services\TextToSpeech;

use App\DTOs\TtsResult;
use App\Services\TextToSpeech\Exceptions\TextToSpeechException;

interface TextToSpeechService
{
    /**
     * Mensintesis teks menjadi audio WAV.
     *
     * @throws TextToSpeechException
     */
    public function synthesize(string $text): TtsResult;
}
