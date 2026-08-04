<?php

namespace App\Domain\Scoring;

use App\Models\ScoringConfiguration;

class CombinedScoreCalculator
{
    private const DEFAULT_TEST_WEIGHT = 60.0;

    private const DEFAULT_OBSERVATION_WEIGHT = 40.0;

    /**
     * Gabungkan skor tes dan observasi menggunakan bobot konfigurasi.
     * Bila salah satu komponen null, skor gabungan ikut null.
     */
    public function calculate(
        ?float $testScore,
        ?float $observationScore,
        ?ScoringConfiguration $configuration = null,
    ): CombinedScoreResult {
        $weights = $this->resolveWeights($configuration);

        if ($testScore === null || $observationScore === null) {
            return new CombinedScoreResult(
                null,
                $testScore,
                $observationScore,
                $weights['test'],
                $weights['observation'],
                false,
            );
        }

        $totalWeight = $weights['test'] + $weights['observation'];
        $score = round(
            ($testScore * $weights['test'] + $observationScore * $weights['observation']) / $totalWeight,
            2,
        );

        return new CombinedScoreResult(
            $score,
            $testScore,
            $observationScore,
            $weights['test'],
            $weights['observation'],
            true,
        );
    }

    /**
     * @return array{test: float, observation: float}
     */
    private function resolveWeights(?ScoringConfiguration $configuration): array
    {
        $config = $configuration ?? ScoringConfiguration::query()->where('is_active', true)->first();

        if ($config === null) {
            return [
                'test' => self::DEFAULT_TEST_WEIGHT,
                'observation' => self::DEFAULT_OBSERVATION_WEIGHT,
            ];
        }

        return [
            'test' => (float) $config->test_weight,
            'observation' => (float) $config->observation_weight,
        ];
    }
}
