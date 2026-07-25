<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['student_id', 'period_start', 'period_end', 'test_score', 'observation_score', 'calculated_score', 'manual_adjustment', 'final_score', 'final_level', 'adjusted_by', 'adjustment_reason', 'calculation_detail_json'])]
class CharacterScoreSnapshot extends Model
{
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function adjustedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'test_score' => 'decimal:2',
            'observation_score' => 'decimal:2',
            'calculated_score' => 'decimal:2',
            'manual_adjustment' => 'decimal:2',
            'final_score' => 'decimal:2',
            'calculation_detail_json' => 'array',
        ];
    }
}
