<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['student_id', 'period_start', 'period_end', 'status', 'test_summary_json', 'observation_summary_json', 'ai_generated_narrative', 'final_narrative', 'recommendation', 'teacher_id', 'pdf_path', 'published_at'])]
class CharacterReport extends Model
{
    use HasFactory;

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'test_summary_json' => 'array',
            'observation_summary_json' => 'array',
            'published_at' => 'datetime',
        ];
    }
}
