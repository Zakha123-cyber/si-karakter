<?php

namespace Database\Factories;

use App\Models\SimulationAttempt;
use App\Models\SimulationOption;
use App\Models\SimulationScenario;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SimulationAttempt>
 */
class SimulationAttemptFactory extends Factory
{
    protected $model = SimulationAttempt::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $scenario = SimulationScenario::factory()->create();
        $option = SimulationOption::factory()->create([
            'simulation_scenario_id' => $scenario->id,
        ]);

        return [
            'student_id' => Student::factory(),
            'simulation_scenario_id' => $scenario->id,
            'selected_option_id' => $option->id,
            'score' => $option->score,
            'reward_points' => $option->reward_points,
            'completed_at' => now(),
        ];
    }
}
