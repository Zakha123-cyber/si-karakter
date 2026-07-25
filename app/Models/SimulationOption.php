<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['simulation_scenario_id', 'text', 'feedback_text', 'score', 'reward_points', 'sort_order'])]
class SimulationOption extends Model
{
    use HasFactory;

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(SimulationScenario::class, 'simulation_scenario_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(SimulationAttempt::class, 'selected_option_id');
    }

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'reward_points' => 'integer',
            'sort_order' => 'integer',
        ];
    }
}
