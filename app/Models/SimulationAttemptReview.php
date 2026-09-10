<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $simulation_attempt_id
 * @property int $teacher_id
 * @property string|null $teacher_note
 * @property Carbon $reviewed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read SimulationAttempt $attempt
 * @property-read User $teacher
 */
#[Fillable(['simulation_attempt_id', 'teacher_id', 'teacher_note', 'reviewed_at'])]
class SimulationAttemptReview extends Model
{
    /**
     * @return BelongsTo<SimulationAttempt, $this>
     */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(SimulationAttempt::class, 'simulation_attempt_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }
}
