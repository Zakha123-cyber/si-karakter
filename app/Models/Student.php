<?php

namespace App\Models;

use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $student_code
 * @property Carbon|null $birth_date
 * @property string|null $gender
 * @property int|null $current_group_id
 * @property Carbon|null $enrollment_date
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'student_code', 'birth_date', 'gender', 'current_group_id', 'enrollment_date', 'status'])]
class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Group, $this>
     */
    public function currentGroup(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'current_group_id');
    }

    /**
     * @return HasMany<GroupStudentHistory, $this>
     */
    public function groupStudentHistories(): HasMany
    {
        return $this->hasMany(GroupStudentHistory::class);
    }

    /**
     * @return HasMany<ObservationEntry, $this>
     */
    public function observationEntries(): HasMany
    {
        return $this->hasMany(ObservationEntry::class);
    }

    /**
     * @return HasMany<TestAttempt, $this>
     */
    public function testAttempts(): HasMany
    {
        return $this->hasMany(TestAttempt::class);
    }

    /**
     * @return HasMany<GoodnessPointTransaction, $this>
     */
    public function goodnessPointTransactions(): HasMany
    {
        return $this->hasMany(GoodnessPointTransaction::class);
    }

    /**
     * @return HasMany<StudentWarning, $this>
     */
    public function warnings(): HasMany
    {
        return $this->hasMany(StudentWarning::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'enrollment_date' => 'date',
        ];
    }
}
