<?php

namespace App\Models;

use Database\Factories\GoodnessPointTransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property string $source_type
 * @property int|null $source_id
 * @property int $points
 * @property string $description
 * @property int|null $awarded_by
 * @property Carbon|null $created_at
 * @property-read User|null $awardedBy
 */
#[Fillable(['student_id', 'source_type', 'source_id', 'points', 'description', 'awarded_by'])]
class GoodnessPointTransaction extends Model
{
    /** @use HasFactory<GoodnessPointTransactionFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

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
    public function awardedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'awarded_by');
    }

    /**
     * @return BelongsTo<ObservationEntry, $this>
     */
    public function observationEntry(): BelongsTo
    {
        return $this->belongsTo(ObservationEntry::class, 'source_id');
    }

    protected function casts(): array
    {
        return [
            'source_id' => 'integer',
            'points' => 'integer',
            'created_at' => 'datetime',
        ];
    }
}
