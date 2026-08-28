<?php

namespace App\Models;

use App\Enums\ContentEmotionResponse;
use Database\Factories\ContentInteractionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $educational_content_id
 * @property ContentEmotionResponse|null $emotion_response
 * @property Carbon|null $started_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Student|null $student
 * @property-read EducationalContent|null $educationalContent
 */
#[Fillable(['student_id', 'educational_content_id', 'emotion_response', 'started_at', 'completed_at'])]
class ContentInteraction extends Model
{
    /** @use HasFactory<ContentInteractionFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Student, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * @return BelongsTo<EducationalContent, $this>
     */
    public function educationalContent(): BelongsTo
    {
        return $this->belongsTo(EducationalContent::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'emotion_response' => ContentEmotionResponse::class,
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
