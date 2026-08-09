<?php

namespace App\Domain\GoodnessTree;

use App\Models\GoodnessTreeLevel;

readonly class GoodnessTreeProgress
{
    /**
     * @param  array<int, GoodnessTreeLevel>  $levels
     */
    public function __construct(
        public int $points,
        public ?GoodnessTreeLevel $currentLevel,
        public ?GoodnessTreeLevel $nextLevel,
        public int $progressPercent,
        public int $pointsToNextLevel,
        public array $levels,
    ) {}

    public function isMaxLevel(): bool
    {
        return $this->currentLevel !== null && $this->nextLevel === null;
    }
}
