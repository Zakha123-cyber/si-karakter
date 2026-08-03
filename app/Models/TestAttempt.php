<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['test_package_id', 'student_id', 'attempt_number', 'status', 'started_at', 'submitted_at', 'completed_at'])]
class TestAttempt extends Model
{
    use HasFactory;

    public function testPackage(): BelongsTo
    {
        return $this->belongsTo(TestPackage::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * @return HasMany<TestAnswer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(TestAnswer::class);
    }

    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
