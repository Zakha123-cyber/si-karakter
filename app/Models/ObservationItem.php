<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $observation_entry_id
 * @property int $character_indicator_id
 * @property string $sentiment
 * @property string|null $assessment_score
 * @property int $reward_points
 * @property string|null $note
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['observation_entry_id', 'character_indicator_id', 'sentiment', 'assessment_score', 'reward_points', 'note'])]
class ObservationItem extends Model
{
    public function observationEntry(): BelongsTo
    {
        return $this->belongsTo(ObservationEntry::class);
    }

    /**
     * @return BelongsTo<CharacterIndicator, $this>
     */
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
