<?php

namespace App\Domain\Reporting;

use App\Domain\Scoring\ObservationScoreCalculator;
use App\Domain\Scoring\TestScoreCalculator;
use App\Models\Student;
use Carbon\CarbonInterface;

class ReportSummaryBuilder
{
    public function __construct(
        private readonly TestScoreCalculator $testCalculator,
        private readonly ObservationScoreCalculator $observationCalculator,
    ) {}

    /**
     * Bangun rekap tes dan observasi untuk satu santri pada rentang periode.
     * Skor memakai hasil perhitungan yang sama dengan snapshot skor.
     */
    public function buildForPeriod(
        Student $student,
        CarbonInterface $periodStart,
        CarbonInterface $periodEnd,
    ): ReportSummary {
        $testResult = $this->testCalculator->calculateForPeriod($student, $periodStart, $periodEnd);
        $observationResult = $this->observationCalculator->calculateForPeriod($student, $periodStart, $periodEnd);

        return new ReportSummary(
            testScore: $testResult->score,
            testValidatedAnswers: $testResult->validatedAnswers,
            testTotalAnswers: $testResult->totalAnswers,
            testDetails: $testResult->details,
            observationScore: $observationResult->score,
            observationCountedItems: $observationResult->countedItems,
            observationTotalItems: $observationResult->totalItems,
            observationDetails: $observationResult->details,
        );
    }
}
