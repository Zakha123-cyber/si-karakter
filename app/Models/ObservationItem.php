<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['observation_entry_id', 'character_indicator_id', 'sentiment', 'assessment_score', 'reward_points', 'note'])]
class ObservationItem extends Model
{
    public function observationEntry(): BelongsTo
    {
        return $this->belongsTo(ObservationEntry::class);
    }

    public function characterIndicator(): BelongsTo
    {
        return $this->belongsTo(CharacterIndicator::class);
    }

    protected function casts(): array
    {
        return [
            'assessment_score' => 'decimal:2',
            'reward_points' => 'integer',
        ];
    }
}
