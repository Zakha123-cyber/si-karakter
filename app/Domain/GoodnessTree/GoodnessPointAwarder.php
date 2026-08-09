<?php

namespace App\Domain\GoodnessTree;

use App\Models\GoodnessPointTransaction;
use App\Models\ObservationEntry;

class GoodnessPointAwarder
{
    public function syncObservationReward(ObservationEntry $entry): ?GoodnessPointTransaction
    {
        $entry->loadMissing('items');

        GoodnessPointTransaction::query()
            ->where('source_type', 'observation')
            ->where('source_id', $entry->id)
            ->delete();

        $totalPoints = (int) $entry->items->sum('reward_points');

        if ($totalPoints <= 0) {
            return null;
        }

        return GoodnessPointTransaction::query()->create([
            'student_id' => $entry->student_id,
            'source_type' => 'observation',
            'source_id' => $entry->id,
            'points' => $totalPoints,
            'description' => 'Poin observasi '.$entry->observed_at->toDateString(),
            'awarded_by' => $entry->teacher_id,
        ]);
    }
}
