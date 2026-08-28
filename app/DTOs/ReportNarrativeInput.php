<?php

namespace App\DTOs;

readonly class ReportNarrativeInput
{
    /**
     * @param  array<string, mixed>  $testSummary
     * @param  array<string, mixed>  $observationSummary
     * @param  array<string, mixed>  $combined
     */
    public function __construct(
        public string $studentName,
        public string $periodStart,
        public string $periodEnd,
        public array $testSummary,
        public array $observationSummary,
        public array $combined,
    ) {}
}
