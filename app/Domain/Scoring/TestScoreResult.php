<?php

namespace App\Domain\Scoring;

class TestScoreResult
{
    /**
     * @param  array<int, array<string, mixed>>  $details
     */
    public function __construct(
        public readonly ?float $score,
        public readonly array $details,
        public readonly int $validatedAnswers,
        public readonly int $totalAnswers,
    ) {}
}
