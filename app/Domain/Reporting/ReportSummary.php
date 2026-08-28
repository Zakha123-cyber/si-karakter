<?php

namespace App\Domain\Reporting;

/**
 * Rekap skor tes dan observasi untuk satu laporan karakter.
 */
class ReportSummary
{
    /**
     * @param  array<int, array<string, mixed>>  $testDetails
     * @param  array<int, array<string, mixed>>  $observationDetails
     */
    public function __construct(
        public readonly ?float $testScore,
        public readonly int $testValidatedAnswers,
        public readonly int $testTotalAnswers,
        public readonly array $testDetails,
        public readonly ?float $observationScore,
        public readonly int $observationCountedItems,
        public readonly int $observationTotalItems,
        public readonly array $observationDetails,
    ) {}

    public function testComplete(): bool
    {
        return $this->testScore !== null;
    }

    public function observationComplete(): bool
    {
        return $this->observationScore !== null;
    }

    public function complete(): bool
    {
        return $this->testComplete() && $this->observationComplete();
    }

    /**
     * @return array<string, mixed>
     */
    public function toTestSummaryJson(): array
    {
        return [
            'score' => $this->testScore,
            'validated_answers' => $this->testValidatedAnswers,
            'total_answers' => $this->testTotalAnswers,
            'details' => $this->testDetails,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toObservationSummaryJson(): array
    {
        return [
            'score' => $this->observationScore,
            'counted_items' => $this->observationCountedItems,
            'total_items' => $this->observationTotalItems,
            'details' => $this->observationDetails,
        ];
    }
}