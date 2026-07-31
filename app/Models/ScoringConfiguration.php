<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $test_weight
 * @property string $observation_weight
 * @property bool $is_active
 * @property Carbon $effective_from
 * @property Carbon|null $effective_until
 * @property int|null $created_by
 * @property-read User|null $creator
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'test_weight', 'observation_weight', 'is_active', 'effective_from', 'effective_until', 'created_by'])]
class ScoringConfiguration extends Model
{
    use HasFactory;

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected function casts(): array
    {
        return [
            'test_weight' => 'decimal:2',
            'observation_weight' => 'decimal:2',
            'is_active' => 'boolean',
            'effective_from' => 'date',
            'effective_until' => 'date',
        ];
    }
}
