<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $teacher_id
 * @property Carbon $observed_at
 * @property string|null $general_note
 * @property string|null $sentiment
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['student_id', 'teacher_id', 'observed_at', 'general_note', 'sentiment'])]
class ObservationEntry extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * @return BelongsTo<Student, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * @return HasMany<ObservationItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(ObservationItem::class);
    }

    protected function casts(): array
    {
        return [
            'observed_at' => 'date',
        ];
    }
}
