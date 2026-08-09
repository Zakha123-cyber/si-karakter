<?php

namespace App\Models;

use Database\Factories\StudentWarningFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $warning_rule_id
 * @property string $source_type
 * @property int|null $source_id
 * @property string $title
 * @property string $description
 * @property string $severity
 * @property string $status
 * @property Carbon $detected_at
 * @property int|null $reviewed_by
 * @property Carbon|null $reviewed_at
 * @property string|null $resolution_note
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @method static Builder<static> open()
 */
#[Fillable(['student_id', 'warning_rule_id', 'source_type', 'source_id', 'title', 'description', 'severity', 'status', 'detected_at', 'reviewed_by', 'reviewed_at', 'resolution_note'])]
class StudentWarning extends Model
{
    /** @use HasFactory<StudentWarningFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Student, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * @return BelongsTo<WarningRule, $this>
     */
    public function warningRule(): BelongsTo
    {
        return $this->belongsTo(WarningRule::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * @param  Builder<StudentWarning>  $query
     * @return Builder<StudentWarning>
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', 'open');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'source_id' => 'integer',
            'detected_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }
}
