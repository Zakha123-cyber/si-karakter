<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['moral_case_id', 'character_indicator_id', 'weight'])]
class MoralCaseIndicator extends Model
{
    /**
     * @return BelongsTo<MoralCase, $this>
     */
    public function moralCase(): BelongsTo
    {
        return $this->belongsTo(MoralCase::class);
    }

    /**
     * @return BelongsTo<CharacterIndicator, $this>
     */
    public function characterIndicator(): BelongsTo
    {
        return $this->belongsTo(CharacterIndicator::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'weight' => 'decimal:2',
        ];
    }
}
