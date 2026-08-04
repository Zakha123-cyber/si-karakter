<?php

namespace App\Domain\Scoring;

class ObservationScoreResult
{
    /**
     * @param  array<int, array<string, mixed>>  $details
     */
    public function __construct(
        public readonly ?float $score,
        public readonly array $details,
        public readonly int $countedItems,
        public readonly int $totalItems,
    ) {}
}
