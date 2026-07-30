<?php

namespace App\DTOs;

readonly class TranscriptionResult
{
    /**
     * @param  array<int, mixed>  $segments
     * @param  array<string, mixed>  $rawResponse
     */
    public function __construct(
        public string $text,
        public ?string $language,
        public ?float $confidence,
        public array $segments,
        public string $provider,
        public string $model,
        public array $rawResponse,
    ) {}
}
