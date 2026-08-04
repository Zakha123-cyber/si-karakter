<?php

namespace App\Domain\Scoring;

class MoralLevelMapper
{
    public const PRE_CONVENTIONAL = 'pre_conventional';

    public const CONVENTIONAL = 'conventional';

    public const POST_CONVENTIONAL = 'post_conventional';

    /**
     * Batas skor: 0-33 pre_conventional, 34-66 conventional, 67-100 post_conventional.
     */
    public function levelForScore(float $score): string
    {
        return match (true) {
            $score < 34 => self::PRE_CONVENTIONAL,
            $score < 67 => self::CONVENTIONAL,
            default => self::POST_CONVENTIONAL,
        };
    }
}
