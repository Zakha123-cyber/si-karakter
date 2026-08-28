<?php

namespace App\DTOs;

readonly class ReportNarrativeResult
{
    /**
     * @param  array<string, mixed>  $rawResponse
     */
    public function __construct(
        public string $narrative,
        public string $recommendation,
        public string $provider,
        public string $model,
        public string $promptVersion,
        public array $rawResponse,
    ) {}
}
