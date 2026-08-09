<?php

namespace App\Domain\Scoring;

use App\Models\CharacterScoreSnapshot;
use App\Models\Student;
use Carbon\CarbonInterface;

class CharacterScoreSnapshotService
{
    public function __construct(
        private readonly TestScoreCalculator $testCalculator,
        private readonly ObservationScoreCalculator $observationCalculator,
        private readonly CombinedScoreCalculator $combinedCalculator,
        private readonly MoralLevelMapper $levelMapper,
    ) {}

    /**
     * Generate snapshot skor santri untuk satu periode.
     * Membutuhkan skor tes dan observasi lengkap; bila belum lengkap
     * snapshot tidak dibuat. Snapshot yang sudah di-adjust tidak ditimpa.
     */
    public function generateForStudent(
        Student $student,
        CarbonInterface $periodStart,
        CarbonInterface $periodEnd,
    ): ?CharacterScoreSnapshot {
        $existing = CharacterScoreSnapshot::query()
            ->where('student_id', $student->id)
            ->whereDate('period_start', $periodStart->toDateString())
            ->whereDate('period_end', $periodEnd->toDateString())
            ->first();

        if ($existing !== null && $existing->manual_adjustment !== null) {
            return $existing;
        }

        $testResult = $this->testCalculator->calculateForPeriod($student, $periodStart, $periodEnd);
        $observationResult = $this->observationCalculator->calculateForPeriod($student, $periodStart, $periodEnd);
        $combined = $this->combinedCalculator->calculate($testResult->score, $observationResult->score);

        if (! $combined->complete) {
            return null;
        }

        $payload = [
            'student_id' => $student->id,
            'period_start' => $periodStart->toDateString(),
            'period_end' => $periodEnd->toDateString(),
            'test_score' => $combined->testScore,
            'observation_score' => $combined->observationScore,
            'calculated_score' => $combined->score,
            'final_score' => $combined->score,
            'final_level' => $this->levelMapper->levelForScore($combined->score),
            'calculation_detail_json' => [
                'test' => $testResult->details,
                'observation' => $observationResult->details,
                'weights' => [
                    'test' => $combined->testWeight,
                    'observation' => $combined->observationWeight,
                ],
            ],
        ];

        if ($existing !== null) {
            $existing->update($payload);

            return $existing;
        }

        return CharacterScoreSnapshot::query()->create($payload);
    }
}
