<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use App\Enums\AssessmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['test_answer_id', 'provider', 'model', 'moral_level', 'confidence', 'reasoning_summary', 'suggested_intervention', 'warning_signals_json', 'indicators_json', 'prompt_version', 'raw_response_json', 'status', 'error_message', 'processed_at'])]
class AiAssessment extends Model
{
    use HasFactory;

    public function testAnswer(): BelongsTo
    {
        return $this->belongsTo(TestAnswer::class);
    }

    public function teacherValidations(): HasMany
    {
        return $this->hasMany(TeacherValidation::class);
    }

    protected function casts(): array
    {
        return [
            'confidence' => 'decimal:4',
            'warning_signals_json' => 'array',
            'indicators_json' => 'array',
            'raw_response_json' => 'array',
            'status' => AssessmentStatus::class,
            'processed_at' => 'datetime',
        ];
    }
}
