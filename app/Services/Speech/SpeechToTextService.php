<?php

namespace App\Services\Speech;

use App\DTOs\TranscriptionResult;
use App\Services\Speech\Exceptions\SpeechToTextException;

interface SpeechToTextService
{
    /**
     * @throws SpeechToTextException
     */
    public function transcribe(string $audioPath): TranscriptionResult;
}
