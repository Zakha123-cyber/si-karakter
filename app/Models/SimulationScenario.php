<?php

namespace App\Models;

use App\Enums\SimulationScenarioStatus;
use Database\Factories\SimulationScenarioFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property string $opening_text
 * @property string|null $audio_path
 * @property string|null $image_path
 * @property SimulationScenarioStatus $status
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $creator
 * @property-read Collection<int, SimulationOption> $options
 * @property-read Collection<int, SimulationAttempt> $attempts
 */
#[Fillable(['title', 'description', 'opening_text', 'audio_path', 'image_path', 'status', 'created_by'])]
class SimulationScenario extends Model
{
    /** @use HasFactory<SimulationScenarioFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<SimulationOption, $this>
     */
    public function options(): HasMany
    {
        return $this->hasMany(SimulationOption::class);
    }

    /**
     * @return HasMany<SimulationAttempt, $this>
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(SimulationAttempt::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => SimulationScenarioStatus::class,
        ];
    }
}
