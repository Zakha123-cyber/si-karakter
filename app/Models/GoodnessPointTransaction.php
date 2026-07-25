<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['student_id', 'source_type', 'source_id', 'points', 'description', 'awarded_by'])]
class GoodnessPointTransaction extends Model
{
    public const UPDATED_AT = null;

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function awardedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'awarded_by');
    }

    protected function casts(): array
    {
        return [
            'source_id' => 'integer',
            'points' => 'integer',
        ];
    }
}
