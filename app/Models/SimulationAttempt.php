<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['student_id', 'simulation_scenario_id', 'selected_option_id', 'score', 'reward_points', 'completed_at'])]
class SimulationAttempt extends Model
{
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(SimulationScenario::class, 'simulation_scenario_id');
    }

    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(SimulationOption::class, 'selected_option_id');
    }

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'reward_points' => 'integer',
            'completed_at' => 'datetime',
        ];
    }
}
