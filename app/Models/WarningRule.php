<?php

namespace App\Models;

use Database\Factories\WarningRuleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $rule_type
 * @property array<string, mixed> $conditions_json
 * @property string $severity
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @method static Builder<static> active()
 */
#[Fillable(['name', 'description', 'rule_type', 'conditions_json', 'severity', 'is_active'])]
class WarningRule extends Model
{
    /** @use HasFactory<WarningRuleFactory> */
    use HasFactory;

    /**
     * @return HasMany<StudentWarning, $this>
     */
    public function studentWarnings(): HasMany
    {
        return $this->hasMany(StudentWarning::class);
    }

    /**
     * @param  Builder<WarningRule>  $query
     * @return Builder<WarningRule>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'conditions_json' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
