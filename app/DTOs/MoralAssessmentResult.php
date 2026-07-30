<?php

namespace App\DTOs;

readonly class MoralAssessmentResult
{
    /**
     * @param  array<int, array{code: string, score: float}>  $indicators
     * @param  string[]  $warningSignals
     * @param  array<string, mixed>  $rawResponse
     */
    public function __construct(
        public string $moralLevel,
        public ?float $confidence,
        public array $indicators,
        public string $reasoningSummary,
        public array $warningSignals,
        public ?string $suggestedIntervention,
        public string $provider,
        public string $model,
        public string $promptVersion,
        public array $rawResponse,
    ) {}
}
