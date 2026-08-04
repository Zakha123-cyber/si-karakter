<?php

namespace App\Domain\Scoring;

class CombinedScoreResult
{
    public function __construct(
        public readonly ?float $score,
        public readonly ?float $testScore,
        public readonly ?float $observationScore,
        public readonly float $testWeight,
        public readonly float $observationWeight,
        public readonly bool $complete,
    ) {}
}
