<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['moral_case_id', 'label', 'text', 'internal_value', 'sort_order', 'is_active'])]
class MoralCaseOption extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<MoralCase, $this>
     */
    public function moralCase(): BelongsTo
    {
        return $this->belongsTo(MoralCase::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
