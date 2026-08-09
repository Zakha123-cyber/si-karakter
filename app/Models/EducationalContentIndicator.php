<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['educational_content_id', 'character_indicator_id'])]
class EducationalContentIndicator extends Model
{
    /**
     * @return BelongsTo<EducationalContent, $this>
     */
    public function educationalContent(): BelongsTo
    {
        return $this->belongsTo(EducationalContent::class);
    }

    /**
     * @return BelongsTo<CharacterIndicator, $this>
     */
    public function characterIndicator(): BelongsTo
    {
        return $this->belongsTo(CharacterIndicator::class);
    }
}
