<?php

namespace App\DTOs;

readonly class TtsResult
{
    public function __construct(
        public string $audio,
        public string $provider,
        public string $model,
        public ?int $samplingRate = null,
    ) {}
}
