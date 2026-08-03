<?php

namespace App\Domain\Scoring;

use App\Models\CharacterScoreSnapshot;
use App\Models\User;
use InvalidArgumentException;

class ScoreAdjustmentService
{
    public function __construct(
        private readonly MoralLevelMapper $levelMapper,
    ) {}

    /**
     * Terapkan adjustment manual pada snapshot.
     * manual_adjustment bersifat delta terhadap calculated_score.
     * Alasan wajib diisi; ustadz dapat override level final.
     */
    public function adjust(
        CharacterScoreSnapshot $snapshot,
        float $adjustment,
        string $reason,
        User $adjustedBy,
        ?string $overrideLevel = null,
    ): CharacterScoreSnapshot {
        if (trim($reason) === '') {
            throw new InvalidArgumentException('Alasan adjustment wajib diisi.');
        }

        $finalScore = round((float) $snapshot->calculated_score + $adjustment, 2);
        $finalScore = max(0.0, min(100.0, $finalScore));

        $snapshot->update([
            'manual_adjustment' => $adjustment,
            'final_score' => $finalScore,
            'final_level' => $overrideLevel ?? $this->levelMapper->levelForScore($finalScore),
            'adjusted_by' => $adjustedBy->id,
            'adjustment_reason' => $reason,
        ]);

        return $snapshot;
    }
}
