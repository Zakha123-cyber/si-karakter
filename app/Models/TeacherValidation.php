<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['test_answer_id', 'ai_assessment_id', 'teacher_id', 'decision', 'final_moral_level', 'final_indicators_json', 'teacher_note', 'override_reason', 'validated_at'])]
class TeacherValidation extends Model
{
    public function testAnswer(): BelongsTo
    {
        return $this->belongsTo(TestAnswer::class);
    }

    public function aiAssessment(): BelongsTo
    {
        return $this->belongsTo(AiAssessment::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    protected function casts(): array
    {
        return [
            'final_indicators_json' => 'array',
            'validated_at' => 'datetime',
        ];
    }
}
