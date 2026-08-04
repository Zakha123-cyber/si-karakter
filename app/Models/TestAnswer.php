<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['test_attempt_id', 'moral_case_id', 'selected_option_id', 'typed_reason', 'final_transcript', 'answer_status'])]
class TestAnswer extends Model
{
    use HasFactory;

    public function testAttempt(): BelongsTo
    {
        return $this->belongsTo(TestAttempt::class);
    }

    public function moralCase(): BelongsTo
    {
        return $this->belongsTo(MoralCase::class);
    }

    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(MoralCaseOption::class, 'selected_option_id');
    }

    public function audioFiles(): HasMany
    {
        return $this->hasMany(AnswerAudioFile::class);
    }

    public function transcriptions(): HasMany
    {
        return $this->hasMany(Transcription::class);
    }

    public function aiAssessments(): HasMany
    {
        return $this->hasMany(AiAssessment::class);
    }

    /**
     * @return HasMany<TeacherValidation, $this>
     */
    public function teacherValidations(): HasMany
    {
        return $this->hasMany(TeacherValidation::class);
    }
}
