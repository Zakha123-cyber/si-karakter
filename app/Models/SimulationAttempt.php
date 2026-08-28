<?php

namespace App\Models;

use Database\Factories\SimulationAttemptFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $simulation_scenario_id
 * @property int $selected_option_id
 * @property string $score
 * @property int $reward_points
 * @property Carbon $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Student $student
 * @property-read SimulationScenario $scenario
 * @property-read SimulationOption $selectedOption
 */
#[Fillable(['student_id', 'simulation_scenario_id', 'selected_option_id', 'score', 'reward_points', 'completed_at'])]
class SimulationAttempt extends Model
{
    /** @use HasFactory<SimulationAttemptFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Student, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * @return BelongsTo<SimulationScenario, $this>
     */
    public function scenario(): BelongsTo
    {
        return $this->belongsTo(SimulationScenario::class, 'simulation_scenario_id');
    }

    /**
     * @return BelongsTo<SimulationOption, $this>
     */
    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(SimulationOption::class, 'selected_option_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'reward_points' => 'integer',
            'completed_at' => 'datetime',
        ];
    }
}
