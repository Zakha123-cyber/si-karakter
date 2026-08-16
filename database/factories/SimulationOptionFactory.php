<?php

namespace Database\Factories;

use App\Models\SimulationOption;
use App\Models\SimulationScenario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SimulationOption>
 */
class SimulationOptionFactory extends Factory
{
    protected $model = SimulationOption::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'simulation_scenario_id' => SimulationScenario::factory(),
            'text' => fake()->sentence(),
            'feedback_text' => fake()->optional()->paragraph(),
            'score' => fake()->randomElement([0, 50, 100]),
            'reward_points' => fake()->randomElement([0, 2, 5, 10]),
            'sort_order' => 0,
        ];
    }
}
